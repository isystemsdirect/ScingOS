import type { WeatherForLARI } from '../../weather/engines/views';
import { toLariWeatherContext } from '../context/weatherContext';
import { choosePlanWithLookahead } from '../planner/lookahead';
import type { LookaheadPlanCandidate } from '../planner/lookahead';
import type { LariPlan } from '../planner/withWeather';
import { makeWeatherDecisionDeltaLogEntry } from '../audit/weatherDeltas';

const assertEqual = (a: unknown, b: unknown, msg?: string): void => {
  if (a !== b) throw new Error(msg ?? `assertEqual failed: ${String(a)} !== ${String(b)}`);
};

const assertOk = (v: unknown, msg?: string): void => {
  if (!v) throw new Error(msg ?? 'assertOk failed');
};

const makeWeather = (overrides: Partial<WeatherForLARI>): WeatherForLARI => ({
  severityIndex: 0,
  certaintyScore: 1,
  hazards: [],
  forecastHorizon: 'current',
  isStale: false,
  ...overrides,
});

const makePlan = (
  id: string,
  baseCost: number,
  actionId: string,
  actionCost: number,
  tol?: { maxSeverity?: number; forbiddenHazards?: any[] }
): LariPlan => ({
  id,
  baseCost,
  actions: [
    {
      id: actionId,
      baseCost: actionCost,
      weatherTolerance: tol,
    },
  ],
});

export const runLariWeatherIntegrationTests = (): void => {
  const nowUtc = '2026-01-03T00:00:00.000Z';

  // 1) Clear now, storm near → delay plan (modeled as long-running action that would overlap into near).
  {
    const ctxNow = toLariWeatherContext({
      weather: makeWeather({ forecastHorizon: 'current', severityIndex: 1, hazards: [] }),
      nowUtc,
    });
    const ctxNear = toLariWeatherContext({
      weather: makeWeather({
        forecastHorizon: 'hourly',
        severityIndex: 8,
        hazards: ['wind', 'snow'],
      }),
      nowUtc,
    });
    const ctxFuture = toLariWeatherContext({
      weather: makeWeather({ forecastHorizon: 'daily', severityIndex: 1, hazards: [] }),
      nowUtc,
    });

    const contexts = { now: ctxNow, near: ctxNear, future: ctxFuture };

    const doNow: LookaheadPlanCandidate = {
      plan: makePlan('plan-now', 1, 'act', 1, { maxSeverity: 6 }),
      schedule: 'now',
      durationHours: 6,
    };

    const delayToFuture: LookaheadPlanCandidate = {
      plan: makePlan('plan-delay', 1, 'act', 1, { maxSeverity: 6 }),
      schedule: 'future',
    };

    const chosen = choosePlanWithLookahead([doNow, delayToFuture], contexts, {
      delayPreferenceWeight: 0.25,
      acceleratePreferenceWeight: 0.25,
    });

    assertEqual(chosen.planId, 'plan-delay');
  }

  // 2) Storm now, clear near → wait
  {
    const ctxNow = toLariWeatherContext({
      weather: makeWeather({ forecastHorizon: 'current', severityIndex: 8, hazards: ['wind'] }),
      nowUtc,
    });
    const ctxNear = toLariWeatherContext({
      weather: makeWeather({ forecastHorizon: 'hourly', severityIndex: 2, hazards: [] }),
      nowUtc,
    });
    const ctxFuture = toLariWeatherContext({
      weather: makeWeather({ forecastHorizon: 'daily', severityIndex: 3, hazards: [] }),
      nowUtc,
    });

    const contexts = { now: ctxNow, near: ctxNear, future: ctxFuture };

    const waitNear: LookaheadPlanCandidate = {
      plan: makePlan('plan-wait', 1, 'act', 1, { maxSeverity: 6 }),
      schedule: 'near',
    };

    const forceNow: LookaheadPlanCandidate = {
      plan: makePlan('plan-force', 1, 'act', 1, { maxSeverity: 6 }),
      schedule: 'now',
    };

    const chosen = choosePlanWithLookahead([forceNow, waitNear], contexts, {
      delayPreferenceWeight: 0.1,
    });

    assertEqual(chosen.planId, 'plan-wait');
  }

  // 3) Low certainty conflicting data → conservative output
  {
    const ctxNow = toLariWeatherContext({
      weather: makeWeather({
        forecastHorizon: 'current',
        severityIndex: 4,
        hazards: ['wind'],
        certaintyScore: 0.5,
      }),
      nowUtc,
    });
    const ctxNear = toLariWeatherContext({
      weather: makeWeather({
        forecastHorizon: 'hourly',
        severityIndex: 4,
        hazards: ['wind'],
        certaintyScore: 0.5,
      }),
      nowUtc,
    });
    const ctxFuture = toLariWeatherContext({
      weather: makeWeather({
        forecastHorizon: 'daily',
        severityIndex: 4,
        hazards: ['wind'],
        certaintyScore: 0.5,
      }),
      nowUtc,
    });

    const contexts = { now: ctxNow, near: ctxNear, future: ctxFuture };

    const riskyCheap: LookaheadPlanCandidate = {
      plan: makePlan('plan-risky', 0, 'act', 0 /* cheap */, undefined /* no tolerance declared */),
      schedule: 'now',
    };

    const safeExpensive: LookaheadPlanCandidate = {
      plan: makePlan('plan-safe', 1, 'act', 1, {
        maxSeverity: 5,
        forbiddenHazards: ['wind'] as any,
      }),
      schedule: 'now',
    };

    const chosen = choosePlanWithLookahead([riskyCheap, safeExpensive], contexts, {
      cautionSeverity: 5,
      weatherPenaltyWeight: 2,
    });

    // Under low confidence, the risky plan gets a conservative assumed maxSeverity=cautionSeverity;
    // wind hazard does not forbid by default, but the conservative mode increases penalties.
    // We require that the planner prefers the safe plan when low confidence is present.
    assertEqual(chosen.planId, 'plan-safe');
  }

  // 4) Critical alert (lightning) → immediate replan with hard stop
  {
    const ctxNow = toLariWeatherContext({
      weather: makeWeather({
        forecastHorizon: 'current',
        severityIndex: 9,
        hazards: ['lightning'],
        certaintyScore: 0.95,
      }),
      nowUtc,
    });

    const delta = makeWeatherDecisionDeltaLogEntry({
      decisionId: 'd1',
      previousPlanId: 'plan-a',
      newPlanId: 'plan-b',
      context: ctxNow,
    });

    assertOk(delta.rationale.includes('severity 9'));
    assertOk(delta.rationale.toLowerCase().includes('lightning'));
  }
};
