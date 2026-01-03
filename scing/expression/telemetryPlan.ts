import type { AttractorResult } from '../attractors/types';
import type { GradientVector } from '../gradients/types';
import type { GatingDecision } from '../identity/types';
import type { ColorChannel, TelemetryFrame, VisualState } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const stateFromDisposition = (d: GatingDecision['disposition']): VisualState => {
  switch (d) {
    case 'act':
      return 'executing';
    case 'pause':
      return 'pausing';
    case 'ask':
      return 'asking';
    case 'decline':
      return 'declining';
    case 'defer':
      return 'guarding';
    default:
      return 'idle';
  }
};

const baselineFromAttractor = (id: AttractorResult['id']): { state: VisualState; channel: ColorChannel } => {
  switch (id) {
    case 'order':
      return { state: 'focused', channel: 'amber_think' };
    case 'insight':
      return { state: 'thinking', channel: 'amber_think' };
    case 'protection':
      return { state: 'guarding', channel: 'redviolet_alert' };
    case 'expression':
    default:
      return { state: 'speaking', channel: 'rainbow_speak' };
  }
};

export function buildTelemetry(
  attractor: AttractorResult,
  gradients: GradientVector,
  decision: GatingDecision,
  context: { hasSecurityFlags?: boolean } = {}
): TelemetryFrame {
  const urgency = clamp01(gradients.urgency);
  const curiosity = clamp01(gradients.curiosity);
  const stress = clamp01(gradients.stress);
  const confidence = clamp01(gradients.confidence);

  const dispWins = decision.disposition === 'decline' || decision.disposition === 'pause' || decision.disposition === 'ask';

  const baseA = baselineFromAttractor(attractor.id);
  const state = dispWins ? stateFromDisposition(decision.disposition) : baseA.state;

  // Channel override rules
  const channel: ColorChannel =
    attractor.id === 'protection' || context.hasSecurityFlags
      ? 'redviolet_alert'
      : state === 'speaking'
        ? 'rainbow_speak'
        : 'amber_think';

  const stressGain = attractor.id === 'protection' || state === 'guarding' || state === 'declining' ? 0.25 : 0.1;

  // Intensity
  const intensity = clamp01(0.45 + 0.3 * urgency + 0.2 * curiosity + stressGain * stress + 0.25 * confidence);

  // Motion
  const pulseRate = clamp01(0.2 + 0.6 * urgency + 0.2 * stress);
  const morphRate = clamp01(0.15 + 0.7 * curiosity + 0.2 * (1 - confidence));
  const tighten = clamp01(
    0.2 + 0.6 * stress + 0.3 * (attractor.id === 'order' ? 1 : 0) + 0.3 * (attractor.id === 'protection' ? 1 : 0)
  );
  const expand = clamp01(0.15 + 0.7 * curiosity - 0.3 * stress);
  const stillness = clamp01(0.2 + 0.6 * confidence + 0.4 * (decision.disposition === 'pause' || decision.disposition === 'decline' ? 1 : 0) - 0.3 * urgency);

  const tags: string[] = [];
  if (urgency >= 0.7) tags.push('high_urgency');
  if (stress >= 0.7) tags.push('high_stress');
  if (curiosity >= 0.7) tags.push('high_curiosity');
  if (confidence <= 0.45) tags.push('low_confidence');
  if (attractor.id === 'protection' || decision.disposition === 'decline') tags.push('protection_mode');

  // TTL
  let ttlMs = 5000;
  if (urgency >= 0.7) ttlMs = 2500;
  if (decision.disposition === 'pause' || decision.disposition === 'decline') ttlMs = 8000;

  return {
    state,
    channel,
    intensity,
    motion: { pulseRate, morphRate, tighten, expand, stillness },
    tags,
    ttlMs,
  };
}
