import {RSSIBuffer} from './RSSIBuffer';

export interface PresenceResult {
  present: boolean;
  confidence: number;
}

export class PresenceDetector {
  private baselineVariance: number;
  private threshold: number;
  private consecutiveCount = 0;
  private lastState = false;
  private readonly debounceRequired = 3;

  constructor(baselineVariance = 1.0, threshold = 2.5) {
    this.baselineVariance = baselineVariance;
    this.threshold = threshold;
  }

  setBaseline(variance: number): void {
    this.baselineVariance = variance;
  }

  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }

  detect(buffer: RSSIBuffer, bssid: string): PresenceResult {
    const values = buffer.getForBSSID(bssid);
    if (values.length < 5) {
      return {present: false, confidence: 0};
    }

    const recent = values.slice(-5);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance =
      recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length;

    const safeBaseline = Math.max(this.baselineVariance, 0.1);
    const ratio = variance / safeBaseline;
    const rawPresent = ratio > this.threshold;

    if (rawPresent === this.lastState) {
      this.consecutiveCount++;
    } else {
      this.consecutiveCount = 1;
      this.lastState = rawPresent;
    }

    const present =
      this.consecutiveCount >= this.debounceRequired
        ? rawPresent
        : !rawPresent;

    const confidence = Math.min(ratio / (this.threshold * 2), 1.0);

    return {present, confidence};
  }
}
