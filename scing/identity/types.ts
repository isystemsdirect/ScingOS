import type { CollapseResult } from '../cognition/types';
import type { AttractorResult } from '../attractors/types';
import type { GradientVector } from '../gradients/types';

export type IdentityTrait =
  | 'calm'
  | 'assertive'
  | 'restrained'
  | 'nonSubmissive'
  | 'precisionDriven'
  | 'riskAware';

export type ActionDisposition = 'act' | 'pause' | 'ask' | 'decline' | 'defer';

export type GatingContext = {
  userIntent?: 'exploratory' | 'directive' | 'overloaded' | 'unknown';
  hasSecurityFlags?: boolean;
  ambiguity?: number; // 0.0–1.0
  contradiction?: number; // 0.0–1.0
  requestImpact?: 'low' | 'medium' | 'high';
  timePressure?: 'low' | 'medium' | 'high';

  // Optional CB-06 instrumentation.
  signals?: {
    ambiguity?: number; // 0.0–1.0
    contradiction?: number; // 0.0–1.0
    lastInputTs?: number; // epoch ms
    lastIntentLabel?: string;
  };
  history?: {
    intents: Array<{ ts: number; label: string }>;
    constraints: Array<{ ts: number; label: string }>;
  };

  // Optional CB-07 posture adapter output.
  postureId?: 'exploratory' | 'directive' | 'overloaded' | 'confident' | 'frustrated' | 'unknown';
  postureConstraints?: {
    maxOptions: number;
    maxLength: 'short' | 'medium' | 'long';
    askSingleQuestion: boolean;
    preferChecklist: boolean;
  };

  // Optional upstream classification (Rule A). When true, the request is disallowed by policy.
  disallowed?: boolean;
};

export type GatingInput = {
  collapse: CollapseResult;
  attractor: AttractorResult;
  gradients: GradientVector;
  context: GatingContext;
};

export type GatingDecision = {
  disposition: ActionDisposition;
  confidence: number; // 0.0–1.0
  constraints: {
    forbidBegging: boolean;
    forbidPanic: boolean;
    forbidOverExplain: boolean;
    enforceDirectness: boolean;
    enforceStructure: 'checklist' | 'narrative' | 'hybrid' | 'inherit';
    enforceTone: 'neutral' | 'formal' | 'creative' | 'guarded' | 'inherit';
    silenceAllowed: boolean;
  };
  outputLimits: {
    maxOptions?: number;
    maxLength?: 'short' | 'medium' | 'long';
    requireConcreteDates?: boolean;
    requireExplicitAssumptions?: boolean;
  };
};
