import type { WeatherSignal, WeatherSignalKind } from '../contracts/weatherSignal';

export type StalePolicy = {
  currentMaxAgeMs: number;
  hourlyMaxAgeMs: number;
  dailyMaxAgeMs: number;
  alertsMaxAgeMs: number;
};

export const DEFAULT_STALE_POLICY: StalePolicy = {
  currentMaxAgeMs: 30 * 60 * 1000,
  hourlyMaxAgeMs: 2 * 60 * 60 * 1000,
  dailyMaxAgeMs: 24 * 60 * 60 * 1000,
  alertsMaxAgeMs: 30 * 60 * 1000,
};

const parseUtcMs = (isoUtc: string | undefined): number | null => {
  if (!isoUtc) return null;
  const ms = Date.parse(isoUtc);
  return Number.isFinite(ms) ? ms : null;
};

export type StaleStatus = {
  isStale: boolean;
  ageMs: number;
  maxAgeMs: number;
};

export const getMaxAgeMsForKind = (
  kind: WeatherSignalKind,
  signal: WeatherSignal,
  policy: StalePolicy,
  nowUtcIso: string,
): number => {
  if (kind !== 'alert') {
    switch (kind) {
      case 'current':
        return policy.currentMaxAgeMs;
      case 'hourly':
        return policy.hourlyMaxAgeMs;
      case 'daily':
        return policy.dailyMaxAgeMs;
      default:
        return policy.currentMaxAgeMs;
    }
  }

  // Alerts: until endsAtUtc or 30 minutes since last fetch.
  const nowMs = Date.parse(nowUtcIso);
  const endsMs = parseUtcMs(signal.alert?.endsAtUtc);
  const fetchedMs = parseUtcMs(signal.source.fetchedAtUtc);
  if (!Number.isFinite(nowMs) || fetchedMs === null) return policy.alertsMaxAgeMs;

  if (endsMs !== null && endsMs > nowMs) {
    return Math.max(0, endsMs - fetchedMs);
  }

  return policy.alertsMaxAgeMs;
};

export const computeStaleStatus = (signal: WeatherSignal, nowUtcIso: string, policy: StalePolicy = DEFAULT_STALE_POLICY): StaleStatus => {
  const nowMs = Date.parse(nowUtcIso);
  const fetchedMs = Date.parse(signal.source.fetchedAtUtc);
  const ageMs = Number.isFinite(nowMs) && Number.isFinite(fetchedMs) ? Math.max(0, nowMs - fetchedMs) : 0;

  const maxAgeMs = getMaxAgeMsForKind(signal.kind, signal, policy, nowUtcIso);
  return {
    isStale: ageMs > maxAgeMs,
    ageMs,
    maxAgeMs,
  };
};
