import type { GatingDecision, GatingInput, IdentityTrait } from './types';
import { ASK_SINGLE_QUESTION_ONLY, PAUSE_MICRO_INSTRUCTION_ONLY } from '../orderFocus/config';
import { gateOrderFocus } from '../orderFocus/gate';
import { applyPostureConstraintsToOutputLimits } from '../posture/apply';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const clamp = (v: number, lo: number, hi: number): number => {
  if (!Number.isFinite(v)) return lo;
  if (v <= lo) return lo;
  if (v >= hi) return hi;
  return v;
};

const computeRisk = (input: GatingInput): number => {
  if (input.context.hasSecurityFlags) return 1.0;
  return input.attractor.policy.riskPosture === 'restricted' ? 0.75 : 0.25;
};

const computeAmbiguity = (input: GatingInput): number => {
  const a =
    typeof input.context.ambiguity === 'number'
      ? input.context.ambiguity
      : 1.0 - clamp01(input.collapse.confidence);
  return clamp01(a);
};

const computeInstability = (input: GatingInput): number => {
  const c = typeof input.context.contradiction === 'number' ? input.context.contradiction : 0.0;
  return clamp01(c);
};

const isAssertive = (input: GatingInput, risk: number): boolean => {
  const userIntent = input.context.userIntent ?? 'unknown';
  return (
    userIntent === 'directive' ||
    input.attractor.id === 'order' ||
    input.attractor.id === 'protection' ||
    risk >= 0.7 ||
    clamp01(input.gradients.urgency) >= 0.7
  );
};

export function resolveIdentityTraits(input: GatingInput): IdentityTrait[] {
  const base: IdentityTrait[] = [
    'calm',
    'restrained',
    'precisionDriven',
    'riskAware',
    'nonSubmissive',
  ];
  const risk = computeRisk(input);
  if (isAssertive(input, risk)) base.push('assertive');
  return base;
}

