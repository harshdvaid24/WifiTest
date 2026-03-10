import {fft} from './fft';

/**
 * Extracts an 8-feature vector from RSSI values for TFLite input.
 * Features: [mean, variance, skewness, kurtosis, peak_freq, energy, zcr, entropy]
 */
export function extractFeatures(values: number[]): Float32Array {
  const features = new Float32Array(8);

  if (values.length < 2) return features;

  // Mean
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  features[0] = mean;

  // Variance
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  features[1] = variance;

  const std = Math.sqrt(variance) || 1;

  // Skewness
  const skewness =
    values.reduce((a, b) => a + ((b - mean) / std) ** 3, 0) / values.length;
  features[2] = skewness;

  // Kurtosis
  const kurtosis =
    values.reduce((a, b) => a + ((b - mean) / std) ** 4, 0) / values.length -
    3;
  features[3] = kurtosis;

  // Peak frequency from FFT
  const centered = values.map(v => v - mean);
  const spectrum = fft(centered);
  let peakMag = 0;
  let peakIdx = 0;
  for (let i = 1; i < spectrum.length / 2; i++) {
    if (spectrum[i] > peakMag) {
      peakMag = spectrum[i];
      peakIdx = i;
    }
  }
  features[4] = peakIdx / spectrum.length;

  // Energy (sum of squared magnitudes)
  const energy = spectrum
    .slice(0, spectrum.length / 2)
    .reduce((a, b) => a + b * b, 0);
  features[5] = energy;

  // Zero-crossing rate
  let zcr = 0;
  for (let i = 1; i < centered.length; i++) {
    if (
      (centered[i] >= 0 && centered[i - 1] < 0) ||
      (centered[i] < 0 && centered[i - 1] >= 0)
    ) {
      zcr++;
    }
  }
  features[6] = zcr / (centered.length - 1);

  // Spectral entropy
  const halfSpec = spectrum.slice(0, spectrum.length / 2);
  const specSum = halfSpec.reduce((a, b) => a + b, 0) || 1;
  let entropy = 0;
  halfSpec.forEach(v => {
    const p = v / specSum;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  features[7] = entropy;

  return features;
}
