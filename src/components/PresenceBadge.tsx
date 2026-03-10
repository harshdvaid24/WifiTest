import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  present: boolean;
  confidence: number;
}

export function PresenceBadge({present, confidence}: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (present) {
      scale.value = withRepeat(
        withTiming(1.3, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, {duration: 300});
    }
  }, [present, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: present ? 0.3 : 0,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulse,
          {backgroundColor: present ? '#4CAF50' : '#9E9E9E'},
          pulseStyle,
        ]}
      />
      <View
        style={[
          styles.badge,
          {backgroundColor: present ? '#4CAF50' : '#9E9E9E'},
        ]}>
        <Text style={styles.icon}>{present ? '\u{1F7E2}' : '\u{26AA}'}</Text>
      </View>
      <Text style={styles.label}>{present ? 'OCCUPIED' : 'EMPTY'}</Text>
      <Text style={styles.sub}>Room Presence</Text>
      <Text style={styles.conf}>{Math.round(confidence * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 8,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
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
