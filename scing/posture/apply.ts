import type { GradientVector } from '../gradients/types';
import type { IntegrationContext } from '../attractors/types';
import type { PostureId, PostureResult } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

export function postureToUserIntent(posture: PostureId): IntegrationContext['userIntent'] {
  switch (posture) {
    case 'exploratory':
      return 'exploratory';
    case 'directive':
      return 'directive';
    case 'overloaded':
      return 'overloaded';
    case 'confident':
      return 'directive';
    case 'frustrated':
      return 'directive';
    case 'unknown':
    default:
      return 'unknown';
  }
}

export function applyPostureToAttractorContext(
  base: IntegrationContext,
  posture: PostureResult
): IntegrationContext {
  return {
    ...base,
    userIntent: postureToUserIntent(posture.id),
  };
}

export function applyPostureToGradients(
  gradients: GradientVector,
  posture: PostureResult,
  ctx: { hasSecurityFlags?: boolean } = {}
): GradientVector {
  const hasSecurityFlags = !!ctx.hasSecurityFlags;

  let stress = clamp01(gradients.stress);
  let curiosity = clamp01(gradients.curiosity);

  if (posture.id === 'overloaded' || posture.id === 'frustrated') {
    stress = Math.max(stress, 0.45);
  }

  if (posture.id === 'exploratory' && !hasSecurityFlags) {
    curiosity = Math.max(curiosity, 0.45);
  }

  if (hasSecurityFlags) {
    curiosity = Math.min(curiosity, 0.45);
  }

  return { ...gradients, stress, curiosity };
}

export function postureOrderFocusActThresholdDelta(posture: PostureResult, ctx: { riskLow?: boolean }): number {
  if (posture.id === 'overloaded' || posture.id === 'frustrated') return 0.05;
  if (posture.id === 'confident' && postureToUserIntent(posture.id) === 'directive' && ctx.riskLow) return -0.03;
  return 0;
}

export function applyPostureToOutputLimits(
  outputLimits: { maxOptions?: number; maxLength?: 'short' | 'medium' | 'long' },
  posture: PostureResult
): { maxOptions?: number; maxLength?: 'short' | 'medium' | 'long' } {
  const maxOptions =
    typeof outputLimits.maxOptions === 'number'
      ? Math.min(outputLimits.maxOptions, posture.constraints.maxOptions)
      : posture.constraints.maxOptions;

  const maxLength = outputLimits.maxLength ?? posture.constraints.maxLength;

  return { ...outputLimits, maxOptions, maxLength };
}

export function applyPostureConstraintsToOutputLimits(
  outputLimits: { maxOptions?: number; maxLength?: 'short' | 'medium' | 'long' },
  postureConstraints: PostureResult['constraints']
): { maxOptions?: number; maxLength?: 'short' | 'medium' | 'long' } {
  const maxOptions =
    typeof outputLimits.maxOptions === 'number'
      ? Math.min(outputLimits.maxOptions, postureConstraints.maxOptions)
      : postureConstraints.maxOptions;

  const maxLength = outputLimits.maxLength ?? postureConstraints.maxLength;
  return { ...outputLimits, maxOptions, maxLength };
}
