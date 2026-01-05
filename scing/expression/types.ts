import type { AttractorId, AttractorResult } from '../attractors/types';
import type { GradientVector } from '../gradients/types';
import type { ActionDisposition, GatingDecision } from '../identity/types';
import type { PostureResult } from '../posture/types';

export type VerbosityLevel = 'minimal' | 'standard' | 'expanded';
export type Tone = 'neutral' | 'formal' | 'creative' | 'guarded';
export type Structure = 'checklist' | 'narrative' | 'hybrid';

export type ResponseSectionId =
  | 'goal'
  | 'steps'
  | 'constraints'
  | 'assumptions'
  | 'next'
  | 'safety'
  | 'question';

export type ResponsePlan = {
  disposition: ActionDisposition;
  structure: Structure;
  tone: Tone;
  verbosity: VerbosityLevel;
  limits: {
    maxOptions: number;
    maxLength: 'short' | 'medium' | 'long';
  };
  sections: Array<{
    id: ResponseSectionId;
    enabled: boolean;
    maxBullets?: number;
  }>;
  formatting: {
    headingStyle: 'none' | 'minimal' | 'strong';
    bulletStyle: 'dash' | 'number';
    codeFenceAllowed: boolean;
  };
  lexicalRules: {
    forbidPhrases: string[];
    requireImperatives: boolean;
    forbidTimeEstimates: boolean;
    forbidOverHedging: boolean;
  };
};

export type VisualState =
  | 'idle'
  | 'thinking'
  | 'speaking'
  | 'guarding'
  | 'focused'
  | 'pausing'
  | 'asking'
  | 'declining'
  | 'executing';

export type ColorChannel = 'amber_think' | 'rainbow_speak' | 'redviolet_alert' | 'neutral_calm';

export type TelemetryFrame = {
  state: VisualState;
  channel: ColorChannel;
  intensity: number; // 0.0–1.0
  motion: {
    pulseRate: number;
    morphRate: number;
    tighten: number;
    expand: number;
    stillness: number;
  };
  tags: string[];
  ttlMs: number;
};

export type ExpressionBundle = {
  responsePlan: ResponsePlan;
  telemetry: TelemetryFrame;
};

export type ExpressionContext = {
  hasSecurityFlags?: boolean;
};

export type ExpressionComposerInput = {
  collapse: { confidence: number };
  attractor: AttractorResult;
  gradients: GradientVector;
  decision: GatingDecision;
  posture?: PostureResult;
  context?: ExpressionContext;
};

export type ExpressionEvent = {
  ts: number;
  responsePlan: ResponsePlan;
  telemetry: TelemetryFrame;
};

export const EXPRESSION_EVENT_NAME = 'scing.expression' as const;

export type AttractorIdLike = AttractorId;
