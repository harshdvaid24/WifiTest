import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSensorStore} from '../store/sensorStore';
import {useWifiScanner} from '../hooks/useWifiScanner';
import {PresenceBadge} from '../components/PresenceBadge';
import {ActivityCard} from '../components/ActivityCard';
import {BreathingChart} from '../components/BreathingChart';
import {OccupancyBadge} from '../components/OccupancyBadge';
import {MotionGauge} from '../components/MotionGauge';
import {RSSISparkline} from '../components/RSSISparkline';
import {useSettingsStore} from '../store/settingsStore';

export function DashboardScreen() {
  const scanIntervalMs = useSettingsStore(s => s.scanIntervalMs);
  useWifiScanner(scanIntervalMs);

  const presence = useSensorStore(s => s.presence);
  const presenceConf = useSensorStore(s => s.presenceConfidence);
  const activityState = useSensorStore(s => s.activityState);
  const activityConf = useSensorStore(s => s.activityConf);
  const activityProbs = useSensorStore(s => s.activityProbs);
  const breathingBPM = useSensorStore(s => s.breathingBPM);
  const breathingConf = useSensorStore(s => s.breathingConf);
  const occupancyCount = useSensorStore(s => s.occupancyCount);
  const occupancyConf = useSensorStore(s => s.occupancyConf);
  const motionLevel = useSensorStore(s => s.motionLevel);
  const motionDelta = useSensorStore(s => s.motionDelta);
  const lockedBSSID = useSensorStore(s => s.lockedBSSID);
  const buffer = useSensorStore(s => s.buffer);
  const scanCount = useSensorStore(s => s.scanCount);

  const rssiValues = lockedBSSID ? buffer.getForBSSID(lockedBSSID) : [];
  const currentRSSI =
    rssiValues.length > 0 ? rssiValues[rssiValues.length - 1] : 0;

  const breathingValid = breathingBPM !== null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>WiFi Sense</Text>
        <Text style={styles.scanCount}>Scans: {scanCount}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.widget}>
          <PresenceBadge present={presence} confidence={presenceConf} />
        </View>

        <View style={styles.widget}>
          <ActivityCard
            activity={activityState}
            confidence={activityConf}
            probs={activityProbs}
          />
        </View>

        <View style={styles.widget}>
          <BreathingChart
            bpm={breathingBPM}
            confidence={breathingConf}
            valid={breathingValid}
            rssiValues={rssiValues}
          />
        </View>

        <View style={styles.widget}>
          <OccupancyBadge count={occupancyCount} confidence={occupancyConf} />
        </View>

        <View style={styles.widget}>
          <MotionGauge level={motionLevel} delta={motionDelta} />
        </View>

        <View style={styles.widget}>
          <RSSISparkline rssi={currentRSSI} values={rssiValues} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  scanCount: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  widget: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
});
