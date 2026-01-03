import type { WeatherAlertSeverity } from '../contracts/weatherSignal';

export const alertSeverityToOverride = (severity?: WeatherAlertSeverity): 0 | 2 | 4 | 6 => {
  if (!severity) return 0;
  switch (severity) {
    case 'info':
      return 2;
    case 'caution':
      return 4;
    case 'critical':
      return 6;
    default:
      return 0;
  }
};
