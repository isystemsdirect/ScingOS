import type { CoherenceBundle, OrderFocusInput } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

export function computeCoherence(input: OrderFocusInput, noise: number): CoherenceBundle {
  const collapseConfidence = clamp01(input.collapse.confidence);
  const curiosity = clamp01(input.gradients.curiosity);
  const urgency = clamp01(input.gradients.urgency);
  const stress = clamp01(input.gradients.stress);

  const ambiguity =
    typeof input.signals.ambiguity === 'number' ? clamp01(input.signals.ambiguity) : clamp01(1 - collapseConfidence);

  const baseOrder =
    0.4 +
    0.25 * (input.attractor.id === 'order' ? 1 : 0) +
    0.2 * (input.attractor.id === 'protection' ? 1 : 0) +
    0.25 * collapseConfidence -
    0.2 * ambiguity -
    0.15 * curiosity;

  // If stress is extreme, nudge down order unless posture is already controlled (order/protection attractor).
  const stressPenalty = stress >= 0.85 && input.attractor.id !== 'order' && input.attractor.id !== 'protection' ? 0.08 : 0;
  const order = clamp01(baseOrder - stressPenalty);

  const userIntent = input.context.userIntent ?? 'unknown';

  const baseFocus =
    0.35 +
    0.3 * (userIntent === 'directive' ? 1 : 0) +
    0.25 * urgency +
    0.15 * collapseConfidence -
    0.2 * curiosity -
    0.15 * clamp01(noise);

  const focus = clamp01(baseFocus);

  const coherence = clamp01(0.5 * order + 0.5 * focus - 0.35 * clamp01(noise));

  return { order, focus, coherence, noise: clamp01(noise) };
}
