import {useSensorStore} from '../store/sensorStore';

export function usePresence() {
  const presence = useSensorStore(s => s.presence);
  const confidence = useSensorStore(s => s.presenceConfidence);
  const motionLevel = useSensorStore(s => s.motionLevel);

  return {presence, confidence, motionLevel};
}
