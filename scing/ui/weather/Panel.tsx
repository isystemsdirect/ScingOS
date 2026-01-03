import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import { bandLabel, severityToBand, type WeatherSeverityBand } from './colors';
import type { WeatherTimelineModel, WeatherTimelinePoint } from './Timeline';
import { buildWeatherTimelineModel } from './Timeline';

export type WeatherCertaintyBand = 'high' | 'medium' | 'low';

export type WeatherPanelSnapshot = {
  severityIndex: number;
  hazards: WeatherHazard[];
  certaintyScore: number;
  certaintyBand: WeatherCertaintyBand;
  lastUpdatedUtc: string;
  stale: boolean;
};

export type WeatherPanelAlert = {
  id: string;
  title: string;
  severity: 'info' | 'caution' | 'critical';
  startsAtUtc?: string;
  endsAtUtc?: string;
  hazards?: WeatherHazard[];
};

export type AlertSurface = 'none' | 'banner_passive' | 'banner_highlight' | 'modal_blocking';

export type WeatherPanelModel = {
  open: boolean;
  snapshot: {
    severityIndex: number;
    band: WeatherSeverityBand;
    hazards: WeatherHazard[];
    certaintyText: string;
    lastUpdatedText: string;
    stale: boolean;
    desaturated: boolean;
  };
  timelineNear: WeatherTimelineModel;
  timelineFuture: WeatherTimelineModel;
  alerts: WeatherPanelAlert[];
  alertSurface: AlertSurface;
  explanation: string;
};

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

export const certaintyToBand = (certaintyScore: number): WeatherCertaintyBand => {
  const c = clamp01(certaintyScore);
  if (c >= 0.85) return 'high';
  if (c >= 0.6) return 'medium';
  return 'low';
};

export const alertSurfaceForAlerts = (alerts: WeatherPanelAlert[], acknowledged: Record<string, boolean> | undefined): AlertSurface => {
  if (!alerts || alerts.length === 0) return 'none';

  const isAck = (id: string): boolean => Boolean(acknowledged?.[id]);

  const critical = alerts.find((a) => a.severity === 'critical' && !isAck(a.id));
  if (critical) return 'modal_blocking';

  const caution = alerts.find((a) => a.severity === 'caution');
  if (caution) return 'banner_highlight';

  const info = alerts.find((a) => a.severity === 'info');
  if (info) return 'banner_passive';

  return 'none';
};

const hazardsPlain = (hazards: WeatherHazard[]): string => {
  if (!hazards || hazards.length === 0) return 'None';
  if (hazards.length === 1) return hazards[0];
  return `${hazards[0]} (+${hazards.length - 1} more)`;
};

export const buildWeatherPanelModel = (input: {
  open: boolean;
  nowUtc: string;
  snapshot: WeatherPanelSnapshot;
  near: WeatherTimelinePoint[];
  future: WeatherTimelinePoint[];
  alerts: WeatherPanelAlert[];
  acknowledged?: Record<string, boolean>;
}): WeatherPanelModel => {
  const band = severityToBand(input.snapshot.severityIndex);
  const certaintyBand = certaintyToBand(input.snapshot.certaintyScore);

  const alertSurface = alertSurfaceForAlerts(input.alerts, input.acknowledged);

  const certaintyText =
    certaintyBand === 'high'
      ? 'High confidence'
      : certaintyBand === 'medium'
        ? 'Medium confidence'
        : 'Low confidence (uncertain)';

  const explanationParts: string[] = [];
  explanationParts.push(`${bandLabel(band)} conditions`);
  explanationParts.push(`hazards: ${hazardsPlain(input.snapshot.hazards)}`);
  if (input.snapshot.stale) explanationParts.push('stale data; last updated shown');
  if (certaintyBand === 'low') explanationParts.push('low certainty; avoid alarmist wording');

  return {
    open: input.open,
    snapshot: {
      severityIndex: input.snapshot.severityIndex,
      band,
      hazards: input.snapshot.hazards,
      certaintyText,
      lastUpdatedText: `Last updated ${input.snapshot.lastUpdatedUtc}`,
      stale: input.snapshot.stale,
      desaturated: Boolean(input.snapshot.stale),
    },
    timelineNear: buildWeatherTimelineModel({ points: input.near, maxPoints: 24 }),
    timelineFuture: buildWeatherTimelineModel({ points: input.future, maxPoints: 28 }),
    alerts: input.alerts,
    alertSurface,
    explanation: explanationParts.join(' • '),
  };
};

export const toggleWeatherPanel = (open: boolean): boolean => !open;
