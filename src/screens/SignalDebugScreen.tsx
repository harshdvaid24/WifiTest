import React from 'react';
import {View, Text, StyleSheet, ScrollView, FlatList} from 'react-native';
import {useSensorStore} from '../store/sensorStore';
import {useWifiScanner} from '../hooks/useWifiScanner';

export function SignalDebugScreen() {
  useWifiScanner(2000);

  const lastScan = useSensorStore(s => s.lastScan);
  const lockedBSSID = useSensorStore(s => s.lockedBSSID);
  const buffer = useSensorStore(s => s.buffer);
  const scanCount = useSensorStore(s => s.scanCount);

  const variance = lockedBSSID ? buffer.getVariance(lockedBSSID) : 0;
  const mean = lockedBSSID ? buffer.getMean(lockedBSSID) : 0;
  const rssiValues = lockedBSSID ? buffer.getForBSSID(lockedBSSID) : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Signal Debug</Text>
        <Text style={styles.scanCount}>Scan #{scanCount}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mean.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Mean (dBm)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{variance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Variance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{rssiValues.length}</Text>
          <Text style={styles.statLabel}>Samples</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>RSSI Timeline (Locked AP)</Text>
        <View style={styles.miniChart}>
          {rssiValues.map((v, i) => {
            const min = -90;
            const max = -20;
            const height = ((v - min) / (max - min)) * 60;
            return (
              <View
                key={i}
                style={[
                  styles.chartBar,
                  {height: Math.max(2, height)},
                ]}
              />
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Visible APs</Text>
      {lastScan?.results.map(ap => (
        <View
          key={ap.bssid}
          style={[
            styles.apRow,
            ap.bssid === lockedBSSID && styles.apRowLocked,
          ]}>
          <View style={styles.apInfo}>
            <Text style={styles.apSSID}>
              {ap.ssid || '(Hidden)'}
              {ap.bssid === lockedBSSID ? ' [LOCKED]' : ''}
            </Text>
            <Text style={styles.apBSSID}>{ap.bssid}</Text>
          </View>
          <View style={styles.apStats}>
            <Text style={styles.apRSSI}>{ap.rssi} dBm</Text>
            <Text style={styles.apFreq}>{ap.frequency} MHz</Text>
          </View>
        </View>
      ))}
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
    fontSize: 13,
    color: '#9E9E9E',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  chartContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  chartBar: {
    flex: 1,
    backgroundColor: '#FF5722',
    borderRadius: 1,
    opacity: 0.7,
  },
  apRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    elevation: 1,
  },
  apRowLocked: {
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  apInfo: {
    flex: 1,
  },
  apSSID: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  apBSSID: {
    fontSize: 11,
    color: '#9E9E9E',
    fontFamily: 'monospace',
  },
  apStats: {
    alignItems: 'flex-end',
  },
  apRSSI: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
  },
  apFreq: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});
