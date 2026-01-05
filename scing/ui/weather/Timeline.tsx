import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import { severityToBand, type WeatherSeverityBand } from './colors';

export type WeatherTimelinePoint = {
  atUtc: string;
  severityIndex: number;
  hazards: WeatherHazard[];
  alertSeverity?: 'info' | 'caution' | 'critical';
};

export type WeatherTimelineModelPoint = {
  atUtc: string;
  severityIndex: number;
  band: WeatherSeverityBand;
  hazards: WeatherHazard[];
  alertMarker: boolean;
};

export type WeatherTimelineModel = {
  points: WeatherTimelineModelPoint[];
  coarse: boolean;
};

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = arr.length / maxPoints;
  const out: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(arr[Math.floor(i * step)] as T);
  }
  return out;
}

export const buildWeatherTimelineModel = (input: {
  points: WeatherTimelinePoint[];
  maxPoints?: number;
}): WeatherTimelineModel => {
  const max = clamp(input.maxPoints ?? 24, 6, 96);
  const coarse = input.points.length > max;
  const pts = downsample(input.points, max);

  return {
    coarse,
    points: pts.map((p) => ({
      atUtc: p.atUtc,
      severityIndex: p.severityIndex,
      band: severityToBand(p.severityIndex),
      hazards: p.hazards,
      alertMarker:
        p.alertSeverity === 'critical' ||
        p.alertSeverity === 'caution' ||
        p.alertSeverity === 'info',
    })),
  };
};

export const describeTimelinePoint = (p: WeatherTimelineModelPoint): string => {
  const hz = p.hazards && p.hazards.length > 0 ? p.hazards[0] : 'clear';
  return `${p.atUtc} sev=${Math.round(p.severityIndex)} ${hz}${p.alertMarker ? ' alert' : ''}`;
};
