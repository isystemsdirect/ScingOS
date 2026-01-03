import type { WeatherHazard } from '../../weather/contracts/weatherSignal';
import type { LariWeatherContext } from '../context/weatherContext';
import { isWeatherBlocking, weatherPenalty } from '../primitives/weather';
import type { LariWeatherConfig } from '../config/weather';
import { DEFAULT_LARI_WEATHER_CONFIG } from '../config/weather';

export type WeatherTolerance = {
  maxSeverity?: number;
  forbiddenHazards?: WeatherHazard[];
};

export type LariAction = {
  id: string;
  baseCost: number;
  weatherTolerance?: WeatherTolerance;
};

export type LariPlan = {
  id: string;
  actions: LariAction[];
  baseCost: number;
};

export type PlanScore = {
  planId: string;
  valid: boolean;
  totalCost: number;
  reasons: string[];
  refreshRequested: boolean;
};

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

const intersects = (a: WeatherHazard[] | undefined, b: WeatherHazard[]): WeatherHazard[] => {
  if (!a || a.length === 0) return [];
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

const normalizeTolerance = (t: WeatherTolerance | undefined, cfg: LariWeatherConfig, conservative: boolean): WeatherTolerance => {
  if (!conservative) return t ?? {};

  // Conservative mode rule:
  // - Under low certainty or staleness, assume “caution” max severity unless explicitly overridden.
  const maxSeverity = typeof t?.maxSeverity === 'number' ? t.maxSeverity : cfg.cautionSeverity;
  return {
    ...t,
    maxSeverity,
  };
};

export const scorePlanWithWeather = (plan: LariPlan, context: LariWeatherContext, cfg?: Partial<LariWeatherConfig>): PlanScore => {
  const config = { ...DEFAULT_LARI_WEATHER_CONFIG, ...(cfg ?? {}) };
  const reasons: string[] = [];

  const refreshRequested = Boolean(context.stale);

  if (context.confidenceBand === 'low') {
    reasons.push(`low-confidence weather (certainty=${context.certaintyScore.toFixed(2)})`);
  }
  if (context.stale) {
    reasons.push('stale weather signal; prefer minimal-risk actions');
  }

  // Hard block (canonical): severity >= hardStop OR critical hazard present.
  if (isWeatherBlocking(context, { hardStopThreshold: config.hardStopSeverity })) {
    return {
      planId: plan.id,
      valid: false,
      totalCost: Number.POSITIVE_INFINITY,
      reasons: [...reasons, 'blocked by hard-stop weather constraints'],
      refreshRequested,
    };
  }

  const conservative = context.confidenceBand === 'low' || context.stale;

  let total = plan.baseCost;

  // Action-level tolerance evaluation.
  for (const action of plan.actions) {
    total += action.baseCost;

    const tol = normalizeTolerance(action.weatherTolerance, config, conservative);

    const forbidden = intersects(tol.forbiddenHazards, context.hazards);
    if (forbidden.length > 0) {
      return {
        planId: plan.id,
        valid: false,
        totalCost: Number.POSITIVE_INFINITY,
        reasons: [...reasons, `action ${action.id} forbidden hazards present: ${forbidden.join(', ')}`],
        refreshRequested,
      };
    }

    if (typeof tol.maxSeverity === 'number' && context.severityIndex > tol.maxSeverity) {
      // Penalize exceedance deterministically; rejection is reserved for extreme exceedance.
      const exceed = context.severityIndex - tol.maxSeverity;
      const reject = exceed >= 3;
      if (reject) {
        return {
          planId: plan.id,
          valid: false,
          totalCost: Number.POSITIVE_INFINITY,
          reasons: [...reasons, `action ${action.id} exceeds maxSeverity by ${exceed.toFixed(1)} (rejected)`],
          refreshRequested,
        };
      }

      const penalty = clamp(exceed / 10, 0, 1) * config.weatherPenaltyWeight;
      total += penalty;
      reasons.push(`action ${action.id} exceeds maxSeverity; +${penalty.toFixed(2)} penalty`);
    }
  }

  // Plan-level penalty injection.
  const wp = weatherPenalty(context) * config.weatherPenaltyWeight;
  total += wp;
  reasons.push(`weatherPenalty=${wp.toFixed(2)} (severity=${context.severityIndex.toFixed(1)})`);

  return {
    planId: plan.id,
    valid: true,
    totalCost: total,
    reasons,
    refreshRequested,
  };
};

export const selectBestPlanWithWeather = (plans: LariPlan[], context: LariWeatherContext, cfg?: Partial<LariWeatherConfig>): PlanScore => {
  let best: PlanScore | null = null;
  for (const plan of plans) {
    const scored = scorePlanWithWeather(plan, context, cfg);
    if (!scored.valid) continue;
    if (!best || scored.totalCost < best.totalCost) best = scored;
  }

  return (
    best ?? {
      planId: 'none',
      valid: false,
      totalCost: Number.POSITIVE_INFINITY,
      reasons: ['no valid plan under weather constraints'],
      refreshRequested: Boolean(context.stale),
    }
  );
};
