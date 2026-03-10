import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

interface Props {
  rssi: number;
  values: number[];
}

const CHART_WIDTH = Dimensions.get('window').width / 2 - 40;
const CHART_HEIGHT = 40;

export function RSSISparkline({rssi, values}: Props) {
  const recent = values.slice(-25);
  const min = Math.min(...recent, -90);
  const max = Math.max(...recent, -20);
  const range = max - min || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.value}>{rssi} dBm</Text>

      <View style={styles.chartContainer}>
        {recent.map((v, i) => {
          const height = ((v - min) / range) * CHART_HEIGHT;
          return (
            <View
              key={i}
              style={[styles.bar, {height: Math.max(2, height)}]}
            />
          );
        })}
      </View>

      <Text style={styles.sub}>Raw RSSI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF5722',
    marginBottom: 6,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    width: CHART_WIDTH,
    gap: 1,
  },
  bar: {
    flex: 1,
    backgroundColor: '#FF5722',
    borderRadius: 1,
    minWidth: 2,
    opacity: 0.7,
  },
  sub: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
});
