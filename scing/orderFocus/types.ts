import type { CollapseResult } from '../cognition/types';
import type { AttractorResult } from '../attractors/types';
import type { GradientVector } from '../gradients/types';
import type { GatingDecision } from '../identity/types';
import type { PostureId } from '../posture/types';

export type OrderFocusReasonCode =
  | 'stable'
  | 'ambiguous'
  | 'conflicted'
  | 'oscillating'
  | 'risky'
  | 'stale_inputs';

export type OrderFocusDispositionBias = 'act' | 'pause' | 'ask' | 'defer';

export type OrderFocusState = {
  order: number; // 0.0–1.0
  focus: number; // 0.0–1.0
  coherence: number; // 0.0–1.0
  intentStability: number; // 0.0–1.0
  contradiction: number; // 0.0–1.0
  noise: number; // 0.0–1.0
  dispositionBias: OrderFocusDispositionBias;
  reasonCode: OrderFocusReasonCode;
};

export type OrderFocusInput = {
  collapse: CollapseResult;
  attractor: AttractorResult;
  gradients: GradientVector;
  decisionDraft?: GatingDecision;
  context: {
    userIntent?: 'exploratory' | 'directive' | 'overloaded' | 'unknown';
    hasSecurityFlags?: boolean;
    requestImpact?: 'low' | 'medium' | 'high';
    timePressure?: 'low' | 'medium' | 'high';
    postureId?: PostureId;
  };
  signals: {
    ambiguity?: number; // 0.0–1.0
    contradiction?: number; // 0.0–1.0
    lastInputTs?: number; // epoch ms
    lastIntentLabel?: string;
  };
  history: {
    intents: Array<{ ts: number; label: string }>;
    constraints: Array<{ ts: number; label: string }>;
  };
};

export type CoherenceBundle = {
  order: number;
  focus: number;
  coherence: number;
  noise: number;
};

export type StabilityBundle = {
  intentStability: number;
  oscillation: number;
};
