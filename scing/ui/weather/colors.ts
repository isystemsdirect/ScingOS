export type WeatherSeverityBand = 'neutral' | 'caution' | 'elevated' | 'critical';

export const severityToBand = (severityIndex: number): WeatherSeverityBand => {
  const s = Number.isFinite(severityIndex) ? severityIndex : 0;
  if (s >= 8) return 'critical';
  if (s >= 6) return 'elevated';
  if (s >= 3) return 'caution';
  return 'neutral';
};

export const bandLabel = (band: WeatherSeverityBand): string => {
  switch (band) {
    case 'neutral':
      return 'Neutral';
    case 'caution':
      return 'Caution';
    case 'elevated':
      return 'Elevated caution';
    case 'critical':
      return 'Critical';
    default:
      return 'Neutral';
  }
};

// No hard-coded colors here; consumers map these semantic tokens to their design system.
export const bandToColorToken = (band: WeatherSeverityBand): string => `weather.${band}`;
