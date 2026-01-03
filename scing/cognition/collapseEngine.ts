import {
  CONFIDENCE_LOCK,
  MAX_EVALUATION_CYCLES,
  MAX_PARALLEL_HYPOTHESES,
  VARIANCE_THRESHOLD,
} from './config';
import type { CollapseResult, Hypothesis, HypothesisSet } from './types';

type CandidateInput = {
  candidates?: unknown[];
  constraints?: unknown;
};

type ConstraintFn = (payload: unknown, input: unknown) => boolean;

type ConfidenceHints = Partial<{
  alignment: number;
  coherence: number;
  constraintSatisfaction: number;
}>;

type ConfidenceFn = (hypothesis: Hypothesis, input: unknown, cycle: number) => number | ConfidenceHints;

type GeneratorFn = (input: unknown, idx: number, n: number) => Omit<Hypothesis, 'stability'> | Hypothesis;

type CollapseInput = unknown &
  Partial<{
    candidates: unknown[];
    generateHypothesis: GeneratorFn;
    evaluateConfidence: ConfidenceFn;
    constraints: ConstraintFn;
    maxHypotheses: number;
    varianceThreshold: number;
    confidenceLock: number;
    maxEvaluationCycles: number;
  }>;

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const toNumberOr = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const stableStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();

  const walk = (v: unknown): unknown => {
    if (!isRecord(v)) {
      if (Array.isArray(v)) return v.map(walk);
      return v;
    }

    if (seen.has(v)) return '[Circular]';
    seen.add(v);

    if (Array.isArray(v)) return v.map(walk);

    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort()) out[k] = walk(v[k]);
    return out;
  };

  try {
    return JSON.stringify(walk(value));
  } catch {
    return String(value);
  }
};

// FNV-1a 32-bit
const hash32 = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

const pickMaxHypothesis = (hypotheses: Hypothesis[]): Hypothesis => {
  // Deterministic tie-break: confidence desc, stability desc, id asc.
  return [...hypotheses].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (b.stability !== a.stability) return b.stability - a.stability;
    return a.id.localeCompare(b.id);
  })[0];
};

const normalizeInitialHypothesis = (h: Omit<Hypothesis, 'stability'> | Hypothesis, idx: number): Hypothesis => {
  const id = typeof h.id === 'string' && h.id.trim() ? h.id : `h${idx}`;
  const confidence = clamp01(toNumberOr((h as any).confidence, 0.5));
  const stability = clamp01(toNumberOr((h as any).stability, 1));
  return {
    id,
    payload: (h as any).payload,
    confidence,
    stability,
  };
};

export async function generateHypotheses(input: unknown): Promise<HypothesisSet> {
  const cfg = input as CollapseInput;
  const maxN = Math.max(1, Math.min(MAX_PARALLEL_HYPOTHESES, toNumberOr(cfg.maxHypotheses, MAX_PARALLEL_HYPOTHESES)));

  const candidates = Array.isArray((cfg as CandidateInput)?.candidates) ? (cfg as CandidateInput).candidates! : null;

  let n = 4;
  if (candidates && candidates.length > 0) n = Math.min(maxN, candidates.length);
  else n = Math.min(maxN, n);

  const generator: GeneratorFn =
    typeof cfg.generateHypothesis === 'function'
      ? cfg.generateHypothesis
      : (rawInput, idx) => {
          if (candidates && candidates[idx] !== undefined) {
            return { id: `h${idx}`, payload: candidates[idx], confidence: 0.5 };
          }
          // If no explicit candidates, synthesize distinct (but deterministic) variants.
          return { id: `h${idx}`, payload: { input: rawInput, variant: idx }, confidence: 0.5 };
        };

  const candidateOrder: number[] = (() => {
    if (!candidates || candidates.length === 0) return [...Array(n)].map((_, i) => i);

    const scored = candidates.map((c, i) => ({
      i,
      h: hash32(stableStringify(c)),
    }));
    scored.sort((a, b) => (a.h !== b.h ? a.h - b.h : a.i - b.i));
    return scored.slice(0, n).map((x) => x.i);
  })();

  // "Parallel" spawn: schedule all generation tasks at once.
  const tasks = candidateOrder.map(async (candidateIdx, spawnIdx) => {
    const idx = candidates ? candidateIdx : spawnIdx;
    const h = await Promise.resolve(generator(input, idx, n));
    return normalizeInitialHypothesis(h, spawnIdx);
  });

  const hypotheses = await Promise.all(tasks);

  return {
    hypotheses,
    variance: 0,
    collapsed: false,
  };
}

