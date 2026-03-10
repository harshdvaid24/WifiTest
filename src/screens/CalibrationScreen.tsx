import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useCalibration, CalibrationPhase} from '../hooks/useCalibration';

interface Props {
  onComplete: () => void;
}

const PHASES: {key: CalibrationPhase; label: string; instruction: string}[] = [
  {
    key: 'empty',
    label: 'Empty Room',
    instruction: 'Leave the room for 30 seconds to capture the baseline signal.',
  },
  {
    key: 'sitting',
    label: 'Sitting Still',
    instruction: 'Sit in your usual spot without moving for 30 seconds.',
  },
  {
    key: 'walking',
    label: 'Walking Around',
    instruction: 'Walk naturally around the room for 30 seconds.',
  },
];

export function CalibrationScreen({onComplete}: Props) {
  const {phase, progress, secondsLeft, startPhase, reset} = useCalibration();
  const currentPhaseIndex = PHASES.findIndex(p => p.key === phase);
  const allDone =
    phase !== 'idle' && progress >= 1 && currentPhaseIndex === PHASES.length - 1;

  const handleNext = () => {
    if (phase === 'idle') {
      startPhase(PHASES[0].key);
    } else if (progress >= 1) {
      const nextIndex = currentPhaseIndex + 1;
      if (nextIndex < PHASES.length) {
        startPhase(PHASES[nextIndex].key);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calibration</Text>
      <Text style={styles.subtitle}>
        3-step guided session to train your room's signal profile
      </Text>

      {PHASES.map((p, i) => {
        const isActive = p.key === phase;
        const isDone = currentPhaseIndex > i || (isActive && progress >= 1);

        return (
          <View
            key={p.key}
            style={[
              styles.phaseCard,
              isActive && styles.phaseCardActive,
              isDone && styles.phaseCardDone,
            ]}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>{i + 1}</Text>
              <Text style={styles.phaseLabel}>{p.label}</Text>
              {isDone && <Text style={styles.checkmark}>{'\u2705'}</Text>}
            </View>

            {isActive && !isDone && (
              <View>
                <Text style={styles.instruction}>{p.instruction}</Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {width: `${progress * 100}%`},
                    ]}
                  />
                </View>
                <Text style={styles.timer}>{secondsLeft}s remaining</Text>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.footer}>
        {allDone ? (
          <TouchableOpacity style={styles.button} onPress={onComplete}>
            <Text style={styles.buttonText}>Finish Calibration</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              phase !== 'idle' && progress < 1 && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={phase !== 'idle' && progress < 1}>
            <Text style={styles.buttonText}>
              {phase === 'idle' ? 'Start Calibration' : 'Next Phase'}
            </Text>
          </TouchableOpacity>
        )}

        {phase !== 'idle' && !allDone && (
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  phaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  phaseCardActive: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  phaseCardDone: {
    backgroundColor: '#E8F5E9',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginRight: 12,
    width: 24,
  },
  phaseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
  },
  instruction: {
    fontSize: 13,
    color: '#757575',
    marginTop: 12,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  timer: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  resetText: {
    color: '#F44336',
    fontSize: 14,
  },
});
