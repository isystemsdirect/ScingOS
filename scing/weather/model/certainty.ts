import type { WeatherSignalKind } from '../contracts/weatherSignal';

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

export const baseCertaintyForKind = (kind: WeatherSignalKind): number => {
  switch (kind) {
    case 'current':
      return 0.9;
    case 'hourly':
      return 0.8;
    case 'daily':
      return 0.6;
    case 'alert':
      return 0.95;
    default:
      return 0.6;
  }
};

export type CertaintyInputs = {
  kind: WeatherSignalKind;
  anomalyDetected?: boolean;
  secondaryMissing?: boolean;
  isStale?: boolean;
  providersAgree?: boolean;
};

export const computeCertaintyScore = (inputs: CertaintyInputs): number => {
  let score = baseCertaintyForKind(inputs.kind);

  if (inputs.anomalyDetected) score -= 0.15;
  if (inputs.secondaryMissing) score -= 0.1;
  if (inputs.isStale) score -= 0.2;
  if (inputs.providersAgree) score += 0.05;

  // Canonical clamp: never below 0.2.
  return clamp(score, 0.2, 1.0);
};
