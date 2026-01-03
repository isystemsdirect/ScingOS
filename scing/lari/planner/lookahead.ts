import type { LariWeatherContext } from '../context/weatherContext';
import type { LariWeatherConfig } from '../config/weather';
import { DEFAULT_LARI_WEATHER_CONFIG } from '../config/weather';
import type { LariPlan } from './withWeather';
import { scorePlanWithWeather } from './withWeather';

export type HorizonKey = 'now' | 'near' | 'future';

export type HorizonContexts = {
  now: LariWeatherContext;
  near: LariWeatherContext;
  future: LariWeatherContext;
};

export type LookaheadPlanCandidate = {
  plan: LariPlan;
  // When this plan is intended to execute.
  schedule: HorizonKey;
  // Optional: long-running operations may span into the next horizon.
  durationHours?: number;
};

export type LookaheadScore = {
  planId: string;
  schedule: HorizonKey;
  scoreNow: number;
  scoreNear: number;
  scoreFuture: number;
  chosenCost: number;
  rationale: string;
  refreshRequested: boolean;
};

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

const blendCostForDuration = (schedule: HorizonKey, durationHours: number | undefined, costs: Record<HorizonKey, number>): number => {
  if (!durationHours || durationHours <= 0) return costs[schedule];

  // Canonical horizon bands: now (0-3h), near (3-24h), future (24h+)
  // If an action spans across horizons, conservatively take the worst (max) cost.
  if (schedule === 'now' && durationHours > 3) {
    return Math.max(costs.now, costs.near);
  }
  if (schedule === 'near' && durationHours > 21) {
    return Math.max(costs.near, costs.future);
  }
  return costs[schedule];
};

export const scorePlanLookahead = (candidate: LookaheadPlanCandidate, contexts: HorizonContexts, cfg?: Partial<LariWeatherConfig>): LookaheadScore => {
  const config = { ...DEFAULT_LARI_WEATHER_CONFIG, ...(cfg ?? {}) };

  const scoredNow = scorePlanWithWeather(candidate.plan, contexts.now, config);
  const scoredNear = scorePlanWithWeather(candidate.plan, contexts.near, config);
  const scoredFuture = scorePlanWithWeather(candidate.plan, contexts.future, config);

  const costs: Record<HorizonKey, number> = {
    now: scoredNow.totalCost,
    near: scoredNear.totalCost,
    future: scoredFuture.totalCost,
  };

  const scheduleCost = candidate.schedule === 'near' ? config.delayPreferenceWeight : candidate.schedule === 'future' ? config.delayPreferenceWeight * 2 : 0;

  // Prefer acceleration if future severity worsens (heuristic bonus for executing earlier).
  const worsening = clamp01((contexts.future.severityIndex - contexts.now.severityIndex) / 10);
  const accelerateBonus = candidate.schedule === 'now' ? config.acceleratePreferenceWeight * worsening : 0;

  const blended = blendCostForDuration(candidate.schedule, candidate.durationHours, costs);
  const chosenCost = blended + scheduleCost - accelerateBonus;

  const label = candidate.schedule === 'now' ? 'now' : candidate.schedule === 'near' ? 'near-term' : 'future';
  const hazard = (contexts[candidate.schedule].hazards[0] ?? 'weather').toString();
  const rationaleParts: string[] = [];

  if (!Number.isFinite(chosenCost) || chosenCost === Number.POSITIVE_INFINITY) {
    rationaleParts.push('candidate invalid under weather constraints');
  } else {
    if (candidate.schedule !== 'now') {
      rationaleParts.push(`selected ${label} execution to reduce risk`);
    } else if (accelerateBonus > 0.01) {
      rationaleParts.push('selected immediate execution to avoid worsening forecast');
    } else {
      rationaleParts.push(`selected ${label} execution`);
    }

    rationaleParts.push(`primary hazard: ${hazard}`);
    rationaleParts.push(`severity=${contexts[candidate.schedule].severityIndex.toFixed(1)}`);

    if (contexts[candidate.schedule].confidenceBand === 'low') {
      rationaleParts.push(`uncertainty noted (certainty=${contexts[candidate.schedule].certaintyScore.toFixed(2)})`);
    }

    if (contexts[candidate.schedule].stale) {
      rationaleParts.push('stale weather; refresh requested');
    }
  }

  return {
    planId: candidate.plan.id,
    schedule: candidate.schedule,
    scoreNow: scoredNow.totalCost,
    scoreNear: scoredNear.totalCost,
    scoreFuture: scoredFuture.totalCost,
    chosenCost,
    rationale: rationaleParts.join(' | '),
    refreshRequested: Boolean(scoredNow.refreshRequested || scoredNear.refreshRequested || scoredFuture.refreshRequested),
  };
};

export const choosePlanWithLookahead = (candidates: LookaheadPlanCandidate[], contexts: HorizonContexts, cfg?: Partial<LariWeatherConfig>): LookaheadScore => {
  let best: LookaheadScore | null = null;
  for (const c of candidates) {
    const s = scorePlanLookahead(c, contexts, cfg);
    if (!Number.isFinite(s.chosenCost)) continue;
    if (!best || s.chosenCost < best.chosenCost) best = s;
  }

  return (
    best ?? {
      planId: 'none',
      schedule: 'now',
      scoreNow: Number.POSITIVE_INFINITY,
      scoreNear: Number.POSITIVE_INFINITY,
      scoreFuture: Number.POSITIVE_INFINITY,
      chosenCost: Number.POSITIVE_INFINITY,
      rationale: 'no valid plan under forecast lookahead',
      refreshRequested: Boolean(contexts.now.stale || contexts.near.stale || contexts.future.stale),
    }
  );
};
