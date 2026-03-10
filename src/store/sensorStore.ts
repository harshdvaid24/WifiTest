import {create} from 'zustand';
import {ScanPayload} from '../native/WifiScanner';
import {RSSIBuffer} from '../modules/RSSIBuffer';
import {SignalOrchestrator} from '../modules/SignalOrchestrator';

interface SensorState {
  buffer: RSSIBuffer;
  orchestrator: SignalOrchestrator;
  lastScan: ScanPayload | null;
  lockedBSSID: string | null;
  presence: boolean;
  presenceConfidence: number;
  motionLevel: 'none' | 'low' | 'medium' | 'high';
  motionDelta: number;
  breathingBPM: number | null;
  breathingConf: number;
  activityState: 'sleeping' | 'sitting' | 'walking' | 'unknown';
  activityConf: number;
  activityProbs: Record<string, number>;
  occupancyCount: number;
  occupancyConf: number;
  scanCount: number;
  pushScan: (payload: ScanPayload) => void;
  setLockBSSID: (bssid: string) => void;
  initOrchestrator: () => Promise<void>;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  buffer: new RSSIBuffer(30),
  orchestrator: new SignalOrchestrator(),
  lastScan: null,
  lockedBSSID: null,
  presence: false,
  presenceConfidence: 0,
  motionLevel: 'none',
  motionDelta: 0,
  breathingBPM: null,
  breathingConf: 0,
  activityState: 'unknown',
  activityConf: 0,
  activityProbs: {},
  occupancyCount: 0,
  occupancyConf: 0,
  scanCount: 0,

  pushScan: async (payload: ScanPayload) => {
    const {buffer, lockedBSSID, orchestrator, scanCount} = get();
    buffer.push(payload, lockedBSSID);

    set({lastScan: payload, scanCount: scanCount + 1});

    if (lockedBSSID) {
      try {
        const result = await orchestrator.process(buffer, lockedBSSID);
        set({
          presence: result.presence,
          presenceConfidence: result.presenceConfidence,
          motionLevel: result.motionLevel,
          motionDelta: result.motionDelta,
          breathingBPM: result.breathingBPM,
          breathingConf: result.breathingConf,
          occupancyCount: result.occupancyCount,
          occupancyConf: result.occupancyConf,
          activityState: result.activityState,
          activityConf: result.activityConf,
          activityProbs: result.activityProbs,
        });
      } catch (e) {
        console.warn('Signal processing error:', e);
      }
    }
  },

  setLockBSSID: (bssid: string) => set({lockedBSSID: bssid}),

  initOrchestrator: async () => {
    const {orchestrator} = get();
    await orchestrator.init();
  },
}));
