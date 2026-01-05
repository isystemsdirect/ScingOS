import type { AttractorPolicy, AttractorResult } from '../attractors/types';

export type GradientId = 'stress' | 'curiosity' | 'urgency' | 'confidence';

export type GradientSignal = {
  id: GradientId;
  value: number; // 0.0–1.0
  source: 'inferred' | 'user' | 'system' | 'sensor';
};

export type GradientVector = {
  stress: number;
  curiosity: number;
  urgency: number;
  confidence: number;
};

export type GradientContext = {
  userIntent?: 'exploratory' | 'directive' | 'overloaded' | 'unknown';
  timePressure?: 'low' | 'medium' | 'high';
  hasSecurityFlags?: boolean;
  recentErrors?: number;
  systemLoad?: 'low' | 'medium' | 'high';
  sensor?: {
    bioStress?: number;
    voiceTension?: number;
    voiceEnergy?: number;
  };
};

export type CollapseModulation = {
  varianceThresholdDelta: number; // (-MAX_THRESHOLD_DELTA..+MAX_THRESHOLD_DELTA)
  confidenceLockDelta: number; // (-MAX_THRESHOLD_DELTA..+MAX_THRESHOLD_DELTA)
  maxEvaluationCyclesDelta: number; // (-1..+1)
};

export type GradientMode = 'stable' | 'exploratory' | 'urgent' | 'guarded';

export type AttractorPolicyLike = AttractorPolicy;
export type AttractorResultLike = Pick<AttractorResult, 'id' | 'confidence' | 'policy'>;
