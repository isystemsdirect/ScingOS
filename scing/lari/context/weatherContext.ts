import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import type { WeatherForLARI } from '../../weather/engines/views';

export type LariForecastHorizon = 'now' | 'near' | 'future';

export type LariConfidenceBand = 'high' | 'medium' | 'low';

export type LariWeatherContext = {
  severityIndex: number;
  certaintyScore: number;
  hazards: WeatherHazard[];
  horizon: LariForecastHorizon;
  confidenceBand: LariConfidenceBand;
  stale: boolean;
};

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

export const mapWeatherKindToHorizon = (
  kind: WeatherForLARI['forecastHorizon']
): LariForecastHorizon => {
  // Horizon mapping (canonical):
  // - now   → current (0–3h)
  // - near  → hourly (3–24h)
  // - future→ daily (24h+)
  // Alerts are treated as “now” for planning urgency.
  switch (kind) {
    case 'current':
      return 'now';
    case 'hourly':
      return 'near';
    case 'daily':
      return 'future';
    case 'alert':
      return 'now';
    default:
      return 'now';
  }
};

export const toConfidenceBand = (certaintyScore: number): LariConfidenceBand => {
  const c = clamp(certaintyScore, 0, 1);
  if (c >= 0.85) return 'high';
  if (c >= 0.6) return 'medium';
  return 'low';
};

export const toLariWeatherContext = (input: {
  weather: WeatherForLARI;
  nowUtc: string;
}): LariWeatherContext => {
  const { weather } = input;

  return {
    severityIndex: clamp(weather.severityIndex, 0, 10),
    certaintyScore: clamp(weather.certaintyScore, 0, 1),
    hazards: weather.hazards ?? [],
    horizon: mapWeatherKindToHorizon(weather.forecastHorizon),
    confidenceBand: toConfidenceBand(weather.certaintyScore),
    stale: Boolean(weather.isStale),
  };
};
