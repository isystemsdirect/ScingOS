import { HISTORY_WINDOW_SIZE, INTENT_STABILITY_WINDOW_MS } from './config';
import type { StabilityBundle } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

export function sliceRecentIntents(
  intents: Array<{ ts: number; label: string }>,
  nowTs: number
): Array<{ ts: number; label: string }> {
  const cutoff = nowTs - INTENT_STABILITY_WINDOW_MS;
  const recent = intents.filter(
    (x) => Number.isFinite(x.ts) && x.ts >= cutoff && typeof x.label === 'string'
  );
  recent.sort((a, b) => a.ts - b.ts);
  const trimmed = recent.slice(-HISTORY_WINDOW_SIZE);
  return trimmed;
}

export function computeIntentStability(
  history: { intents: Array<{ ts: number; label: string }> },
  nowTs: number
): StabilityBundle {
  const recent = sliceRecentIntents(history.intents ?? [], nowTs);
  if (recent.length <= 1) {
    return { intentStability: 1.0, oscillation: 0.0 };
  }

  let transitions = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].label !== recent[i - 1].label) transitions += 1;
  }

  const density = transitions / Math.max(1, recent.length - 1);
  const intentStability = clamp01(1.0 - density);
  const oscillation = clamp01(density);
  return { intentStability, oscillation };
}
