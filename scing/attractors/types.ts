import type { CollapseResult } from '../cognition/types';

export type AttractorId = 'order' | 'insight' | 'protection' | 'expression';

export type AttractorScore = {
  id: AttractorId;
  score: number; // 0.0–1.0
  reasons: string[]; // internal only; never emitted to user
};

export type AttractorPolicy = {
  verbosity: 'minimal' | 'standard' | 'expanded';
  tone: 'neutral' | 'formal' | 'creative' | 'guarded';
  structure: 'checklist' | 'narrative' | 'hybrid';
  riskPosture: 'open' | 'cautious' | 'restricted';
};

export type AttractorResult = {
  id: AttractorId;
  confidence: number; // 0.0–1.0
  policy: AttractorPolicy;
};

export type IntegrationContext = {
  userIntent?: 'exploratory' | 'directive' | 'overloaded' | 'unknown';
  domain?: string;
  hasSecurityFlags?: boolean;
  timePressure?: 'low' | 'medium' | 'high';
};

export type IntegrationInput = {
  collapse: CollapseResult;
  context: IntegrationContext;
};
