import {RSSIBuffer} from './RSSIBuffer';
import {MotionLevel} from './MotionClassifier';
import {fft} from '../utils/fft';

export interface BreathingResult {
  bpm: number | null;
  confidence: number;
  valid: boolean;
}

export class BreathingEstimator {
  private readonly minSamples = 45;
  private readonly sampleRateHz: number;

  constructor(scanIntervalMs = 2000) {
    this.sampleRateHz = 1000 / scanIntervalMs;
  }

  estimate(
    buffer: RSSIBuffer,
    bssid: string,
    motionLevel: MotionLevel,
  ): BreathingResult {
    if (motionLevel !== 'none' && motionLevel !== 'low') {
      return {bpm: null, confidence: 0, valid: false};
    }

    const values = buffer.getForBSSID(bssid);
    if (values.length < this.minSamples) {
      return {bpm: null, confidence: 0, valid: false};
    }

    const signal = values.slice(-this.minSamples);

    // Apply Hanning window
    const windowed = signal.map(
      (v, i) =>
        v * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (signal.length - 1))),
    );

    // Remove DC offset
    const mean = windowed.reduce((a, b) => a + b, 0) / windowed.length;
    const centered = windowed.map(v => v - mean);

    // IIR bandpass approximation: 0.1-0.5 Hz (breathing range)
    const filtered = this.bandpassFilter(centered, this.sampleRateHz, 0.1, 0.5);

    // FFT
    const spectrum = fft(filtered);
    const freqResolution = this.sampleRateHz / spectrum.length;

    // Find peak in breathing range (0.1-0.5 Hz = 6-30 BPM)
    const minBin = Math.floor(0.1 / freqResolution);
    const maxBin = Math.ceil(0.5 / freqResolution);

    let peakMag = 0;
    let peakBin = 0;
    for (let i = minBin; i <= maxBin && i < spectrum.length / 2; i++) {
      if (spectrum[i] > peakMag) {
        peakMag = spectrum[i];
        peakBin = i;
      }
    }

    if (peakMag < 0.01) {
      return {bpm: null, confidence: 0, valid: false};
    }

    const peakFreq = peakBin * freqResolution;
    const bpm = Math.round(peakFreq * 60);

    // Confidence based on peak prominence
    const totalEnergy = spectrum
      .slice(0, spectrum.length / 2)
      .reduce((a, b) => a + b, 0);
    const confidence = Math.min(peakMag / (totalEnergy * 0.5 + 0.001), 1.0);

    const valid = bpm >= 6 && bpm <= 30 && confidence > 0.1;

    return {bpm: valid ? bpm : null, confidence, valid};
  }

  private bandpassFilter(
    signal: number[],
    fs: number,
    lowFreq: number,
    highFreq: number,
  ): number[] {
    // Simple 2nd-order IIR bandpass filter approximation
    const w0Low = (2 * Math.PI * lowFreq) / fs;
    const w0High = (2 * Math.PI * highFreq) / fs;
    const alpha = 0.5;

    // High-pass to remove below lowFreq
    let prevIn = 0;
    let prevOut = 0;
    const rc = 1 / (2 * Math.PI * lowFreq);
    const dt = 1 / fs;
    const alphaHP = rc / (rc + dt);

    const highPassed = signal.map(x => {
      const out = alphaHP * (prevOut + x - prevIn);
      prevIn = x;
      prevOut = out;
      return out;
    });

    // Low-pass to remove above highFreq
    const rcLP = 1 / (2 * Math.PI * highFreq);
    const alphaLP = dt / (rcLP + dt);
    let prevLP = 0;

    return highPassed.map(x => {
      prevLP = prevLP + alphaLP * (x - prevLP);
      return prevLP;
    });
  }
}
