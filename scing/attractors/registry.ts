import type { AttractorId, AttractorPolicy, AttractorResult } from './types';

export type AttractorRegistryEntry = {
  id: AttractorId;
  description: string;
  policyDefaults: AttractorResult['policy'];
  scoringWeights: {
    clarityNeed: number;
    noveltyNeed: number;
    riskNeed: number;
    communicationNeed: number;
  };
};

const ORDER_POLICY: AttractorPolicy = {
  verbosity: 'standard',
  tone: 'formal',
  structure: 'checklist',
  riskPosture: 'cautious',
};

const INSIGHT_POLICY: AttractorPolicy = {
  verbosity: 'expanded',
  tone: 'creative',
  structure: 'hybrid',
  riskPosture: 'open',
};

const PROTECTION_POLICY: AttractorPolicy = {
  verbosity: 'minimal',
  tone: 'guarded',
  structure: 'checklist',
  riskPosture: 'restricted',
};

const EXPRESSION_POLICY: AttractorPolicy = {
  verbosity: 'standard',
  tone: 'neutral',
  structure: 'narrative',
  riskPosture: 'open',
};

export const attractorRegistry: Record<AttractorId, AttractorRegistryEntry> = {
  order: {
    id: 'order',
    description: 'Structured execution and clarity-first response shaping.',
    policyDefaults: ORDER_POLICY,
    scoringWeights: {
      clarityNeed: 0.9,
      noveltyNeed: 0.15,
      riskNeed: 0.25,
      communicationNeed: 0.35,
    },
  },
  insight: {
    id: 'insight',
    description: 'Synthesis, exploration, and creative recombination of concepts.',
    policyDefaults: INSIGHT_POLICY,
    scoringWeights: {
      clarityNeed: 0.25,
      noveltyNeed: 0.9,
      riskNeed: 0.1,
      communicationNeed: 0.45,
    },
  },
  protection: {
    id: 'protection',
    description: 'Risk-averse posture prioritizing safety, security, and constraints.',
    policyDefaults: PROTECTION_POLICY,
    scoringWeights: {
      clarityNeed: 0.2,
      noveltyNeed: 0.05,
      riskNeed: 1.0,
      communicationNeed: 0.15,
    },
  },
  expression: {
    id: 'expression',
    description: 'Communication, translation, and rapport for stakeholder alignment.',
    policyDefaults: EXPRESSION_POLICY,
    scoringWeights: {
      clarityNeed: 0.25,
      noveltyNeed: 0.3,
      riskNeed: 0.05,
      communicationNeed: 0.9,
    },
  },
};

export const ATTRACTOR_TIE_BREAK: AttractorId[] = ['protection', 'order', 'insight', 'expression'];
