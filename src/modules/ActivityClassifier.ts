import {extractFeatures} from '../utils/featureExtractor';
import {RSSIBuffer} from './RSSIBuffer';

export type ActivityState = 'sleeping' | 'sitting' | 'walking' | 'unknown';

export interface ActivityResult {
  activity: ActivityState;
  confidence: number;
  probs: Record<string, number>;
}

const ACTIVITY_LABELS: ActivityState[] = [
  'sleeping',
  'sitting',
  'walking',
  'unknown',
];

let tfliteModel: any = null;

export class ActivityClassifier {
  private modelLoaded = false;

  async loadModel(): Promise<void> {
    try {
      const TFLite = require('react-native-tflite').default;
      await TFLite.loadModel({model: 'activity_model.tflite'});
      tfliteModel = TFLite;
      this.modelLoaded = true;
    } catch (e) {
      console.warn('TFLite model not available, using heuristic fallback');
      this.modelLoaded = false;
    }
  }

  async classify(buffer: RSSIBuffer, bssid: string): Promise<ActivityResult> {
    const values = buffer.getForBSSID(bssid);
    if (values.length < 15) {
      return {
        activity: 'unknown',
        confidence: 0,
        probs: {sleeping: 0, sitting: 0, walking: 0, unknown: 1},
      };
    }

    const features = extractFeatures(values);

    if (this.modelLoaded && tfliteModel) {
      return this.runTFLite(features);
    }

    return this.heuristicClassify(features);
  }

  private async runTFLite(features: Float32Array): Promise<ActivityResult> {
    try {
      const output = await tfliteModel.runModelOnInput({
        input: Array.from(features),
        inputShape: [1, 8],
        outputSize: 4,
      });

      const probs: Record<string, number> = {};
      let maxIdx = 0;
      let maxProb = 0;

      ACTIVITY_LABELS.forEach((label, i) => {
        probs[label] = output[i];
        if (output[i] > maxProb) {
          maxProb = output[i];
          maxIdx = i;
        }
      });

      return {
        activity: ACTIVITY_LABELS[maxIdx],
        confidence: maxProb,
        probs,
      };
    } catch {
      return this.heuristicClassify(features);
    }
  }

  private heuristicClassify(features: Float32Array): ActivityResult {
    const [mean, variance, _skew, _kurt, _peakFreq, energy, zcr] = features;

    let activity: ActivityState;
    let confidence: number;

    if (variance < 0.5 && energy < 1) {
      activity = 'sleeping';
      confidence = 0.7;
    } else if (variance < 2 && zcr < 0.3) {
      activity = 'sitting';
      confidence = 0.6;
    } else if (variance > 3 || zcr > 0.5) {
      activity = 'walking';
      confidence = 0.65;
    } else {
      activity = 'unknown';
      confidence = 0.4;
    }

    const probs: Record<string, number> = {
      sleeping: 0.1,
      sitting: 0.1,
      walking: 0.1,
      unknown: 0.1,
    };
    probs[activity] = confidence;

    // Normalize
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    Object.keys(probs).forEach(k => {
      probs[k] /= total;
    });

    return {activity, confidence, probs};
  }
}
