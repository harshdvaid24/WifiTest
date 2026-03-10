import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  WifiScannerEmitter,
  startScanning,
  stopScanning,
  APResult,
  ScanPayload,
} from '../native/WifiScanner';
import {useSensorStore} from '../store/sensorStore';
import {useSettingsStore} from '../store/settingsStore';

interface Props {
  onComplete: () => void;
}

export function RouterSetupScreen({onComplete}: Props) {
  const [aps, setAps] = useState<APResult[]>([]);
  const [scanning, setScanning] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const setLockBSSID = useSensorStore(s => s.setLockBSSID);
  const setSettingsBSSID = useSettingsStore(s => s.setLockedBSSID);

  useEffect(() => {
    startScanning(3000);

    const sub = WifiScannerEmitter.addListener(
      'WifiScanResult',
      (payload: ScanPayload) => {
        setAps(payload.results.sort((a, b) => b.rssi - a.rssi));
        setScanning(false);
      },
    );

    return () => {
      sub.remove();
      stopScanning();
    };
  }, []);

  const handleSelect = (bssid: string) => {
    setSelected(bssid);
    setLockBSSID(bssid);
    setSettingsBSSID(bssid);
  };

  const getSignalBars = (rssi: number): string => {
    if (rssi >= -50) return '\u{2588}\u{2588}\u{2588}\u{2588}';
    if (rssi >= -60) return '\u{2588}\u{2588}\u{2588}\u{2591}';
    if (rssi >= -70) return '\u{2588}\u{2588}\u{2591}\u{2591}';
    return '\u{2588}\u{2591}\u{2591}\u{2591}';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Router</Text>
      <Text style={styles.subtitle}>
        Tap your JioFiber router to lock WiFi Sense onto it
      </Text>

      {scanning ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Scanning for networks...</Text>
        </View>
      ) : (
        <FlatList
          data={aps}
          keyExtractor={item => item.bssid}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.apItem,
                selected === item.bssid && styles.apItemSelected,
              ]}
              onPress={() => handleSelect(item.bssid)}>
              <View style={styles.apInfo}>
                <Text style={styles.apSSID}>
                  {item.ssid || '(Hidden Network)'}
                </Text>
                <Text style={styles.apBSSID}>{item.bssid}</Text>
              </View>
              <View style={styles.apSignal}>
                <Text style={styles.signalBars}>
                  {getSignalBars(item.rssi)}
                </Text>
                <Text style={styles.rssiValue}>{item.rssi} dBm</Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}

      {selected && (
        <TouchableOpacity style={styles.continueBtn} onPress={onComplete}>
          <Text style={styles.continueText}>Continue with Selected Router</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  apItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  apItemSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  apInfo: {
    flex: 1,
  },
  apSSID: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  apBSSID: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  apSignal: {
    alignItems: 'flex-end',
  },
  signalBars: {
    fontSize: 14,
    color: '#4CAF50',
    letterSpacing: 1,
  },
  rssiValue: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  continueBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 16,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
