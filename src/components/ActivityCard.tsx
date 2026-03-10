import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type ActivityState = 'sleeping' | 'sitting' | 'walking' | 'unknown';

interface Props {
  activity: ActivityState;
  confidence: number;
  probs: Record<string, number>;
}

const ICONS: Record<ActivityState, string> = {
  sleeping: '\u{1F634}',
  sitting: '\u{1FA91}',
  walking: '\u{1F6B6}',
  unknown: '\u{2753}',
};

const LABELS: Record<ActivityState, string> = {
  sleeping: 'SLEEPING',
  sitting: 'SITTING',
  walking: 'WALKING',
  unknown: 'UNKNOWN',
};

export function ActivityCard({activity, confidence, probs}: Props) {
  const topProbs = Object.entries(probs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{ICONS[activity]}</Text>
      <Text style={styles.label}>{LABELS[activity]}</Text>
      <Text style={styles.conf}>
        Activity {Math.round(confidence * 100)}%
      </Text>

      <View style={styles.probContainer}>
        {topProbs.map(([label, prob]) => (
          <View key={label} style={styles.probRow}>
            <Text style={styles.probLabel}>{label}</Text>
            <View style={styles.probBarBg}>
              <View
                style={[styles.probBarFill, {width: `${prob * 100}%`}]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  conf: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
    marginBottom: 8,
  },
  probContainer: {
    width: '100%',
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  probLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    width: 50,
  },
  probBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  probBarFill: {
    height: 6,
    backgroundColor: '#7C4DFF',
    borderRadius: 3,
  },
});
