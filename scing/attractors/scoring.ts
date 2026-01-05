import type { IntegrationInput } from './types';
import type { AttractorId, AttractorScore } from './types';
import { attractorRegistry } from './registry';

export type NeedVector = {
  clarityNeed: number;
  noveltyNeed: number;
  riskNeed: number;
  communicationNeed: number;
};

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const safeLower = (s: unknown): string => (typeof s === 'string' ? s.toLowerCase() : '');

const stableStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

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

const domainNoveltyHint = (domain?: string): number => {
  const d = safeLower(domain);
  if (!d) return 0;
  if (/design|creative|art|story|narrative|brand|marketing|architecture|strategy|research/.test(d))
    return 0.75;
  if (/engineering|devops|data|ml|ai|product/.test(d)) return 0.35;
  return 0.15;
};

const domainCommunicationHint = (domain?: string): number => {
  const d = safeLower(domain);
  if (!d) return 0.2;
  if (
    /stakeholder|proposal|brief|pitch|docs|documentation|explain|teach|training|alignment/.test(d)
  )
    return 0.75;
  return 0.25;
};

const payloadRiskHint = (payload: unknown): number => {
  const s = safeLower(stableStringify(payload));
  if (!s) return 0;

  // Heuristic buckets; deterministic and conservative.
  if (/password|passwd|secret|token|apikey|api_key|private[_-]?key|credential|oauth|bearer/.test(s))
    return 0.9;
  if (/payment|bank|wire|transfer|invoice|credit[_-]?card|crypto|wallet|funds|money/.test(s))
    return 0.85;
  if (/gdpr|hipaa|sox|pci|compliance|legal|contract|audit/.test(s)) return 0.75;
  if (/delete|drop\s+table|rm\s+-rf|format\s+disk|terminate|irreversible|production|prod\b/.test(s))
    return 0.75;
  if (/safety|harm|injury|weapon|explosive|poison/.test(s)) return 1.0;

  return 0.1;
};

const confidenceBand = (c: number): { low: boolean; medium: boolean; high: boolean } => {
  const cc = clamp01(c);
  return {
    low: cc < 0.5,
    medium: cc >= 0.45 && cc <= 0.75,
    high: cc >= 0.7,
  };
};

export function computeNeeds(input: IntegrationInput): NeedVector {
  const collapseConfidence = clamp01(input.collapse.confidence);
  const band = confidenceBand(collapseConfidence);

  const userIntent = input.context.userIntent ?? 'unknown';
  const timePressure = input.context.timePressure ?? 'low';

  const ambiguous =
    userIntent === 'unknown' || userIntent === 'overloaded' || !input.context.domain;

  const directive = userIntent === 'directive';
  const exploratory = userIntent === 'exploratory';

  // Clarity is primarily an execution structuring need.
  // Unknown/ambiguous intent raises clarity somewhat, but should not dominate selection.
  const clarityNeed = clamp01(
    (ambiguous ? 0.35 : 0.1) +
      (directive ? 0.45 : 0) +
      (band.high && directive ? 0.2 : 0) +
      (timePressure === 'high' ? 0.1 : 0)
  );

  const noveltyNeed = clamp01(
    (exploratory ? 0.55 : 0.1) +
      (band.medium ? 0.25 : 0) +
      domainNoveltyHint(input.context.domain) * 0.25
  );

  const riskNeed = clamp01(
    (input.context.hasSecurityFlags ? 0.95 : 0) +
      payloadRiskHint(input.collapse.selected?.payload) * 0.75 +
      (band.low && directive ? 0.2 : 0) +
      (timePressure === 'high' ? 0.1 : 0)
  );

  const communicationNeed = clamp01(
    (userIntent === 'overloaded' || userIntent === 'unknown' ? 0.6 : 0.2) +
      (exploratory ? 0.15 : 0) +
      domainCommunicationHint(input.context.domain) * 0.35
  );

  return {
    clarityNeed,
    noveltyNeed,
    riskNeed,
    communicationNeed,
  };
}

const weightedScore = (needs: NeedVector, weights: NeedVector): number => {
  const wSum =
    weights.clarityNeed + weights.noveltyNeed + weights.riskNeed + weights.communicationNeed;
  if (wSum <= 0) return 0;

  const raw =
    needs.clarityNeed * weights.clarityNeed +
    needs.noveltyNeed * weights.noveltyNeed +
    needs.riskNeed * weights.riskNeed +
    needs.communicationNeed * weights.communicationNeed;

  return clamp01(raw / wSum);
};

export function scoreAttractors(input: IntegrationInput): AttractorScore[] {
  const needs = computeNeeds(input);

  const ids: AttractorId[] = ['order', 'insight', 'protection', 'expression'];

  return ids.map((id) => {
    const entry = attractorRegistry[id];
    const score = weightedScore(needs, entry.scoringWeights);

    const reasons: string[] = [];
    // Internal reasons (never user-visible).
    reasons.push(`needs.clarity=${needs.clarityNeed.toFixed(3)}`);
    reasons.push(`needs.novelty=${needs.noveltyNeed.toFixed(3)}`);
    reasons.push(`needs.risk=${needs.riskNeed.toFixed(3)}`);
    reasons.push(`needs.comm=${needs.communicationNeed.toFixed(3)}`);
    reasons.push(`score=${score.toFixed(3)}`);

    return { id, score, reasons };
  });
}
