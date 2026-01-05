export type PsycheSignalSource = 'self_report' | 'behavior' | 'wearable' | 'voice';

export type PsycheSignal = {
  source: PsycheSignalSource;
  ts: string;
  name: string;
  value: number | string | boolean | Record<string, unknown>;
  confidence: number; // 0..1
  provenance: {
    component: string;
    detail?: string;
  };
};

export type WorkHabitVector = {
  focusBlocks: number; // blocks/day
  interruptionRate: number; // interruptions/hour
  taskSwitchingRate: number; // switches/hour
  planningBias: number; // 0..1
  executionBias: number; // 0..1
  preferredOutputBias: 'checklist' | 'narrative' | 'mixed';
  peakHours: number[]; // local hours 0..23
};

export type StressLoadVector = {
  hrvTrend?: 'down' | 'flat' | 'up';
  restingHrTrend?: 'down' | 'flat' | 'up';
  sleepDebt?: 'low' | 'moderate' | 'high' | 'unknown';
  voiceProsodyStress?: 'low' | 'moderate' | 'high' | 'unknown';
  interactionFriction?: 'low' | 'moderate' | 'high' | 'unknown';
};

export type CognitiveStyleVector = {
  directness: 1 | 2 | 3 | 4 | 5;
  verbosity: 1 | 2 | 3 | 4 | 5;
  structurePreference: 1 | 2 | 3 | 4 | 5;
  riskTolerance: 1 | 2 | 3 | 4 | 5;
  confirmationPreference: 1 | 2 | 3 | 4 | 5;
};

export type UserImprintConsentFlags = {
  enabled: boolean;
  localOnlyMode: boolean;
  allowWearables: boolean;
  metrics: Partial<Record<'heart_rate' | 'hrv' | 'sleep' | 'activity' | 'workouts' | 'respiration' | 'skin_temp', boolean>>;
};

export type UserImprintConstraints = {
  hardBans: string[];
  maxAdaptationStepPerSession: number;
};

export type UserImprintProfile = {
  version: string;
  userId: string;
  updatedAt: string;
  workHabits?: WorkHabitVector;
  stressLoad?: StressLoadVector;
  cognitiveStyle?: CognitiveStyleVector;
  constraints: UserImprintConstraints;
  consentFlags: UserImprintConsentFlags;
};