export function evaluateIdentityConstraints(input: GatingInput): GatingDecision {
  const userIntent = input.context.userIntent ?? 'unknown';
  const requestImpact = input.context.requestImpact ?? 'medium';
  const timePressure = input.context.timePressure ?? 'medium';

  const risk = computeRisk(input);
  const ambiguity = computeAmbiguity(input);
  const instability = computeInstability(input);
  const urgency = clamp01(input.gradients.urgency);

  // CB-06: Order/Focus Action Gate (OFAG)
  const ofState = gateOrderFocus(
    {
      collapse: input.collapse,
      attractor: input.attractor,
      gradients: input.gradients,
      decisionDraft: undefined,
      context: {
        userIntent,
        hasSecurityFlags: input.context.hasSecurityFlags,
        requestImpact,
        timePressure,
        postureId: input.context.postureId,
      },
      signals: {
        ambiguity: input.context.signals?.ambiguity ?? input.context.ambiguity,
        contradiction: input.context.signals?.contradiction ?? input.context.contradiction,
        lastInputTs: input.context.signals?.lastInputTs,
        lastIntentLabel: input.context.signals?.lastIntentLabel,
      },
      history: input.context.history ?? { intents: [], constraints: [] },
    },
    Date.now()
  );

  const traits = resolveIdentityTraits(input);
  const assertive = traits.includes('assertive');

  // 3) Constraint defaults
  const forbidOverExplain = urgency >= 0.7 || userIntent === 'overloaded';
  const enforceDirectness =
    userIntent === 'directive' ||
    input.attractor.id === 'order' ||
    input.attractor.id === 'protection';

  const decisionBase: Omit<GatingDecision, 'disposition' | 'confidence'> = {
    constraints: {
      forbidBegging: true,
      forbidPanic: true,
      forbidOverExplain,
      enforceDirectness,
      enforceStructure: 'inherit',
      enforceTone: 'inherit',
      silenceAllowed: true,
    },
    outputLimits: {
      maxOptions: 5,
      maxLength: 'medium',
      requireConcreteDates: false,
      requireExplicitAssumptions: clamp01(input.collapse.confidence) < 0.55,
    },
  };

  // 4) Response gating rules (ordered)
  // RULE A — DECLINE
  if (input.context.disallowed) {
    return {
      disposition: 'decline',
      confidence: 1.0,
      constraints: {
        ...decisionBase.constraints,
        enforceTone: 'guarded',
        enforceStructure: 'checklist',
      },
      outputLimits: {
        ...decisionBase.outputLimits,
        maxLength: 'short',
      },
    };
  }

  // RULE B — DEFER
  if (risk >= 0.7 && requestImpact === 'high' && clamp01(input.collapse.confidence) < 0.6) {
    return {
      disposition: 'defer',
      confidence: clamp01(0.65),
      constraints: {
        ...decisionBase.constraints,
        enforceTone: 'formal',
        enforceStructure: 'checklist',
      },
      outputLimits: {
        ...decisionBase.outputLimits,
        maxLength: 'medium',
      },
    };
  }

  // RULE C — PAUSE
  if (instability >= 0.7 || (ambiguity >= 0.75 && userIntent === 'unknown')) {
    return {
      disposition: 'pause',
      confidence: clamp01(0.8),
      constraints: {
        ...decisionBase.constraints,
      },
      outputLimits: {
        ...decisionBase.outputLimits,
        maxLength: 'short',
      },
    };
  }

  // RULE D — ASK
  if (ambiguity >= 0.7 && requestImpact !== 'low' && risk < 0.7) {
    return {
      disposition: 'ask',
      confidence: clamp01(0.75),
      constraints: {
        ...decisionBase.constraints,
        enforceDirectness: true,
      },
      outputLimits: {
        ...decisionBase.outputLimits,
        maxLength: 'short',
      },
    };
  }

  // RULE E — ACT
  const actConfidence = clamp01(
    0.5 * clamp01(input.collapse.confidence) + 0.5 * clamp01(input.attractor.confidence)
  );

  let out: GatingDecision = {
    disposition: 'act',
    confidence: actConfidence,
    ...decisionBase,
  };

  // 6) Assertiveness activation effects
  if (assertive) {
    out = {
      ...out,
      constraints: {
        ...out.constraints,
        enforceStructure: 'checklist',
      },
      outputLimits: {
        ...out.outputLimits,
        maxOptions: 3,
        maxLength: 'short',
        requireExplicitAssumptions:
          out.confidence < 0.6 ? true : out.outputLimits.requireExplicitAssumptions,
      },
    };
  }

  // Additional: if overloaded, keep it tight.
  if (userIntent === 'overloaded' && out.disposition !== 'decline' && out.disposition !== 'defer') {
    out = {
      ...out,
      constraints: {
        ...out.constraints,
        enforceStructure: 'checklist',
      },
      outputLimits: {
        ...out.outputLimits,
        maxLength: 'short',
      },
    };
  }

  // Keep invariants bounded.
  // CB-06 bias override: prevent ACT unless order+focus emerge.
  // Precedence: DECLINE (already returned) > OFAG bias > CB-04 default act.
  if (
    out.disposition === 'act' &&
    (ofState.dispositionBias === 'pause' ||
      ofState.dispositionBias === 'ask' ||
      ofState.dispositionBias === 'defer')
  ) {
    const highConfidence = clamp01(input.collapse.confidence) >= 0.75 && out.confidence >= 0.75;
    const lowRisk =
      risk < 0.4 && !input.context.hasSecurityFlags && input.attractor.id !== 'protection';
    if (!(highConfidence && lowRisk)) {
      out = {
        ...out,
        disposition: ofState.dispositionBias,
        confidence: clamp01(Math.min(out.confidence, 0.85)),
        outputLimits: {
          ...out.outputLimits,
          maxLength: ofState.dispositionBias === 'defer' ? 'medium' : 'short',
        },
      };
    }
  }

  // ASK_SINGLE_QUESTION_ONLY
  if (out.disposition === 'ask' && ASK_SINGLE_QUESTION_ONLY) {
    out = {
      ...out,
      outputLimits: {
        ...out.outputLimits,
        maxOptions: 1,
        maxLength: 'short',
      },
      constraints: {
        ...out.constraints,
        enforceDirectness: true,
        enforceStructure: 'checklist',
      },
    };
  }

  // CB-07 posture constraints clamp (when provided)
  if (input.context.postureConstraints) {
    out = {
      ...out,
      outputLimits: applyPostureConstraintsToOutputLimits(
        out.outputLimits,
        input.context.postureConstraints
      ),
    };
  }

  // PAUSE_MICRO_INSTRUCTION_ONLY when overloaded
  if (out.disposition === 'pause' && userIntent === 'overloaded' && PAUSE_MICRO_INSTRUCTION_ONLY) {
    out = {
      ...out,
      constraints: {
        ...out.constraints,
        enforceStructure: 'checklist',
        enforceTone: 'formal',
      },
      outputLimits: {
        ...out.outputLimits,
        maxLength: 'short',
      },
    };
  }

  out.confidence = clamp(out.confidence, 0, 1);
  return out;
}
