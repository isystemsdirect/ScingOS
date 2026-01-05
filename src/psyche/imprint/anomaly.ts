import { clamp01, computeRollingStats, zScore } from './baseline';

export type MetricSample = { ts: string; value: number };

export type AnomalyResult = {
  anomalyScore: number; // 0..1
  components: Array<{ metric: string; z: number; weight: number }>;
  unknown: boolean;
};

function boundedAbsZ(z: number): number {
  const a = Math.abs(z);
  // Map: 0 -> 0, 1 -> ~0.33, 2 -> ~0.66, 3+ -> 1
  return clamp01(a / 3);
}

export function computeAnomalyScore(params: {
  // rolling baseline window values (e.g., last 14–30 days)
  baseline: Record<string, number[]>;
  today: Record<string, number | null | undefined>;
  minSamples?: number;
  weights?: Record<string, number>;
}): AnomalyResult {
  const minSamples = typeof params.minSamples === 'number' ? params.minSamples : 10;
  const weights = params.weights ?? {};

  const components: AnomalyResult['components'] = [];
  let totalWeight = 0;
  let total = 0;

  for (const [metric, todayValue] of Object.entries(params.today)) {
    if (typeof todayValue !== 'number' || !Number.isFinite(todayValue)) continue;

    const baselineValues = params.baseline[metric] ?? [];
    if (baselineValues.length < minSamples) continue;

    const stats = computeRollingStats(baselineValues);
    if (!stats) continue;

    const z = zScore(todayValue, stats);
    const w = typeof weights[metric] === 'number' && Number.isFinite(weights[metric]) ? weights[metric] : 1;

    totalWeight += w;
    total += boundedAbsZ(z) * w;
    components.push({ metric, z, weight: w });
  }

  if (totalWeight <= 0) return { anomalyScore: 0, components, unknown: true };
  return { anomalyScore: clamp01(total / totalWeight), components, unknown: false };
}
