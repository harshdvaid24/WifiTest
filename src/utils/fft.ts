/**
 * Pure TypeScript FFT implementation (radix-2 Cooley-Tukey).
 * Returns magnitude spectrum.
 */
export function fft(signal: number[]): number[] {
  // Pad to next power of 2
  let n = 1;
  while (n < signal.length) n *= 2;

  const real = new Float64Array(n);
  const imag = new Float64Array(n);

  for (let i = 0; i < signal.length; i++) {
    real[i] = signal[i];
  }

  // Bit-reversal permutation
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, Math.log2(n));
    if (j > i) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // Cooley-Tukey butterfly
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = (-2 * Math.PI) / size;

    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = Math.cos(angle * j);
        const sin = Math.sin(angle * j);

        const tReal = real[i + j + halfSize] * cos - imag[i + j + halfSize] * sin;
        const tImag = real[i + j + halfSize] * sin + imag[i + j + halfSize] * cos;

        real[i + j + halfSize] = real[i + j] - tReal;
        imag[i + j + halfSize] = imag[i + j] - tImag;
        real[i + j] += tReal;
        imag[i + j] += tImag;
      }
    }
  }

  // Compute magnitude spectrum
  const magnitudes = new Array(n);
  for (let i = 0; i < n; i++) {
    magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / n;
  }

  return magnitudes;
}

function bitReverse(x: number, bits: number): number {
  let result = 0;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (x & 1);
    x >>= 1;
  }
  return result;
}
