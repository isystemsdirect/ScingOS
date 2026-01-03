import type { WeatherSignal } from '../contracts/weatherSignal';
import { computeSeverityIndex } from '../model/severity';

export type SeverityVector = {
  name: string;
  signal: WeatherSignal;
  expect: {
    min?: number;
    max?: number;
    exact?: number;
  };
};

const baseSignal = (overrides: Partial<WeatherSignal>): WeatherSignal => ({
  schemaVersion: '1.0',
  source: {
    provider: 'test',
    fetchedAtUtc: '2026-01-03T00:00:00.000Z',
    rawHash: 'raw',
  },
  geo: { lat: 0, lon: 0 },
  atUtc: '2026-01-03T00:00:00.000Z',
  kind: 'current',
  certaintyScore: 1,
  severityIndex: 0,
  metrics: {},
  hazards: [],
  ...overrides,
});

export const SEVERITY_TEST_VECTORS: SeverityVector[] = [
  {
    name: 'Light snow, no alert → severity ~1–2',
    signal: baseSignal({
      metrics: { snowMm: 1 },
      hazards: ['snow'],
    }),
    expect: { min: 0.8, max: 2.2 },
  },
  {
    name: 'Heavy snow + wind → severity ~6–7',
    signal: baseSignal({
      metrics: { snowMm: 60, windGustKph: 65 },
      hazards: ['snow', 'wind'],
    }),
    expect: { min: 5.5, max: 8.0 },
  },
  {
    name: 'Ice + wind + alert(caution) → severity ≥8',
    signal: baseSignal({
      metrics: { iceMm: 3, windGustKph: 60 },
      hazards: ['ice', 'wind'],
      alert: { id: 'a1', title: 'Caution', severity: 'caution' },
    }),
    expect: { min: 8 },
  },
  {
    name: 'Critical alert alone → severity ≥6',
    signal: baseSignal({
      hazards: [],
      alert: { id: 'a2', title: 'Critical', severity: 'critical' },
    }),
    expect: { min: 6 },
  },
  {
    name: 'Multiple hazards exceeding max → clamped at 10',
    signal: baseSignal({
      metrics: { snowMm: 80, iceMm: 6, windGustKph: 100, feelsLikeC: 46 },
      hazards: ['snow', 'ice', 'wind', 'heat', 'flood', 'lightning', 'tornado', 'hurricane'],
      alert: { id: 'a3', title: 'Critical', severity: 'critical' },
    }),
    expect: { exact: 10 },
  },
];

export const runSeverityVectors = (): void => {
  for (const v of SEVERITY_TEST_VECTORS) {
    const out = computeSeverityIndex(v.signal);
    const got = out.severityIndex;

    if (typeof v.expect.exact === 'number' && got !== v.expect.exact) {
      throw new Error(`${v.name}: expected exact ${v.expect.exact}, got ${got}`);
    }
    if (typeof v.expect.min === 'number' && got < v.expect.min) {
      throw new Error(`${v.name}: expected >= ${v.expect.min}, got ${got}`);
    }
    if (typeof v.expect.max === 'number' && got > v.expect.max) {
      throw new Error(`${v.name}: expected <= ${v.expect.max}, got ${got}`);
    }
  }
};
