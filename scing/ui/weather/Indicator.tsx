import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import { bandLabel, severityToBand, type WeatherSeverityBand } from './colors';

export type WeatherIndicatorInput = {
  severityIndex: number;
  hazards: WeatherHazard[];
  certaintyScore: number;
  stale: boolean;
};

export type WeatherIndicatorModel = {
  primaryHazard: WeatherHazard | 'clear';
  severityBand: WeatherSeverityBand;
  tooltip: string;
  ariaLabel: string;
  stale: boolean;
  // Consumers can wire this to open a drill-down panel.
  action: { kind: 'open_weather_panel' };
};

const hazardToPlainLanguage = (h: WeatherHazard): string => {
  switch (h) {
    case 'snow':
      return 'snow';
    case 'ice':
      return 'ice';
    case 'wind':
      return 'wind';
    case 'heat':
      return 'heat';
    case 'flood':
      return 'flooding';
    case 'lightning':
      return 'lightning';
    case 'fog':
      return 'fog';
    case 'hail':
      return 'hail';
    case 'tornado':
      return 'tornado';
    case 'hurricane':
      return 'hurricane';
    case 'dust':
      return 'dust';
    case 'smoke':
      return 'smoke';
    default:
      return 'weather';
  }
};

const pickPrimaryHazard = (hazards: WeatherHazard[] | undefined): WeatherHazard | 'clear' => {
  if (!hazards || hazards.length === 0) return 'clear';
  return hazards[0] ?? 'clear';
};

export const buildWeatherIndicatorModel = (input: WeatherIndicatorInput): WeatherIndicatorModel => {
  const primaryHazard = pickPrimaryHazard(input.hazards);
  const band = severityToBand(input.severityIndex);

  const hazardText = primaryHazard === 'clear' ? 'Clear' : hazardToPlainLanguage(primaryHazard);
  const tooltip = `Severity ${Math.round(input.severityIndex)} – ${hazardText}`;

  const aria =
    primaryHazard === 'clear'
      ? `Weather severity level ${Math.round(input.severityIndex)}, clear conditions`
      : `Weather severity level ${Math.round(input.severityIndex)}, ${hazardText} risk`;

  return {
    primaryHazard,
    severityBand: band,
    tooltip,
    ariaLabel: aria,
    stale: Boolean(input.stale),
    action: { kind: 'open_weather_panel' },
  };
};

// Memoization hook: update only on severity band change or primary hazard change.
// This ensures the indicator remains performant and does not re-render on minor certainty churn.
export const shouldWeatherIndicatorUpdate = (prev: WeatherIndicatorInput, next: WeatherIndicatorInput): boolean => {
  if (severityToBand(prev.severityIndex) !== severityToBand(next.severityIndex)) return true;
  if (pickPrimaryHazard(prev.hazards) !== pickPrimaryHazard(next.hazards)) return true;
  if (Boolean(prev.stale) !== Boolean(next.stale)) return true;
  return false;
};

export const describeIndicator = (m: WeatherIndicatorModel): string => {
  const band = bandLabel(m.severityBand);
  const hazard = m.primaryHazard === 'clear' ? 'clear' : m.primaryHazard;
  return `${band} • ${hazard}${m.stale ? ' • stale' : ''}`;
};
