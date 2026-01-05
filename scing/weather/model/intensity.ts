import type { HazardThresholdMatrix, WeatherThresholdSet } from '../config/thresholds';
import { resolveWeatherThresholds } from '../config/thresholds';
import type { WeatherHazard, WeatherSignal } from '../contracts/weatherSignal';

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

const stepIntensity = (
  value: number,
  thresholds: { low: number; mid: number; high: number },
  mode: 'ge' | 'le'
): number => {
  if (!Number.isFinite(value)) return 0;

  if (mode === 'ge') {
    if (value >= thresholds.high) return 1;
    if (value >= thresholds.mid) return 0.6;
    if (value >= thresholds.low) return 0.3;
    return 0;
  }

  // 'le'
  if (value <= thresholds.high) return 1;
  if (value <= thresholds.mid) return 0.5;
  return 0;
};

export type HazardIntensityMap = Record<WeatherHazard, number>;

export const computeHazardIntensity = (
  hazard: WeatherHazard,
  signal: WeatherSignal,
  thresholds: HazardThresholdMatrix
): number => {
  const hazardsSet = new Set(signal.hazards);
  const m = signal.metrics;

  switch (hazard) {
    case 'snow': {
      if (m.precipType === 'snow') return 0.5;
      const snowMm = m.snowMm ?? 0;
      if (snowMm <= 0) return 0;
      if (snowMm >= thresholds.snowMmHeavy) return 1;
      if (snowMm >= thresholds.snowMmModerate) return 0.5;
      return 0.2;
    }

    case 'ice': {
      const iceMm = m.iceMm ?? 0;
      if (iceMm > 0) {
        if (iceMm >= thresholds.iceMmHeavy) return 1;
        if (iceMm >= thresholds.iceMmModerate) return 0.7;
        return 0.4;
      }
      // Near-freezing + precip present => potential ice
      const temp = m.tempC ?? m.feelsLikeC;
      const precipPresent = (m.precipMmHr ?? 0) > 0 || (m.precipMm ?? 0) > 0;
      if (precipPresent && typeof temp === 'number' && temp >= -1 && temp <= 1) return 0.3;
      return 0;
    }

    case 'wind': {
      const gust = m.windGustKph ?? m.windKph ?? 0;
      return stepIntensity(
        gust,
        {
          low: thresholds.windGustKphLight,
          mid: thresholds.windGustKphModerate,
          high: thresholds.windGustKphSevere,
        },
        'ge'
      );
    }

    case 'heat': {
      const feelsLike = m.feelsLikeC ?? m.tempC ?? 0;
      return stepIntensity(
        feelsLike,
        {
          low: thresholds.heatFeelsLikeCLight,
          mid: thresholds.heatFeelsLikeCModerate,
          high: thresholds.heatFeelsLikeCSevere,
        },
        'ge'
      );
    }

    case 'flood':
    case 'lightning':
    case 'tornado':
    case 'hurricane':
    case 'dust':
    case 'smoke': {
      return hazardsSet.has(hazard) ? 1 : 0;
    }

    case 'hail': {
      if (m.precipType === 'hail') return 1;
      return hazardsSet.has('hail') ? 1 : 0;
    }

    case 'fog': {
      const visKm = m.visibilityKm;
      if (typeof visKm === 'number') {
        if (visKm <= thresholds.fogVisibilityKmSevere) return 1;
        if (visKm <= thresholds.fogVisibilityKmModerate) return 0.5;
        return 0;
      }
      return hazardsSet.has('fog') ? 0.5 : 0;
    }

    default:
      return 0;
  }
};

export const computeHazardIntensities = (
  signal: WeatherSignal,
  thresholdSet?: WeatherThresholdSet
): HazardIntensityMap => {
  const resolved = thresholdSet ?? resolveWeatherThresholds();
  const thresholds = resolved.hazardThresholds;

  const hazards: WeatherHazard[] = [
    'snow',
    'ice',
    'heat',
    'wind',
    'flood',
    'lightning',
    'fog',
    'hail',
    'tornado',
    'hurricane',
    'dust',
    'smoke',
  ];

  const out = {} as HazardIntensityMap;
  for (const hazard of hazards) {
    out[hazard] = clamp01(computeHazardIntensity(hazard, signal, thresholds));
  }
  return out;
};
