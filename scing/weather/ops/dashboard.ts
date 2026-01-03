import type { WeatherHazard } from '../contracts/weatherSignal';

export type ProviderHealth = {
  provider: string;
  ok: boolean;
  lastSuccessUtc?: string;
  lastErrorUtc?: string;
  errorRate?: number; // 0..1
  latencyP95Ms?: number;
};

export type CacheFreshness = {
  geoKey: string;
  kind: 'current' | 'hourly' | 'daily' | 'alert';
  lastUpdatedUtc: string;
  isStale: boolean;
};

export type ActiveAlertSummary = {
  id: string;
  severity: 'info' | 'caution' | 'critical';
  hazards: WeatherHazard[];
  startsAtUtc?: string;
  endsAtUtc?: string;
};

export type WeatherOpsDashboardModel = {
  generatedAtUtc: string;
  providers: ProviderHealth[];
  cache: CacheFreshness[];
  activeAlerts: ActiveAlertSummary[];
  status: 'green' | 'yellow' | 'red';
  notes: string[];
};

export const buildWeatherOpsDashboardModel = (input: {
  nowUtc: string;
  providers: ProviderHealth[];
  cache: CacheFreshness[];
  activeAlerts: ActiveAlertSummary[];
}): WeatherOpsDashboardModel => {
  const notes: string[] = [];

  const providerDown = input.providers.some((p) => !p.ok);
  const staleCache = input.cache.some((c) => c.isStale);
  const criticalAlert = input.activeAlerts.some((a) => a.severity === 'critical');

  if (providerDown) notes.push('Provider health degraded');
  if (staleCache) notes.push('Cache freshness degraded');
  if (criticalAlert) notes.push('Critical alert active');

  const status: 'green' | 'yellow' | 'red' = criticalAlert || (providerDown && staleCache) ? 'red' : providerDown || staleCache ? 'yellow' : 'green';

  return {
    generatedAtUtc: input.nowUtc,
    providers: input.providers,
    cache: input.cache,
    activeAlerts: input.activeAlerts,
    status,
    notes,
  };
};
