import type { AnomalyResult } from './anomaly';

export type Readiness = 'low' | 'normal' | 'high' | 'unknown';

export type UserStateEstimate = {
  ts: string;
  energy: Readiness;
  load: Readiness;
  confidence: number; // 0..1
  reasons: string[];
};

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function estimateUserState(params: {
  ts: string;
  anomaly: AnomalyResult;
  indicators: {
    sleepDebt?: 'low' | 'moderate' | 'high' | 'unknown';
    restingHrTrend?: 'down' | 'flat' | 'up' | 'unknown';
    hrvTrend?: 'down' | 'flat' | 'up' | 'unknown';
    interruptionRate?: number; // interruptions/hour
  };
}): UserStateEstimate {
  const reasons: string[] = [];

  if (params.indicators.sleepDebt && params.indicators.sleepDebt !== 'unknown') {
    reasons.push(`sleep debt ${params.indicators.sleepDebt}`);
  }
  if (params.indicators.restingHrTrend && params.indicators.restingHrTrend !== 'unknown') {
    reasons.push(`resting HR trend ${params.indicators.restingHrTrend}`);
  }
  if (params.indicators.hrvTrend && params.indicators.hrvTrend !== 'unknown') {
    reasons.push(`HRV trend ${params.indicators.hrvTrend}`);
  }
  if (typeof params.indicators.interruptionRate === 'number' && Number.isFinite(params.indicators.interruptionRate)) {
    reasons.push(`interruption rate ${Math.round(params.indicators.interruptionRate)} per hour`);
  }

  // Confidence is bounded and cannot hallucinate: if anomaly is unknown and indicators are sparse, stay unknown.
  const signalCount = reasons.length;
  const anomalyConfidence = params.anomaly.unknown ? 0 : clamp01(0.4 + 0.6 * params.anomaly.anomalyScore);
  const indicatorConfidence = clamp01(signalCount / 4);
  const confidence = clamp01(0.5 * anomalyConfidence + 0.5 * indicatorConfidence);

  const load = (() => {
    if (confidence < 0.35) return 'unknown';
    if (params.anomaly.anomalyScore >= 0.7) return 'high';
    if (params.anomaly.anomalyScore <= 0.25) return 'low';
    return 'normal';
  })();

  const energy = (() => {
    if (confidence < 0.35) return 'unknown';

    // Conservative heuristic: high sleep debt or HRV down -> energy low.
    const sleepDebt = params.indicators.sleepDebt;
    const hrvTrend = params.indicators.hrvTrend;

    if (sleepDebt === 'high') return 'low';
    if (sleepDebt === 'moderate' && hrvTrend === 'down') return 'low';
    if (sleepDebt === 'low' && hrvTrend === 'up') return 'high';

    return 'normal';
  })();

  return { ts: params.ts, energy, load, confidence, reasons };
}
