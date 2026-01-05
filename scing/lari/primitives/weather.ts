import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import type { LariWeatherContext } from '../context/weatherContext';

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

export const assessWeatherRisk = (context: LariWeatherContext): number => {
  const uncertaintyPenalty = context.confidenceBand === 'low' ? 0.3 : 0;
  const severityFactor = clamp01(context.severityIndex / 10);
  // Canonical rule:
  // riskScore = severityIndex / 10 × (1 − uncertaintyPenalty)
  return clamp01(severityFactor * (1 - uncertaintyPenalty));
};

export type WeatherBlockingThresholds = {
  hardStopThreshold: number;
  criticalHazards?: WeatherHazard[];
};

const DEFAULT_CRITICAL_HAZARDS: WeatherHazard[] = ['lightning', 'tornado'];

export const isWeatherBlocking = (
  context: LariWeatherContext,
  thresholds: WeatherBlockingThresholds
): boolean => {
  const hardStop = context.severityIndex >= thresholds.hardStopThreshold;
  if (hardStop) return true;

  const criticalHazards = thresholds.criticalHazards ?? DEFAULT_CRITICAL_HAZARDS;
  const hazardSet = new Set(context.hazards);
  for (const h of criticalHazards) {
    if (hazardSet.has(h)) return true;
  }

  return false;
};

export const weatherPenalty = (context: LariWeatherContext): number => {
  // Numeric cost primitive; kept deterministic and bounded.
  // Default: risk plus a small conservatism bump if stale.
  const risk = assessWeatherRisk(context);
  const staleBump = context.stale ? 0.15 : 0;
  return clamp01(risk + staleBump);
};
