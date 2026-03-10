import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useSettingsStore} from '../store/settingsStore';
import {useSensorStore} from '../store/sensorStore';

export function SmartHomeScreen() {
  const smartHomeUrl = useSettingsStore(s => s.smartHomeUrl);
  const setSmartHomeUrl = useSettingsStore(s => s.setSmartHomeUrl);
  const presence = useSensorStore(s => s.presence);
  const activityState = useSensorStore(s => s.activityState);

  const [url, setUrl] = useState(smartHomeUrl);
  const [autoAC, setAutoAC] = useState(false);
  const [acOnPresence, setAcOnPresence] = useState(true);
  const [acOffEmpty, setAcOffEmpty] = useState(true);
  const [sleepMode, setSleepMode] = useState(false);

  const saveUrl = () => {
    setSmartHomeUrl(url);
    Alert.alert('Saved', 'SmartAC backend URL updated');
  };

  const testConnection = async () => {
    if (!url) {
      Alert.alert('Error', 'Enter a URL first');
      return;
    }
    try {
      const response = await fetch(url + '/health', {method: 'GET'});
      if (response.ok) {
        Alert.alert('Success', 'Connected to SmartAC backend');
      } else {
        Alert.alert('Error', `Server responded with ${response.status}`);
      }
    } catch (e: any) {
      Alert.alert('Error', `Connection failed: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartAC Bridge</Text>
      <Text style={styles.subtitle}>
        Automate your AC based on presence and activity
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current State</Text>
        <Text style={styles.statusValue}>
          {presence ? 'Present' : 'Empty'} | {activityState}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.1.x:8080"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={saveUrl}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBtn} onPress={testConnection}>
            <Text style={styles.testBtnText}>Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Automation Rules</Text>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleLabel}>Auto AC Control</Text>
            <Text style={styles.ruleDesc}>
              Enable automatic AC management
            </Text>
          </View>
          <Switch value={autoAC} onValueChange={setAutoAC} />
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleLabel}>AC On When Present</Text>
            <Text style={styles.ruleDesc}>
              Turn AC on when presence detected
            </Text>
          </View>
          <Switch
            value={acOnPresence}
            onValueChange={setAcOnPresence}
            disabled={!autoAC}
          />
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleLabel}>AC Off When Empty</Text>
            <Text style={styles.ruleDesc}>
              Turn AC off after room is empty for 5 min
            </Text>
          </View>
          <Switch
            value={acOffEmpty}
            onValueChange={setAcOffEmpty}
            disabled={!autoAC}
          />
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleLabel}>Sleep Mode</Text>
            <Text style={styles.ruleDesc}>
              Reduce AC when sleeping detected
            </Text>
          </View>
          <Switch
            value={sleepMode}
            onValueChange={setSleepMode}
            disabled={!autoAC}
          />
        </View>
      </View>
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    color: '#1565C0',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
    marginTop: 4,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  testBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  testBtnText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  ruleDesc: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
});
