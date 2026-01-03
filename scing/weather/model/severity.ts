import type { WeatherSignal } from '../contracts/weatherSignal';
import type { WeatherThresholdSet } from '../config/thresholds';
import { resolveWeatherThresholds } from '../config/thresholds';
import { alertSeverityToOverride } from './alerts';
import { computeHazardIntensities } from './intensity';

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

export type SeverityComputation = {
  baseSum: number;
  alertOverride: number;
  severityIndex: number;
};

export const computeSeverityIndex = (
  signal: WeatherSignal,
  thresholdSet?: WeatherThresholdSet
): SeverityComputation => {
  const resolved = thresholdSet ?? resolveWeatherThresholds();
  const weights = resolved.hazardWeights;

  const intensities = computeHazardIntensities(signal, resolved);
  let sum = 0;
  for (const hazard of Object.keys(intensities) as (keyof typeof intensities)[]) {
    sum += (weights[hazard] ?? 0) * (intensities[hazard] ?? 0);
  }

  const alertOverride = alertSeverityToOverride(signal.alert?.severity);
  const raw = sum + alertOverride;
  const clamped = clamp(raw, 0, 10);

  // Canonical rule: if alert present, severityIndex must be >= alertOverride.
  const severityIndex = signal.alert ? Math.max(clamped, alertOverride) : clamped;

  return {
    baseSum: sum,
    alertOverride,
    severityIndex,
  };
};
