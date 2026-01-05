import type { SensorEvent } from '../types';

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export type FusionConfidenceInput = {
  windowEvents: SensorEvent[];
  tsEnd: number;
};

export type FusionConfidence = {
  confidence: number;
  sources: string[];
  reasons: string[];
};

export function computeFusionConfidence(input: FusionConfidenceInput): FusionConfidence {
  const sources = new Set<string>();
  const reasons: string[] = [];

  const hasMic = input.windowEvents.some((e) => e.kind === 'mic');
  const hasCamera = input.windowEvents.some((e) => e.kind === 'camera');
  const hasWearable = input.windowEvents.some((e) => e.kind === 'wearable');

  if (hasMic) sources.add('mic');
  if (hasCamera) sources.add('camera');
  if (hasWearable) sources.add('wearable');

  // Base confidence from stream presence.
  let c = 0;
  c += hasMic ? 0.45 : 0;
  c += hasCamera ? 0.25 : 0;
  c += hasWearable ? 0.30 : 0;

  // Mic quality penalty: clipped frames reduce confidence.
  const micVad = input.windowEvents.filter((e) => e.kind === 'mic' && 'vad' in e) as Array<any>;
  if (micVad.length > 0) {
    const clippedCount = micVad.filter((e) => Boolean(e.clipped)).length;
    const clippedRatio = clippedCount / micVad.length;
    if (clippedRatio > 0.05) {
      reasons.push('mic clipping detected');
      c *= 0.9;
    }
  }

  // Camera quality penalty: very low lighting reduces confidence.
  const camera = input.windowEvents.filter((e) => e.kind === 'camera') as Array<any>;
  if (camera.length > 0) {
    const avgLight = camera.reduce((acc, e) => acc + (typeof e.lightingLevel === 'number' ? e.lightingLevel : 0), 0) / camera.length;
    if (avgLight < 0.15) {
      reasons.push('low lighting');
      c *= 0.9;
    }
  }

  // Wearable freshness: if latest wearable is old, reduce confidence.
  const wear = input.windowEvents.filter((e) => e.kind === 'wearable') as Array<any>;
  if (wear.length > 0) {
    const lastTs = wear.reduce((m, e) => (typeof e.ts === 'number' && e.ts > m ? e.ts : m), 0);
    const ageMs = input.tsEnd - lastTs;
    if (ageMs > 15_000) {
      reasons.push('wearable data stale');
      c *= 0.85;
    }
  }

  if (!hasMic) reasons.push('mic stream missing');
  if (!hasCamera) reasons.push('camera stream missing');
  if (!hasWearable) reasons.push('wearable stream missing');

  return { confidence: clamp01(c), sources: Array.from(sources), reasons };
}
