import type { AttractorResult } from '../attractors/types';
import type { GradientVector } from '../gradients/types';
import type { GatingDecision } from '../identity/types';
import type { ResponsePlan, ResponseSectionId, VerbosityLevel } from './types';
import type { PostureResult } from '../posture/types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const verbosityLevels: VerbosityLevel[] = ['minimal', 'standard', 'expanded'];

const shiftVerbosity = (v: VerbosityLevel, delta: number): VerbosityLevel => {
  const i = verbosityLevels.indexOf(v);
  const ni = Math.max(0, Math.min(verbosityLevels.length - 1, i + delta));
  return verbosityLevels[ni];
};

const maxBulletsForVerbosity = (v: VerbosityLevel): number => {
  if (v === 'minimal') return 3;
  if (v === 'expanded') return 10;
  return 6;
};

const forbidPhrasesDefault = (): string[] => [
  // Mirrors CB-04 style forbids (as patterns); internal use only.
  '\\bsorry\\b',
  '\\bI\\s+can\\s*not\\b',
  "\\bI\\s+can't\\b",
  '\\b(?:sit\\s+tight|wait|give\\s+me\\s+time|give\\s+me\\s+a\\s+moment|give\\s+me\\s+a\\s+minute)\\b',
  "\\b(?:I'm\\s+excited|I'm\\s+thrilled)\\b",
];

const baselineSectionsForAttractor = (id: AttractorResult['id']): ResponseSectionId[] => {
  switch (id) {
    case 'order':
      return ['goal', 'steps', 'constraints', 'next'];
    case 'insight':
      return ['goal', 'assumptions', 'steps', 'next'];
    case 'protection':
      return ['safety', 'constraints', 'next'];
    case 'expression':
    default:
      return ['goal', 'steps', 'next'];
  }
};

const overrideForDisposition = (
  disposition: GatingDecision['disposition']
): { structure: ResponsePlan['structure']; tone?: ResponsePlan['tone']; verbosity: VerbosityLevel; sections: ResponseSectionId[] } | null => {
  switch (disposition) {
    case 'pause':
      return {
        structure: 'checklist',
        tone: 'formal',
        verbosity: 'minimal',
        sections: ['goal', 'question', 'next'],
      };
    case 'ask':
      return {
        structure: 'checklist',
        verbosity: 'minimal',
        sections: ['question', 'next'],
      };
    case 'decline':
      return {
        structure: 'checklist',
        tone: 'guarded',
        verbosity: 'minimal',
        sections: ['safety', 'next'],
      };
    case 'defer':
      return {
        structure: 'checklist',
        tone: 'formal',
        verbosity: 'standard',
        sections: ['constraints', 'steps', 'next'],
      };
    default:
      return null;
  }
};

export function buildResponsePlan(
  attractor: AttractorResult,
  gradients: GradientVector,
  decision: GatingDecision,
  opts: { codeFenceAllowed?: boolean; posture?: PostureResult } = {}
): ResponsePlan {
  const posture = opts.posture;

  const base: ResponsePlan = {
    disposition: decision.disposition,
    structure: attractor.policy.structure,
    tone: attractor.policy.tone,
    verbosity: attractor.policy.verbosity,
    limits: {
      maxOptions: typeof decision.outputLimits.maxOptions === 'number' ? decision.outputLimits.maxOptions : 5,
      maxLength: decision.outputLimits.maxLength ?? 'medium',
    },
    sections: baselineSectionsForAttractor(attractor.id).map((id) => ({ id, enabled: true })),
    formatting: {
      headingStyle: attractor.policy.verbosity === 'minimal' ? 'minimal' : 'strong',
      bulletStyle: 'dash',
      codeFenceAllowed: !!opts.codeFenceAllowed,
    },
    lexicalRules: {
      forbidPhrases: forbidPhrasesDefault(),
      requireImperatives: !!decision.constraints.enforceDirectness,
      forbidTimeEstimates: true,
      forbidOverHedging: true,
    },
  };

  // 3) Disposition overrides
  const dispOverride = overrideForDisposition(decision.disposition);
  if (dispOverride) {
    base.structure = dispOverride.structure;
    if (dispOverride.tone) base.tone = dispOverride.tone;
    base.verbosity = dispOverride.verbosity;
    base.sections = dispOverride.sections.map((id) => ({ id, enabled: true }));
  }

  // Canon: ASK disposition is single-question targeting.
  if (base.disposition === 'ask') {
    base.limits.maxOptions = 1;
  }

  // CB-07: posture constraints
  if (posture) {
    base.limits.maxOptions = Math.min(base.limits.maxOptions, posture.constraints.maxOptions);

    const lenRank: Record<ResponsePlan['limits']['maxLength'], number> = { short: 0, medium: 1, long: 2 };
    const currentLen = base.limits.maxLength;
    const postureLen = posture.constraints.maxLength;
    base.limits.maxLength = lenRank[postureLen] < lenRank[currentLen] ? postureLen : currentLen;

    if (posture.constraints.preferChecklist) {
      base.structure = 'checklist';
    }

    if (posture.constraints.askSingleQuestion && (base.disposition === 'ask' || base.disposition === 'pause')) {
      base.limits.maxOptions = 1;
      // Ensure a question section exists and is enabled.
      const hasQuestion = base.sections.some((s) => s.id === 'question');
      if (!hasQuestion) base.sections.unshift({ id: 'question', enabled: true });
      base.sections = base.sections.map((s) => (s.id === 'question' ? { ...s, enabled: true } : s));
    }
  }

  // 3) Verbosity limiter from gradients
  const urgency = clamp01(gradients.urgency);
  const stress = clamp01(gradients.stress);
  const curiosity = clamp01(gradients.curiosity);

  let vShift = 0;
  if (urgency >= 0.7 || stress >= 0.7) vShift -= 1;
  if (curiosity >= 0.7 && attractor.id !== 'protection' && decision.disposition === 'act') vShift += 1;
  if (vShift !== 0) base.verbosity = shiftVerbosity(base.verbosity, vShift > 0 ? 1 : -1);

  // Assumptions section when required
  const needAssumptions = !!decision.outputLimits.requireExplicitAssumptions;
  const hasAssumptions = base.sections.some((s) => s.id === 'assumptions');
  if (needAssumptions && !hasAssumptions) {
    base.sections.splice(1, 0, { id: 'assumptions', enabled: true });
  }
  if (!needAssumptions) {
    base.sections = base.sections.map((s) => (s.id === 'assumptions' ? { ...s, enabled: false } : s));
  }

  // Max bullets per section
  const maxBullets = maxBulletsForVerbosity(base.verbosity);
  base.sections = base.sections.map((s) => ({ ...s, maxBullets }));

  // Formatting rules
  base.formatting.headingStyle = base.verbosity === 'minimal' ? 'minimal' : 'strong';
  base.formatting.bulletStyle =
    base.structure === 'checklist' && (decision.disposition === 'act' || decision.disposition === 'defer') ? 'number' : 'dash';

  return base;
}
