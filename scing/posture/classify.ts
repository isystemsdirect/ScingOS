import {
  MAX_OPTIONS_MAX,
  MAX_OPTIONS_MIN,
  MIN_CONFIDENCE_TO_SWITCH,
  POSTURE_HYSTERESIS,
  POSTURE_WINDOW_SIZE,
  TIE_BREAK_EPS,
} from './config';
import type { PostureFeatures, PostureId, PostureResult, PostureScore } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const clamp = (v: number, lo: number, hi: number): number => {
  if (!Number.isFinite(v)) return lo;
  if (v <= lo) return lo;
  if (v >= hi) return hi;
  return v;
};

const tieBreakOrder: PostureId[] = ['overloaded', 'frustrated', 'directive', 'exploratory', 'confident', 'unknown'];

const inferToleranceForOptions = (f: PostureFeatures): number => {
  // Deterministic inference: exploratory cues and longer form => more options tolerated.
  let v = 0.35;
  if (f.exploratoryHit) v += 0.35;
  if (f.isVeryLong) v += 0.2;
  if (f.directiveHit) v -= 0.2;
  if (f.rapidFire) v -= 0.1;
  return clamp01(v);
};

export function scorePostures(features: PostureFeatures): PostureScore[] {
  const base = 0.2;
  const out: Record<PostureId, number> = {
    exploratory: base,
    directive: base,
    overloaded: base,
    confident: base,
    frustrated: base,
    unknown: base,
  };

  const urgencyHigh = features.timePressure === 'high';
  const inferredOptions = inferToleranceForOptions(features);

  // EXPLORATORY
  if (features.exploratoryHit) out.exploratory += 0.3;
  if (features.isVeryLong && !urgencyHigh) out.exploratory += 0.15;
  if (inferredOptions >= 0.7) out.exploratory += 0.1;

  // DIRECTIVE
  if (features.directiveHit) out.directive += 0.35;
  if (urgencyHigh) out.directive += 0.2;
  if (features.isVeryShort) out.directive += 0.1;

  // OVERLOADED
  if (features.overloadHit) out.overloaded += 0.35;
  if (features.rapidFire) out.overloaded += 0.2;
  if (features.isVeryLong) out.overloaded += 0.1;
  if (features.tension >= 0.7) out.overloaded += 0.15;

  // CONFIDENT
  if (features.confidenceHit) out.confident += 0.35;
  if (!features.repetition && !features.rapidFire) out.confident += 0.2;
  if (!features.isVeryLong && features.messageLengthChars >= 80 && features.directiveHit) out.confident += 0.1;

  // FRUSTRATED
  if (features.frustrationHit) out.frustrated += 0.35;
  if (features.highCaps) out.frustrated += 0.2;
  if (features.repetition) out.frustrated += 0.15;
  if (features.tension >= 0.7) out.frustrated += 0.15;

  // UNKNOWN (fallback)
  const anyStrong =
    features.directiveHit || features.exploratoryHit || features.overloadHit || features.frustrationHit || features.confidenceHit;
  if (!anyStrong) out.unknown += 0.25;
  if (features.isVeryShort && !features.directiveHit) out.unknown += 0.2;

  const scored: PostureScore[] = tieBreakOrder.map((id) => ({ id, score: clamp01(out[id]) }));
  return scored;
}

const scoreOf = (scores: PostureScore[], id: PostureId): number => {
  const f = scores.find((s) => s.id === id);
  return f ? f.score : 0;
};

const pickTop = (scores: PostureScore[]): PostureScore => {
  let best = scores[0];
  for (const s of scores.slice(1)) {
    if (s.score > best.score) best = s;
  }

  // tie-break when within eps
  const tied = scores.filter((s) => Math.abs(s.score - best.score) <= TIE_BREAK_EPS);
  if (tied.length <= 1) return best;

  for (const id of tieBreakOrder) {
    const t = tied.find((x) => x.id === id);
    if (t) return t;
  }

  return best;
};