export function evaluateConfidence(hypothesis: Hypothesis, input?: unknown, cycle = 0): Hypothesis {
  const cfg = (input ?? {}) as CollapseInput;
  const userEval = typeof cfg.evaluateConfidence === 'function' ? cfg.evaluateConfidence : null;
  const constraintFn: ConstraintFn | null = typeof cfg.constraints === 'function' ? cfg.constraints : null;

  const prev = clamp01(hypothesis.confidence);

  let nextConfidence = prev;

  if (userEval) {
    const out = userEval(hypothesis, input, cycle);
    if (typeof out === 'number') {
      nextConfidence = clamp01(out);
    } else if (out && typeof out === 'object') {
      const alignment = clamp01(toNumberOr((out as any).alignment, 0.5));
      const coherence = clamp01(toNumberOr((out as any).coherence, 0.5));
      const constraintSatisfaction = clamp01(toNumberOr((out as any).constraintSatisfaction, 0.5));
      // Equal weighting, deterministic.
      nextConfidence = clamp01((alignment + coherence + constraintSatisfaction) / 3);
    }
  } else {
    // Default heuristic: prefer payloads that satisfy constraints (if provided) and appear "well-formed".
    const payload = hypothesis.payload;

    const alignment = clamp01(isRecord(payload) || typeof payload === 'string' ? 0.6 : 0.5);
    const coherence = clamp01(payload !== undefined && payload !== null ? 0.6 : 0.3);
    const constraintsOk = constraintFn ? (constraintFn(payload, input) ? 1 : 0) : 0.5;

    nextConfidence = clamp01((alignment + coherence + constraintsOk) / 3);
  }

  // Stability = inverse of confidence delta across cycles.
  const delta = Math.abs(nextConfidence - prev);
  const stability = clamp01(1 - delta);

  return {
    ...hypothesis,
    confidence: nextConfidence,
    stability,
  };
}

export function calculateVariance(hypotheses: Hypothesis[]): number {
  const n = hypotheses.length;
  if (n <= 1) return 0;

  const mean = hypotheses.reduce((acc, h) => acc + clamp01(h.confidence), 0) / n;
  const v = hypotheses.reduce((acc, h) => {
    const d = clamp01(h.confidence) - mean;
    return acc + d * d;
  }, 0);

  return v / n;
}

export function attemptCollapse(hypothesisSet: HypothesisSet, evaluationCycles = 0, input?: unknown): CollapseResult | null {
  if (hypothesisSet.collapsed) {
    const selected = pickMaxHypothesis(hypothesisSet.hypotheses);
    return {
      selected,
      confidence: selected.confidence,
      collapseReason: 'timeout',
    };
  }

  const cfg = (input ?? {}) as CollapseInput;
  const varianceThreshold = clamp01(toNumberOr(cfg.varianceThreshold, VARIANCE_THRESHOLD));
  const confidenceLock = clamp01(toNumberOr(cfg.confidenceLock, CONFIDENCE_LOCK));
  const maxCycles = Math.max(1, Math.floor(toNumberOr(cfg.maxEvaluationCycles, MAX_EVALUATION_CYCLES)));

  const best = pickMaxHypothesis(hypothesisSet.hypotheses);

  const varianceTrigger = hypothesisSet.variance <= varianceThreshold;
  const maxConfidenceTrigger = best.confidence >= confidenceLock;
  const timeoutTrigger = evaluationCycles >= maxCycles;

  if (!varianceTrigger && !maxConfidenceTrigger && !timeoutTrigger) return null;

  let collapseReason: CollapseResult['collapseReason'] = 'timeout';
  if (varianceTrigger) collapseReason = 'variance_threshold';
  else if (maxConfidenceTrigger) collapseReason = 'max_confidence';
  else collapseReason = 'timeout';

  hypothesisSet.collapsed = true;

  return {
    selected: best,
    confidence: best.confidence,
    collapseReason,
  };
}

export async function cognitiveCollapse(input: unknown): Promise<CollapseResult> {
  // 1) generateHypotheses(input)
  const hypothesisSet = await generateHypotheses(input);

  const cfg = input as CollapseInput;
  const maxCycles = Math.max(1, Math.floor(toNumberOr(cfg.maxEvaluationCycles, MAX_EVALUATION_CYCLES)));

  // 2) Loop (max MAX_EVALUATION_CYCLES)
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    // No stepwise reasoning rule: each hypothesis is evaluated independently; no access to other hypotheses.
    hypothesisSet.hypotheses = await Promise.all(
      hypothesisSet.hypotheses.map(async (h) => evaluateConfidence(h, input, cycle))
    );

    hypothesisSet.variance = calculateVariance(hypothesisSet.hypotheses);

    const collapsed = attemptCollapse(hypothesisSet, cycle, input);
    if (collapsed) return collapsed;
  }

  // 3) Force collapse if still unresolved
  hypothesisSet.variance = calculateVariance(hypothesisSet.hypotheses);
  const forced = attemptCollapse(hypothesisSet, maxCycles, input);
  if (forced) return forced;

  // Should be unreachable, but keep deterministic behavior.
  const selected = pickMaxHypothesis(hypothesisSet.hypotheses);
  return { selected, confidence: selected.confidence, collapseReason: 'timeout' };
}
