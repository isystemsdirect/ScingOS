import type { WeatherHazard, WeatherSignal } from '../contracts/weatherSignal';
import { computeStaleStatus, DEFAULT_STALE_POLICY } from '../model/stale';
import type { WeatherThresholdSet } from '../config/thresholds';
import { resolveWeatherThresholds } from '../config/thresholds';
import { computeHazardIntensities } from '../model/intensity';

export type WeatherForLARI = {
  severityIndex: number;
  certaintyScore: number;
  hazards: WeatherHazard[];
  forecastHorizon: WeatherSignal['kind'];
  isStale: boolean;
};

export type WeatherForBANE = {
  severityIndex: number;
  hazards: WeatherHazard[];
  hardStop: boolean;
  isStale: boolean;
};

export type WeatherForSRT = {
  severityIndex: number;
  primaryHazard: WeatherHazard | null;
  alertPresent: boolean;
  isStale: boolean;
};

const pickPrimaryHazard = (
  signal: WeatherSignal,
  thresholds: WeatherThresholdSet
): WeatherHazard | null => {
  if (signal.hazards.length === 0) return null;

  const intensities = computeHazardIntensities(signal, thresholds);
  const weights = thresholds.hazardWeights;

  let best: { hazard: WeatherHazard; score: number } | null = null;
  for (const hazard of signal.hazards) {
    const s = (weights[hazard] ?? 0) * (intensities[hazard] ?? 0);
    if (!best || s > best.score) best = { hazard, score: s };
  }

  return best?.hazard ?? signal.hazards[0] ?? null;
};

export const toWeatherForLARI = (signal: WeatherSignal, nowUtcIso: string): WeatherForLARI => {
  const stale = computeStaleStatus(signal, nowUtcIso, DEFAULT_STALE_POLICY);

  return {
    severityIndex: signal.severityIndex,
    certaintyScore: signal.certaintyScore,
    hazards: signal.hazards,
    forecastHorizon: signal.kind,
    isStale: stale.isStale,
  };
};

export const toWeatherForBANE = (
  signal: WeatherSignal,
  nowUtcIso: string,
  opts?: { thresholds?: WeatherThresholdSet }
): WeatherForBANE => {
  const thresholds = opts?.thresholds ?? resolveWeatherThresholds();
  const stale = computeStaleStatus(signal, nowUtcIso, DEFAULT_STALE_POLICY);

  return {
    severityIndex: signal.severityIndex,
    hazards: signal.hazards,
    hardStop: signal.severityIndex >= thresholds.hardStopSeverityIndex,
    isStale: stale.isStale,
  };
};

export const toWeatherForSRT = (
  signal: WeatherSignal,
  nowUtcIso: string,
  opts?: { thresholds?: WeatherThresholdSet }
): WeatherForSRT => {
  const thresholds = opts?.thresholds ?? resolveWeatherThresholds();
  const stale = computeStaleStatus(signal, nowUtcIso, DEFAULT_STALE_POLICY);

  return {
    severityIndex: signal.severityIndex,
    primaryHazard: pickPrimaryHazard(signal, thresholds),
    alertPresent: Boolean(signal.alert),
    isStale: stale.isStale,
  };
};
