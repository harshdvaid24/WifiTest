import {RSSIBuffer} from './RSSIBuffer';

export type MotionLevel = 'none' | 'low' | 'medium' | 'high';

export interface MotionResult {
  level: MotionLevel;
  delta: number;
}

export class MotionClassifier {
  private sensitivity: number;

  constructor(sensitivity = 1.0) {
    this.sensitivity = sensitivity;
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
  }

  classify(buffer: RSSIBuffer, bssid: string): MotionResult {
    const delta = buffer.getDelta(bssid, 3) * this.sensitivity;

    let level: MotionLevel;
    if (delta < 1) {
      level = 'none';
    } else if (delta < 3) {
      level = 'low';
    } else if (delta < 7) {
      level = 'medium';
    } else {
      level = 'high';
    }

    return {level, delta};
  }
}
