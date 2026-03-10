import {useState, useCallback, useRef} from 'react';
import {useSensorStore} from '../store/sensorStore';
import {useSettingsStore} from '../store/settingsStore';

export type CalibrationPhase = 'idle' | 'empty' | 'sitting' | 'walking' | 'done';

interface CalibrationState {
  phase: CalibrationPhase;
  progress: number;
  secondsLeft: number;
  samples: number[][];
}

const PHASE_DURATION_S = 30;

export function useCalibration() {
  const [state, setState] = useState<CalibrationState>({
    phase: 'idle',
    progress: 0,
    secondsLeft: 0,
    samples: [],
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const samplesRef = useRef<number[][]>([]);
  const buffer = useSensorStore(s => s.buffer);
  const lockedBSSID = useSensorStore(s => s.lockedBSSID);
  const setBaselineVariance = useSettingsStore(s => s.setBaselineVariance);

  const startPhase = useCallback(
    (phase: CalibrationPhase) => {
      if (phase === 'idle' || phase === 'done') return;

      samplesRef.current = [];
      let elapsed = 0;

      setState({
        phase,
        progress: 0,
        secondsLeft: PHASE_DURATION_S,
        samples: [],
      });

      timerRef.current = setInterval(() => {
        elapsed += 1;
        const remaining = PHASE_DURATION_S - elapsed;

        if (lockedBSSID) {
          const values = buffer.getForBSSID(lockedBSSID);
          if (values.length > 0) {
            samplesRef.current.push([...values]);
          }
        }

        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);

          if (phase === 'empty') {
            const allValues = samplesRef.current.flat();
            if (allValues.length > 0) {
              const mean =
                allValues.reduce((a, b) => a + b, 0) / allValues.length;
              const variance =
                allValues.reduce((a, b) => a + (b - mean) ** 2, 0) /
                allValues.length;
              setBaselineVariance(variance);
            }
          }

          setState(prev => ({
            ...prev,
            phase: prev.phase,
            progress: 1,
            secondsLeft: 0,
            samples: samplesRef.current,
          }));
        } else {
          setState(prev => ({
            ...prev,
            progress: elapsed / PHASE_DURATION_S,
            secondsLeft: remaining,
          }));
        }
      }, 1000);
    },
    [buffer, lockedBSSID, setBaselineVariance],
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState({phase: 'idle', progress: 0, secondsLeft: 0, samples: []});
  }, []);

  return {
    ...state,
    startPhase,
    reset,
  };
}
