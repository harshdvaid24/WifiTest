import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type MotionLevel = 'none' | 'low' | 'medium' | 'high';

interface Props {
  level: MotionLevel;
  delta: number;
}

const LEVELS: MotionLevel[] = ['none', 'low', 'medium', 'high'];
const COLORS = ['#E0E0E0', '#FFEB3B', '#FF9800', '#F44336'];
const LABELS = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];

export function MotionGauge({level, delta}: Props) {
  const activeIndex = LEVELS.indexOf(level);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeRow}>
        {LEVELS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor: i <= activeIndex ? COLORS[activeIndex] : '#E0E0E0',
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>{LABELS[activeIndex]}</Text>
      <Text style={styles.sub}>Motion Level</Text>
      <Text style={styles.delta}>{delta.toFixed(1)} dBm/scan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  gaugeRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  segment: {
    width: 28,
    height: 12,
    borderRadius: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  sub: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  delta: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
});
