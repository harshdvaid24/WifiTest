import {ScanPayload} from '../native/WifiScanner';

export class RSSIBuffer {
  private buffers: Map<string, number[]> = new Map();
  private readonly maxSize: number;

  constructor(maxSize = 30) {
    this.maxSize = maxSize;
  }

  push(payload: ScanPayload, lockedBSSID: string | null): void {
    payload.results.forEach(ap => {
      if (lockedBSSID && ap.bssid !== lockedBSSID) return;

      let buf = this.buffers.get(ap.bssid);
      if (!buf) {
        buf = [];
        this.buffers.set(ap.bssid, buf);
      }
      buf.push(ap.rssi);
      if (buf.length > this.maxSize) {
        buf.shift();
      }
    });
  }

  getForBSSID(bssid: string): number[] {
    return this.buffers.get(bssid) ?? [];
  }

  getAllBSSIDs(): string[] {
    return Array.from(this.buffers.keys());
  }

  getMean(bssid: string): number {
    const values = this.getForBSSID(bssid);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getVariance(bssid: string): number {
    const values = this.getForBSSID(bssid);
    if (values.length < 2) return 0;
    const mean = this.getMean(bssid);
    return values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  }

  getDelta(bssid: string, windowSize = 3): number {
    const values = this.getForBSSID(bssid);
    if (values.length < windowSize + 1) return 0;
    const recent = values.slice(-windowSize);
    const prev = values.slice(-(windowSize + 1), -1);
    const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prevMean = prev.reduce((a, b) => a + b, 0) / prev.length;
    return Math.abs(recentMean - prevMean);
  }

  getStdDev(bssid: string): number {
    return Math.sqrt(this.getVariance(bssid));
  }

  getSize(bssid: string): number {
    return this.getForBSSID(bssid).length;
  }

  clear(): void {
    this.buffers.clear();
  }
}
