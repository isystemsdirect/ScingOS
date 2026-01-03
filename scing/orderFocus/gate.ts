import {
  COHERENCE_ACT,
  COHERENCE_ASK,
  CONTRADICTION_PAUSE,
  INPUT_STALE_MS,
  NOISE_HIGH,
  OSCILLATION_PAUSE,
} from './config';
import { computeCoherence } from './coherence';
import { computeIntentStability } from './stability';
import type { OrderFocusInput, OrderFocusReasonCode, OrderFocusState } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const isStale = (lastInputTs: number | undefined, nowTs: number): boolean => {
  if (!Number.isFinite(lastInputTs as any)) return false;
  return nowTs - (lastInputTs as number) >= INPUT_STALE_MS;
};

export function computeContradiction(input: OrderFocusInput): number {
  const provided =
    typeof input.signals.contradiction === 'number' ? clamp01(input.signals.contradiction) : 0;

  const collapseConfidence = clamp01(input.collapse.confidence);
  const urgency = clamp01(input.gradients.urgency);
  const curiosity = clamp01(input.gradients.curiosity);

  const userIntent = input.context.userIntent ?? 'unknown';
  const requestImpact = input.context.requestImpact ?? 'medium';

  let inferred = 0;
  if (collapseConfidence <= 0.45) inferred += 0.35;
  if (urgency >= 0.7 && curiosity >= 0.7) inferred += 0.25;
  if (userIntent === 'unknown' && requestImpact === 'high') inferred += 0.25;
  inferred = clamp01(inferred);

  return Math.max(provided, inferred);
}

export function computeNoise(
  input: OrderFocusInput,
  oscillation: number,
  contradiction: number
): number {
  const collapseConfidence = clamp01(input.collapse.confidence);
  const stress = clamp01(input.gradients.stress);
  const userIntent = input.context.userIntent ?? 'unknown';

  const baseNoise =
    0.1 +
    0.3 * (1 - collapseConfidence) +
    0.3 * clamp01(contradiction) +
    0.2 * (userIntent === 'unknown' ? 1 : 0) +
    0.2 * (userIntent === 'overloaded' ? 1 : 0) +
    0.15 * stress;

  // Oscillation is a direct noise component.
  const withOsc = baseNoise + 0.25 * clamp01(oscillation);
  return clamp01(withOsc);
}

export function gateOrderFocus(
  input: OrderFocusInput,
  nowTs: number = Date.now()
): OrderFocusState {
  const { intentStability, oscillation } = computeIntentStability(input.history, nowTs);
  const contradiction = computeContradiction(input);

  const noise = computeNoise(input, oscillation, contradiction);
  const bundle = computeCoherence(input, noise);

  const stale = isStale(input.signals.lastInputTs, nowTs);
  const coherence = stale ? clamp01(bundle.coherence - 0.15) : bundle.coherence;

  const hasSecurityFlags = !!input.context.hasSecurityFlags;
  const timePressure = input.context.timePressure ?? 'medium';
  const postureId = input.context.postureId;

  const riskLow = !hasSecurityFlags && input.attractor.id !== 'protection' && contradiction < 0.5;
  let coherenceAct = COHERENCE_ACT;
  if (postureId === 'overloaded' || postureId === 'frustrated')
    coherenceAct = clamp01(coherenceAct + 0.05);
  if (
    postureId === 'confident' &&
    (input.context.userIntent ?? 'unknown') === 'directive' &&
    riskLow
  ) {
    coherenceAct = clamp01(coherenceAct - 0.03);
  }

  let dispositionBias: OrderFocusState['dispositionBias'] = 'pause';
  let reasonCode: OrderFocusReasonCode = 'ambiguous';

  // RULE 1 — Risk dominates
  if (hasSecurityFlags || input.attractor.id === 'protection') {
    if (contradiction >= 0.7 || coherence < COHERENCE_ASK) {
      dispositionBias = 'defer';
    } else {
      dispositionBias = 'act';
    }
    reasonCode = 'risky';
  } else if (contradiction >= CONTRADICTION_PAUSE) {
    // RULE 2 — Hard contradiction
    dispositionBias = timePressure === 'high' ? 'ask' : 'pause';
    reasonCode = 'conflicted';
  } else if (oscillation >= OSCILLATION_PAUSE) {
    // RULE 3 — Oscillation
    dispositionBias = timePressure === 'high' ? 'ask' : 'pause';
    reasonCode = 'oscillating';
  } else if (coherence >= coherenceAct && intentStability >= 0.6) {
    // RULE 4 — Strong coherence
    dispositionBias = 'act';
    reasonCode = 'stable';
  } else if (coherence >= COHERENCE_ASK) {
    // RULE 5 — Medium coherence
    dispositionBias = 'ask';
    reasonCode = 'ambiguous';
  } else {
    // RULE 6 — Low coherence
    dispositionBias = 'pause';
    reasonCode = 'ambiguous';
  }

  if (stale) {
    // Stale overrides reasonCode and biases toward ASK unless risk rule forced defer.
    if (dispositionBias !== 'defer') dispositionBias = 'ask';
    reasonCode = 'stale_inputs';
  }

  // Noise high is a restraint hint but stays deterministic: it only downgrades act -> ask.
  if (bundle.noise >= NOISE_HIGH && dispositionBias === 'act') {
    dispositionBias = 'ask';
    reasonCode = reasonCode === 'stable' ? 'ambiguous' : reasonCode;
  }

  return {
    order: bundle.order,
    focus: bundle.focus,
    coherence,
    intentStability,
    contradiction,
    noise: bundle.noise,
    dispositionBias,
    reasonCode,
  };
}
