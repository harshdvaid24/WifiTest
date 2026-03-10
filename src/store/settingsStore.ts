import {create} from 'zustand';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV();

interface SettingsState {
  lockedBSSID: string | null;
  baselineVariance: number;
  scanIntervalMs: number;
  sensitivity: number;
  smartHomeUrl: string;
  onboardingDone: boolean;
  darkMode: boolean;
  // Actions
  setLockedBSSID: (bssid: string) => void;
  setBaselineVariance: (variance: number) => void;
  setScanInterval: (ms: number) => void;
  setSensitivity: (value: number) => void;
  setSmartHomeUrl: (url: string) => void;
  setOnboardingDone: (done: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  loadFromStorage: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  lockedBSSID: null,
  baselineVariance: 1.0,
  scanIntervalMs: 2000,
  sensitivity: 1.0,
  smartHomeUrl: '',
  onboardingDone: false,
  darkMode: false,

  setLockedBSSID: (bssid: string) => {
    storage.set('locked_bssid', bssid);
    set({lockedBSSID: bssid});
  },

  setBaselineVariance: (variance: number) => {
    storage.set('baseline_variance', variance);
    set({baselineVariance: variance});
  },

  setScanInterval: (ms: number) => {
    storage.set('scan_interval_ms', ms);
    set({scanIntervalMs: ms});
  },

  setSensitivity: (value: number) => {
    storage.set('sensitivity', value);
    set({sensitivity: value});
  },

  setSmartHomeUrl: (url: string) => {
    storage.set('smarthome_url', url);
    set({smartHomeUrl: url});
  },

  setOnboardingDone: (done: boolean) => {
    storage.set('onboarding_done', done);
    set({onboardingDone: done});
  },

  setDarkMode: (enabled: boolean) => {
    storage.set('dark_mode', enabled);
    set({darkMode: enabled});
  },

  loadFromStorage: () => {
    set({
      lockedBSSID: storage.getString('locked_bssid') ?? null,
      baselineVariance: storage.getNumber('baseline_variance') ?? 1.0,
      scanIntervalMs: storage.getNumber('scan_interval_ms') ?? 2000,
      sensitivity: storage.getNumber('sensitivity') ?? 1.0,
      smartHomeUrl: storage.getString('smarthome_url') ?? '',
      onboardingDone: storage.getBoolean('onboarding_done') ?? false,
      darkMode: storage.getBoolean('dark_mode') ?? false,
    });
  },
}));
