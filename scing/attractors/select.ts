import type { CollapseResult } from '../cognition/types';
import type {
  AttractorPolicy,
  AttractorResult,
  AttractorScore,
  IntegrationContext,
  IntegrationInput,
} from './types';
import { ATTRACTOR_TIE_BREAK, attractorRegistry } from './registry';
import { computeNeeds, scoreAttractors } from './scoring';
import type { GradientVector } from '../gradients/types';
import { applyToAttractorPolicy } from '../gradients/apply';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const downgradeVerbosity = (v: AttractorPolicy['verbosity']): AttractorPolicy['verbosity'] => {
  if (v === 'expanded') return 'standard';
  if (v === 'standard') return 'minimal';
  return 'minimal';
};

const pickByTieBreak = (scores: AttractorScore[]): AttractorScore => {
  // Deterministic max selection with strict tie-break ordering.
  const eps = 1e-12;

  return [...scores].sort((a, b) => {
    if (Math.abs(b.score - a.score) > eps) return b.score - a.score;
    return ATTRACTOR_TIE_BREAK.indexOf(a.id) - ATTRACTOR_TIE_BREAK.indexOf(b.id);
  })[0];
};

export function selectAttractor(
  scores: AttractorScore[],
  input: IntegrationInput
): AttractorResult {
  const needs = computeNeeds(input);

  // 1) Hard override rules (highest precedence)
  if (input.context.hasSecurityFlags || needs.riskNeed >= 0.7) {
    const policy = { ...attractorRegistry.protection.policyDefaults };
    const confidenceBaseline = scores.find((s) => s.id === 'protection')?.score ?? needs.riskNeed;
    const confidence = clamp01(
      input.collapse.confidence < 0.5 ? Math.min(confidenceBaseline, 0.65) : confidenceBaseline
    );
    return { id: 'protection', confidence, policy };
  }

  if (needs.clarityNeed >= 0.7 && input.collapse.confidence >= 0.7) {
    const policy = { ...attractorRegistry.order.policyDefaults };
    const confidenceBaseline = scores.find((s) => s.id === 'order')?.score ?? needs.clarityNeed;
    const confidence = clamp01(
      input.collapse.confidence < 0.5 ? Math.min(confidenceBaseline, 0.65) : confidenceBaseline
    );
    return applyPolicyModifiers({ id: 'order', confidence, policy }, input);
  }

  // 2) Otherwise select max score with tie-break order.
  const selectedScore = pickByTieBreak(scores);

  // 4) Set AttractorResult.confidence
  let confidence = clamp01(selectedScore.score);
  if (input.collapse.confidence < 0.5) confidence = Math.min(confidence, 0.65);

  // 5) Policy resolution
  const policy = { ...attractorRegistry[selectedScore.id].policyDefaults };

  return applyPolicyModifiers({ id: selectedScore.id, confidence, policy }, input);
}

const applyPolicyModifiers = (
  result: AttractorResult,
  input: IntegrationInput
): AttractorResult => {
  const userIntent = input.context.userIntent ?? 'unknown';
  const timePressure = input.context.timePressure ?? 'low';

  let policy: AttractorPolicy = { ...result.policy };

  // If user is overloaded, force minimal + checklist unless protection already.
  if (userIntent === 'overloaded' && result.id !== 'protection') {
    policy = { ...policy, structure: 'checklist', verbosity: 'minimal' };
  }

  // Time pressure reduces verbosity one level.
  if (timePressure === 'high') {
    policy = { ...policy, verbosity: downgradeVerbosity(policy.verbosity) };
  }

  // Exploratory can keep insight expanded (unless time pressure forces downgrade).
  if (userIntent === 'exploratory' && result.id === 'insight' && timePressure !== 'high') {
    policy = { ...policy, verbosity: 'expanded' };
  }

  return { ...result, policy };
};

export function collapseToAttractor(
  collapse: CollapseResult,
  context: IntegrationContext = {}
): AttractorResult {
  const input: IntegrationInput = { collapse, context };
  const scores = scoreAttractors(input);
  return selectAttractor(scores, input);
}

// Optional CB-03 integration: apply gradients to policy only.
// Gradients never decide; they only modulate thresholds/policies.
export function collapseToAttractorWithGradients(
  collapse: CollapseResult,
  context: IntegrationContext = {},
  gradients: GradientVector
): AttractorResult {
  const base = collapseToAttractor(collapse, context);
  const isProtection = base.id === 'protection';
  return {
    ...base,
    policy: applyToAttractorPolicy(base.policy, gradients, context, isProtection),
  };
}
