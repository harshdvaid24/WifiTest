import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  count: number;
  confidence: number;
}

export function OccupancyBadge({count, confidence}: Props) {
  const icons = Array.from({length: Math.max(count, 0)}, () => '\u{1F464}');

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        {count === 0 ? (
          <Text style={styles.emptyIcon}>\u{1F6AB}</Text>
        ) : (
          icons.map((icon, i) => (
            <Text key={i} style={styles.personIcon}>
              {icon}
            </Text>
          ))
        )}
      </View>
      <Text style={styles.label}>
        {count === 0 ? 'No One' : `${count} Person${count > 1 ? 's' : ''}`}
      </Text>
      <Text style={styles.sub}>Occupancy Estimate</Text>
      <Text style={styles.conf}>{Math.round(confidence * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  personIcon: {
    fontSize: 24,
  },
  emptyIcon: {
    fontSize: 24,
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
  conf: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
});