const deriveSignals = (id: PostureId, timePressure: 'low' | 'medium' | 'high'): PostureResult['signals'] => {
  const urgencyCue = timePressure === 'high' ? 0.8 : timePressure === 'low' ? 0.3 : 0.5;

  switch (id) {
    case 'exploratory':
      return {
        brevityPreference: 0.2,
        structurePreference: 0.5,
        toleranceForOptions: 0.85,
        urgencyCue,
        frictionCue: 0.2,
      };
    case 'directive':
      return {
        brevityPreference: 0.7,
        structurePreference: 0.85,
        toleranceForOptions: 0.35,
        urgencyCue: Math.max(0.6, urgencyCue),
        frictionCue: 0.3,
      };
    case 'overloaded':
      return {
        brevityPreference: 0.95,
        structurePreference: 0.95,
        toleranceForOptions: 0.1,
        urgencyCue: 0.5,
        frictionCue: 0.6,
      };
    case 'confident':
      return {
        brevityPreference: 0.65,
        structurePreference: 0.7,
        toleranceForOptions: 0.25,
        urgencyCue: 0.3,
        frictionCue: 0.1,
      };
    case 'frustrated':
      return {
        brevityPreference: 0.85,
        structurePreference: 0.9,
        toleranceForOptions: 0.15,
        urgencyCue: Math.max(0.7, urgencyCue),
        frictionCue: 0.9,
      };
    case 'unknown':
    default:
      return {
        brevityPreference: 0.6,
        structurePreference: 0.75,
        toleranceForOptions: 0.35,
        urgencyCue: 0.4,
        frictionCue: 0.3,
      };
  }
};

const deriveConstraints = (signals: PostureResult['signals'], id: PostureId): PostureResult['constraints'] => {
  const maxOptions = Math.round(clamp(1 + 5 * clamp01(signals.toleranceForOptions), MAX_OPTIONS_MIN, MAX_OPTIONS_MAX));

  const maxLength: PostureResult['constraints']['maxLength'] =
    signals.brevityPreference >= 0.85 ? 'short' : signals.brevityPreference >= 0.55 ? 'medium' : 'long';

  const askSingleQuestion =
    id === 'overloaded' || id === 'frustrated' || id === 'unknown' || clamp01(signals.brevityPreference) >= 0.85;

  const preferChecklist = clamp01(signals.structurePreference) >= 0.75;

  return { maxOptions, maxLength, askSingleQuestion, preferChecklist };
};

const normalizeHistory = (last: Array<{ ts: number; id: PostureId }>): Array<{ ts: number; id: PostureId }> => {
  const clean = (last ?? []).filter((x) => typeof x.id === 'string' && Number.isFinite(x.ts));
  clean.sort((a, b) => a.ts - b.ts);
  return clean.slice(-POSTURE_WINDOW_SIZE);
};

export function selectPosture(scores: PostureScore[], history: { lastPostures: Array<{ ts: number; id: PostureId }> }): PostureResult {
  const top = pickTop(scores);
  const last = normalizeHistory(history.lastPostures);
  const current = last.length > 0 ? last[last.length - 1].id : null;

  let chosen = top;

  if (current) {
    const currentScore = scoreOf(scores, current);
    const margin = top.score - currentScore;
    if (!(top.score >= MIN_CONFIDENCE_TO_SWITCH && margin >= POSTURE_HYSTERESIS)) {
      chosen = { id: current, score: currentScore };
    }
  }

  const signals = deriveSignals(chosen.id, 'medium');
  const constraints = deriveConstraints(signals, chosen.id);

  return {
    id: chosen.id,
    confidence: clamp01(chosen.score),
    signals,
    constraints,
  };
}

export function selectPostureWithContext(
  scores: PostureScore[],
  history: { lastPostures: Array<{ ts: number; id: PostureId }> },
  ctx: { timePressure?: 'low' | 'medium' | 'high' }
): PostureResult {
  const base = selectPosture(scores, history);
  const tp = ctx.timePressure ?? 'medium';
  const signals = deriveSignals(base.id, tp);
  return {
    ...base,
    signals,
    constraints: deriveConstraints(signals, base.id),
  };
}
