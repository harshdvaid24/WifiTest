import {NativeModules, NativeEventEmitter} from 'react-native';

const {WifiScanner} = NativeModules;
export const WifiScannerEmitter = new NativeEventEmitter(WifiScanner);

export interface APResult {
  bssid: string;
  ssid: string;
  rssi: number;
  frequency: number;
}

export interface ScanPayload {
  timestamp: number;
  results: APResult[];
}

export const startScanning = (intervalMs = 2000): Promise<string> =>
  WifiScanner.startScanning(intervalMs);

export const stopScanning = (): Promise<string> => WifiScanner.stopScanning();
