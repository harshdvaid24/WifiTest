import {RSSIBuffer} from './RSSIBuffer';

export interface OccupancyResult {
  count: number;
  confidence: number;
}

export class OccupancyEstimator {
  estimate(buffer: RSSIBuffer, bssid: string): OccupancyResult {
    const values = buffer.getForBSSID(bssid);
    if (values.length < 10) {
      return {count: 0, confidence: 0};
    }

    // Compute delta series
    const deltas: number[] = [];
    for (let i = 1; i < values.length; i++) {
      deltas.push(Math.abs(values[i] - values[i - 1]));
    }

    // 1D K-Means for k=1..3
    let bestK = 0;
    let bestScore = -Infinity;

    for (let k = 1; k <= 3; k++) {
      const {centroids, assignments} = this.kMeans1D(deltas, k);

      if (k === 1) {
        bestK = centroids[0] > 1 ? 1 : 0;
        bestScore = 0;
        continue;
      }

      // Check cluster separation
      const sorted = [...centroids].sort((a, b) => a - b);
      let minSep = Infinity;
      for (let i = 1; i < sorted.length; i++) {
        minSep = Math.min(minSep, sorted[i] - sorted[i - 1]);
      }

      if (minSep > 2) {
        bestK = k;
        bestScore = minSep;
      }
    }

    const confidence = Math.min(bestScore / 5, 1.0);
    return {
      count: Math.max(0, Math.min(3, bestK)) as 0 | 1 | 2 | 3,
      confidence: Math.max(0, confidence),
    };
  }

  private kMeans1D(
    data: number[],
    k: number,
  ): {centroids: number[]; assignments: number[]} {
    if (data.length === 0 || k <= 0) {
      return {centroids: [], assignments: []};
    }

    // Initialize centroids using quantile spread
    const sorted = [...data].sort((a, b) => a - b);
    let centroids = Array.from({length: k}, (_, i) => {
      const idx = Math.floor(((i + 0.5) * sorted.length) / k);
      return sorted[Math.min(idx, sorted.length - 1)];
    });

    let assignments = new Array(data.length).fill(0);

    for (let iter = 0; iter < 20; iter++) {
      // Assign points to nearest centroid
      const newAssignments = data.map(x => {
        let minDist = Infinity;
        let best = 0;
        centroids.forEach((c, j) => {
          const dist = Math.abs(x - c);
          if (dist < minDist) {
            minDist = dist;
            best = j;
          }
        });
        return best;
      });

      // Update centroids
      const newCentroids = centroids.map((c, j) => {
        const members = data.filter((_, i) => newAssignments[i] === j);
        return members.length > 0
          ? members.reduce((a, b) => a + b, 0) / members.length
          : c;
      });

      const converged = centroids.every(
        (c, i) => Math.abs(c - newCentroids[i]) < 0.001,
      );
      centroids = newCentroids;
      assignments = newAssignments;

      if (converged) break;
    }

    return {centroids, assignments};
  }
}
