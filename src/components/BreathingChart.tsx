import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

interface Props {
  bpm: number | null;
  confidence: number;
  valid: boolean;
  rssiValues: number[];
}

const CHART_WIDTH = Dimensions.get('window').width / 2 - 40;
const CHART_HEIGHT = 50;

export function BreathingChart({bpm, confidence, valid, rssiValues}: Props) {
  const displayBPM = valid && bpm !== null ? `${bpm}` : '--';

  // Simple inline sparkline using View bars
  const recent = rssiValues.slice(-20);
  const min = Math.min(...recent, -80);
  const max = Math.max(...recent, -20);
  const range = max - min || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.value}>{displayBPM}</Text>
      <Text style={styles.unit}>BPM</Text>

      <View style={styles.chartContainer}>
        {recent.map((v, i) => {
          const height = ((v - min) / range) * CHART_HEIGHT;
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.max(2, height),
                  backgroundColor: valid ? '#2196F3' : '#BDBDBD',
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={styles.sub}>
        Breathing {valid ? `${Math.round(confidence * 100)}%` : 'collecting...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2196F3',
  },
  unit: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    width: CHART_WIDTH,
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 1,
    minWidth: 2,
  },
  sub: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
});
