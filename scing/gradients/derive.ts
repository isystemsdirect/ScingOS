import {
  DEFAULT_CONFIDENCE,
  DEFAULT_CURIOSITY,
  DEFAULT_STRESS,
  DEFAULT_URGENCY,
  MAX,
  MIN,
} from './config';
import type { GradientContext, GradientVector } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return MIN;
  if (v <= MIN) return MIN;
  if (v >= MAX) return MAX;
  return v;
};

const loadScore = (load?: 'low' | 'medium' | 'high'): number => {
  if (load === 'high') return 1;
  if (load === 'medium') return 0.5;
  return 0;
};

const errorsScore = (recentErrors?: number): number => {
  if (typeof recentErrors !== 'number' || !Number.isFinite(recentErrors) || recentErrors <= 0)
    return 0;
  // Normalize: 0..5 => 0..1, then clamp.
  return clamp01(recentErrors / 5);
};

export function deriveGradients(ctx: GradientContext = {}): GradientVector {
  const userIntent = ctx.userIntent ?? 'unknown';
  const timePressure = ctx.timePressure ?? 'low';
  const hasSecurityFlags = !!ctx.hasSecurityFlags;

  const sensorBioStress = clamp01(ctx.sensor?.bioStress ?? 0);
  const sensorVoiceTension = clamp01(ctx.sensor?.voiceTension ?? 0);

  // STRESS
  let stress = DEFAULT_STRESS;
  if (userIntent === 'overloaded') stress += 0.45;
  stress += errorsScore(ctx.recentErrors) * 0.25;
  stress += loadScore(ctx.systemLoad) * 0.25;
  stress += sensorBioStress * 0.35;
  stress += sensorVoiceTension * 0.25;

  // Hard safety rule: security flags floor stress.
  if (hasSecurityFlags) stress = Math.max(stress, 0.35);
  stress = clamp01(stress);

  // URGENCY
  let urgency = DEFAULT_URGENCY;
  if (timePressure === 'high') urgency += 0.6;
  else if (timePressure === 'medium') urgency += 0.2;
  if (userIntent === 'directive') urgency += 0.25;
  urgency = clamp01(urgency);

  // CONFIDENCE
  // Derived primarily from CB-01 later; until then stay at safe neutral.
  let confidence = clamp01(DEFAULT_CONFIDENCE);

  // CURIOSITY
  // Encouraged for exploratory posture and medium confidence band.
  // Since we don't have collapse confidence here, we treat default confidence as a mild medium-band signal.
  const mediumBandHint = confidence >= 0.45 && confidence <= 0.7 ? 0.1 : 0;

  let curiosity = DEFAULT_CURIOSITY;
  if (userIntent === 'exploratory') curiosity += 0.45;
  if (!hasSecurityFlags) curiosity += 0.15;
  curiosity += mediumBandHint;

  // Hard safety rule: security flags cap curiosity.
  if (hasSecurityFlags) curiosity = Math.min(curiosity, 0.45);
  curiosity = clamp01(curiosity);

  return {
    stress,
    curiosity,
    urgency,
    confidence,
  };
}
