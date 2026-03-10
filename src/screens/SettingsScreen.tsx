import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useSettingsStore} from '../store/settingsStore';

interface Props {
  onRecalibrate: () => void;
  onResetRouter: () => void;
}

export function SettingsScreen({onRecalibrate, onResetRouter}: Props) {
  const scanIntervalMs = useSettingsStore(s => s.scanIntervalMs);
  const sensitivity = useSettingsStore(s => s.sensitivity);
  const darkMode = useSettingsStore(s => s.darkMode);
  const lockedBSSID = useSettingsStore(s => s.lockedBSSID);
  const baselineVariance = useSettingsStore(s => s.baselineVariance);
  const setScanInterval = useSettingsStore(s => s.setScanInterval);
  const setSensitivity = useSettingsStore(s => s.setSensitivity);
  const setDarkMode = useSettingsStore(s => s.setDarkMode);

  const intervalOptions = [1000, 2000, 3000, 5000];
  const sensitivityOptions = [0.5, 1.0, 1.5, 2.0];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan Interval</Text>
        <View style={styles.optionRow}>
          {intervalOptions.map(ms => (
            <TouchableOpacity
              key={ms}
              style={[
                styles.optionChip,
                scanIntervalMs === ms && styles.optionChipActive,
              ]}
              onPress={() => setScanInterval(ms)}>
              <Text
                style={[
                  styles.optionText,
                  scanIntervalMs === ms && styles.optionTextActive,
                ]}>
                {ms / 1000}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motion Sensitivity</Text>
        <View style={styles.optionRow}>
          {sensitivityOptions.map(val => (
            <TouchableOpacity
              key={val}
              style={[
                styles.optionChip,
                sensitivity === val && styles.optionChipActive,
              ]}
              onPress={() => setSensitivity(val)}>
              <Text
                style={[
                  styles.optionText,
                  sensitivity === val && styles.optionTextActive,
                ]}>
                {val}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Router</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Locked BSSID</Text>
          <Text style={styles.infoValue}>
            {lockedBSSID || 'Not set'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Baseline Variance</Text>
          <Text style={styles.infoValue}>{baselineVariance.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={onResetRouter}>
          <Text style={styles.actionBtnText}>Change Router</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calibration</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={onRecalibrate}>
          <Text style={styles.actionBtnText}>Recalibrate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          WiFi Sense v1.0.0{'\n'}
          On-device RSSI sensing for JioFiber{'\n'}
          No cloud. No camera. No backend.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
  },
  settingLabel: {
    fontSize: 14,
    color: '#212121',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    fontFamily: 'monospace',
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
    marginTop: 8,
  },
  actionBtnText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  aboutText: {
    fontSize: 13,
    color: '#9E9E9E',
    lineHeight: 20,
  },
});
