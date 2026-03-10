import {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  WifiScannerEmitter,
  startScanning,
  stopScanning,
  ScanPayload,
} from '../native/WifiScanner';
import {useSensorStore} from '../store/sensorStore';

export function useWifiScanner(intervalMs = 2000) {
  const pushScan = useSensorStore(s => s.pushScan);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (Platform.OS !== 'android') return;

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'WiFi Sense needs Location',
          message: 'Required by Android to read WiFi signals.',
          buttonPositive: 'Allow',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      if (!mounted) return;
      await startScanning(intervalMs);
    }

    init();

    const sub = WifiScannerEmitter.addListener(
      'WifiScanResult',
      (payload: ScanPayload) => {
        if (mounted) pushScan(payload);
      },
    );

    return () => {
      mounted = false;
      sub.remove();
      stopScanning();
    };
  }, [intervalMs, pushScan]);
}
