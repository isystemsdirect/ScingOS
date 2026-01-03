import {
  CONFIDENCE_LOCK,
  MAX_EVALUATION_CYCLES,
  VARIANCE_THRESHOLD,
} from '../cognition/config';
import type { AttractorPolicy } from '../attractors/types';
import {
  MAX_POLICY_SHIFT,
  MAX_RISK_POSTURE_TIGHTEN,
  MAX_THRESHOLD_DELTA,
} from './config';
import type {
  AttractorResultLike,
  CollapseModulation,
  GradientContext,
  GradientMode,
  GradientVector,
} from './types';

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

const clampInt = (v: number, lo: number, hi: number): number => {
  const n = Math.trunc(v);
  if (n <= lo) return lo;
  if (n >= hi) return hi;
  return n;
};

export function withCollapseConfidence(gradients: GradientVector, collapseConfidence: number): GradientVector {
  const cc = clamp01(collapseConfidence);
  return {
    ...gradients,
    confidence: clamp01(0.65 * cc + 0.35 * clamp01(gradients.confidence)),
  };
}

export function gradientMode(gradients: GradientVector, ctx: GradientContext = {}): GradientMode {
  if (ctx.hasSecurityFlags || gradients.stress >= 0.7) return 'guarded';
  if (gradients.urgency >= 0.7) return 'urgent';
  if (gradients.curiosity >= 0.7) return 'exploratory';
  return 'stable';
}

export function applyToCollapse(gradients: GradientVector): CollapseModulation {
  const stress = clamp01(gradients.stress);
  const curiosity = clamp01(gradients.curiosity);
  const urgency = clamp01(gradients.urgency);
  const confidence = clamp01(gradients.confidence);

  let varianceThresholdDelta = 0;
  let confidenceLockDelta = 0;
  let maxEvaluationCyclesDelta = 0;

  // Higher URGENCY => collapse faster
  varianceThresholdDelta += 0.1 * urgency;
  if (urgency >= 0.7) maxEvaluationCyclesDelta -= 1;

  // Higher STRESS => collapse more conservative but faster structure
  confidenceLockDelta += 0.08 * stress;
  varianceThresholdDelta += 0.05 * stress;

  // Higher CURIOSITY => collapse slower (explore more)
  varianceThresholdDelta -= 0.1 * curiosity;
  if (curiosity >= 0.7 && urgency < 0.5) maxEvaluationCyclesDelta += 1;

  // Higher CONFIDENCE => lock sooner
  confidenceLockDelta -= 0.06 * confidence;

  varianceThresholdDelta = clamp(varianceThresholdDelta, -MAX_THRESHOLD_DELTA, MAX_THRESHOLD_DELTA);
  confidenceLockDelta = clamp(confidenceLockDelta, -MAX_THRESHOLD_DELTA, MAX_THRESHOLD_DELTA);
  maxEvaluationCyclesDelta = clampInt(maxEvaluationCyclesDelta, -1, 1);

  return {
    varianceThresholdDelta,
    confidenceLockDelta,
    maxEvaluationCyclesDelta,
  };
}

export function effectiveCollapseParams(
  gradients: GradientVector,
  base: { varianceThreshold?: number; confidenceLock?: number; maxEvaluationCycles?: number } = {}
): { varianceThreshold: number; confidenceLock: number; maxEvaluationCycles: number } {
  const modulation = applyToCollapse(gradients);

  const varianceThresholdBase = typeof base.varianceThreshold === 'number' ? base.varianceThreshold : VARIANCE_THRESHOLD;
  const confidenceLockBase = typeof base.confidenceLock === 'number' ? base.confidenceLock : CONFIDENCE_LOCK;
  const maxCyclesBase = typeof base.maxEvaluationCycles === 'number' ? base.maxEvaluationCycles : MAX_EVALUATION_CYCLES;

  const varianceThreshold = clamp(varianceThresholdBase + modulation.varianceThresholdDelta, 0.01, 0.25);
  const confidenceLock = clamp(confidenceLockBase + modulation.confidenceLockDelta, 0.55, 0.95);
  const maxEvaluationCycles = clampInt(maxCyclesBase + modulation.maxEvaluationCyclesDelta, 1, 5);

  return { varianceThreshold, confidenceLock, maxEvaluationCycles };
}

const verbosityLevels: AttractorPolicy['verbosity'][] = ['minimal', 'standard', 'expanded'];
const riskPostureLevels: AttractorPolicy['riskPosture'][] = ['open', 'cautious', 'restricted'];

const shiftByOne = <T,>(levels: T[], current: T, delta: number): T => {
  const i = Math.max(0, levels.indexOf(current));
  const ni = Math.max(0, Math.min(levels.length - 1, i + delta));
  return levels[ni];
};

export function applyToAttractorPolicy(
  policy: AttractorPolicy,
  gradients: GradientVector,
  ctx: GradientContext = {},
  isProtection = false
): AttractorPolicy {
  const stress = clamp01(gradients.stress);
  const curiosity = clamp01(gradients.curiosity);
  const urgency = clamp01(gradients.urgency);

  let next: AttractorPolicy = { ...policy };

  // A) Verbosity
  if (ctx.userIntent === 'overloaded' && !isProtection) {
    next.verbosity = 'minimal';
    next.structure = 'checklist';
  } else {
    let vShift = 0;
    if (urgency >= 0.7) vShift -= 1;
    if (stress >= 0.7) vShift -= 1;
    if (curiosity >= 0.7 && !isProtection) vShift += 1;

    // Limiter: max 1 level net shift.
    vShift = Math.max(-MAX_POLICY_SHIFT, Math.min(MAX_POLICY_SHIFT, vShift));
    next.verbosity = shiftByOne(verbosityLevels, next.verbosity, vShift);
  }

  // B) Tone
  if (ctx.hasSecurityFlags || stress >= 0.7) {
    next.tone = isProtection ? 'guarded' : 'formal';
  } else if (urgency >= 0.7) {
    // No creative flourish under urgency.
    if (next.tone === 'creative') next.tone = 'neutral';
    if (next.tone === 'guarded') next.tone = 'formal';
  } else if (curiosity >= 0.7 && !ctx.hasSecurityFlags && !isProtection) {
    next.tone = 'creative';
  }

  // C) Structure
  if (ctx.userIntent === 'overloaded' || stress >= 0.7) {
    next.structure = 'checklist';
  } else if (curiosity >= 0.7 && urgency < 0.7 && !isProtection) {
    next.structure = 'hybrid';
  }

  // D) Risk posture tightening / loosening
  let rDelta = 0;
  if (ctx.hasSecurityFlags) rDelta += 1;
  if (stress >= 0.7) rDelta += 1;
  if (curiosity >= 0.7 && !ctx.hasSecurityFlags && !isProtection) rDelta -= 1;

  // Limiter: max 1 step net.
  rDelta = Math.max(-MAX_RISK_POSTURE_TIGHTEN, Math.min(MAX_RISK_POSTURE_TIGHTEN, rDelta));
  next.riskPosture = shiftByOne(riskPostureLevels, next.riskPosture, rDelta);

  // Never loosen below open.
  if (next.riskPosture === 'open') next.riskPosture = 'open';

  return next;
}

export function applyGradientsToAttractorResult(
  result: AttractorResultLike,
  gradients: GradientVector,
  ctx: GradientContext = {}
): AttractorResultLike {
  const isProtection = result.id === 'protection';
  return {
    ...result,
    policy: applyToAttractorPolicy(result.policy, gradients, ctx, isProtection),
  };
}
