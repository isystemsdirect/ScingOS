export type LariWeatherConfig = {
  hardStopSeverity: number;
  cautionSeverity: number;
  delayPreferenceWeight: number;
  acceleratePreferenceWeight: number;
  weatherPenaltyWeight: number;
};

export const DEFAULT_LARI_WEATHER_CONFIG: LariWeatherConfig = {
  hardStopSeverity: 8,
  cautionSeverity: 5,
  delayPreferenceWeight: 0.25,
  acceleratePreferenceWeight: 0.25,
  weatherPenaltyWeight: 1.0,
};
