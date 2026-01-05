import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import { buildWeatherIndicatorModel, shouldWeatherIndicatorUpdate } from '../weather/Indicator';
import { buildWeatherPanelModel, toggleWeatherPanel } from '../weather/Panel';

const assertEqual = (a: unknown, b: unknown, msg?: string): void => {
  if (a !== b) throw new Error(msg ?? `assertEqual failed: ${String(a)} !== ${String(b)}`);
};

const assertOk = (v: unknown, msg?: string): void => {
  if (!v) throw new Error(msg ?? 'assertOk failed');
};

const makeHazards = (...h: WeatherHazard[]): WeatherHazard[] => h;

export const runWeatherUiTests = (): void => {
  const nowUtc = '2026-01-03T00:00:00.000Z';

  // 1) Indicator updates on severity change
  {
    const prev = {
      severityIndex: 2,
      hazards: makeHazards('wind'),
      certaintyScore: 0.9,
      stale: false,
    };
    const next = { ...prev, severityIndex: 3 };
    assertEqual(shouldWeatherIndicatorUpdate(prev, next), true);

    const next2 = { ...prev, certaintyScore: 0.7 };
    assertEqual(shouldWeatherIndicatorUpdate(prev, next2), false);
  }

  // 2) Drill-down opens correctly (state toggle)
  {
    assertEqual(toggleWeatherPanel(false), true);
    assertEqual(toggleWeatherPanel(true), false);
  }

  // 3) Critical alert blocks workflow (modal + acknowledgement)
  {
    const model = buildWeatherPanelModel({
      open: true,
      nowUtc,
      snapshot: {
        severityIndex: 9,
        hazards: makeHazards('lightning'),
        certaintyScore: 0.95,
        certaintyBand: 'high',
        lastUpdatedUtc: nowUtc,
        stale: false,
      },
      near: [],
      future: [],
      alerts: [{ id: 'a1', title: 'Lightning Warning', severity: 'critical' }],
      acknowledged: {},
    });

    assertEqual(model.alertSurface, 'modal_blocking');

    const acked = buildWeatherPanelModel({
      ...model,
      nowUtc,
      snapshot: {
        severityIndex: 9,
        hazards: makeHazards('lightning'),
        certaintyScore: 0.95,
        certaintyBand: 'high',
        lastUpdatedUtc: nowUtc,
        stale: false,
      },
      near: [],
      future: [],
      alerts: [{ id: 'a1', title: 'Lightning Warning', severity: 'critical' }],
      acknowledged: { a1: true },
      open: true,
    });

    assertOk(acked.alertSurface !== 'modal_blocking');
  }

  // 4) Stale data visually indicated
  {
    const m = buildWeatherIndicatorModel({
      severityIndex: 4,
      hazards: makeHazards('wind'),
      certaintyScore: 0.8,
      stale: true,
    });
    assertEqual(m.stale, true);

    const panel = buildWeatherPanelModel({
      open: true,
      nowUtc,
      snapshot: {
        severityIndex: 4,
        hazards: makeHazards('wind'),
        certaintyScore: 0.8,
        certaintyBand: 'medium',
        lastUpdatedUtc: '2026-01-02T00:00:00.000Z',
        stale: true,
      },
      near: [],
      future: [],
      alerts: [],
      acknowledged: {},
    });

    assertEqual(panel.snapshot.desaturated, true);
    assertOk(panel.snapshot.lastUpdatedText.toLowerCase().includes('last updated'));
  }
};
