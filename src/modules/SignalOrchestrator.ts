import {RSSIBuffer} from './RSSIBuffer';
import {PresenceDetector} from './PresenceDetector';
import {MotionClassifier} from './MotionClassifier';
import {BreathingEstimator} from './BreathingEstimator';
import {OccupancyEstimator} from './OccupancyEstimator';
import {ActivityClassifier} from './ActivityClassifier';

export interface OrchestratorOutput {
  presence: boolean;
  presenceConfidence: number;
  motionLevel: 'none' | 'low' | 'medium' | 'high';
  motionDelta: number;
  breathingBPM: number | null;
  breathingConf: number;
  occupancyCount: number;
  occupancyConf: number;
  activityState: 'sleeping' | 'sitting' | 'walking' | 'unknown';
  activityConf: number;
  activityProbs: Record<string, number>;
}

export class SignalOrchestrator {
  private presenceDetector: PresenceDetector;
  private motionClassifier: MotionClassifier;
  private breathingEstimator: BreathingEstimator;
  private occupancyEstimator: OccupancyEstimator;
  private activityClassifier: ActivityClassifier;

  constructor(scanIntervalMs = 2000) {
    this.presenceDetector = new PresenceDetector();
    this.motionClassifier = new MotionClassifier();
    this.breathingEstimator = new BreathingEstimator(scanIntervalMs);
    this.occupancyEstimator = new OccupancyEstimator();
    this.activityClassifier = new ActivityClassifier();
  }

  async init(): Promise<void> {
    await this.activityClassifier.loadModel();
  }

  setBaselineVariance(variance: number): void {
    this.presenceDetector.setBaseline(variance);
  }

  setSensitivity(sensitivity: number): void {
    this.motionClassifier.setSensitivity(sensitivity);
  }

  async process(
    buffer: RSSIBuffer,
    bssid: string,
  ): Promise<OrchestratorOutput> {
    const presenceResult = this.presenceDetector.detect(buffer, bssid);
    const motionResult = this.motionClassifier.classify(buffer, bssid);
    const breathingResult = this.breathingEstimator.estimate(
      buffer,
      bssid,
      motionResult.level,
    );
    const occupancyResult = this.occupancyEstimator.estimate(buffer, bssid);
    const activityResult = await this.activityClassifier.classify(
      buffer,
      bssid,
    );

    return {
      presence: presenceResult.present,
      presenceConfidence: presenceResult.confidence,
      motionLevel: motionResult.level,
      motionDelta: motionResult.delta,
      breathingBPM: breathingResult.bpm,
      breathingConf: breathingResult.confidence,
      occupancyCount: occupancyResult.count,
      occupancyConf: occupancyResult.confidence,
      activityState: activityResult.activity,
      activityConf: activityResult.confidence,
      activityProbs: activityResult.probs,
    };
  }
}
