export type PostureId =
  | 'exploratory'
  | 'directive'
  | 'overloaded'
  | 'confident'
  | 'frustrated'
  | 'unknown';

export type PostureScore = {
  id: PostureId;
  score: number; // 0.0–1.0
};

export type PostureResult = {
  id: PostureId;
  confidence: number; // 0.0–1.0
  signals: {
    brevityPreference: number; // 1.0 = wants short
    structurePreference: number; // 1.0 = wants checklist
    toleranceForOptions: number; // 1.0 = wants multiple options
    urgencyCue: number;
    frictionCue: number;
  };
  constraints: {
    maxOptions: number;
    maxLength: 'short' | 'medium' | 'long';
    askSingleQuestion: boolean;
    preferChecklist: boolean;
  };
};

export type PostureInput = {
  text: string;
  interaction: {
    messageLengthChars: number;
    messagesLast2Min?: number;
    repeatedPhrases?: number;
    capsRatio?: number;
  };
  context: {
    timePressure?: 'low' | 'medium' | 'high';
    hasSecurityFlags?: boolean;
  };
  history: {
    lastPostures: Array<{ ts: number; id: PostureId }>;
  };
  sensors?: {
    voiceTension?: number;
    voiceRate?: number;
    bioStress?: number;
  };
};

export type PostureFeatures = {
  text: string;
  messageLengthChars: number;
  isVeryShort: boolean;
  isVeryLong: boolean;
  rapidFire: boolean;
  highCaps: boolean;
  repetition: boolean;
  directiveHit: boolean;
  exploratoryHit: boolean;
  overloadHit: boolean;
  frustrationHit: boolean;
  confidenceHit: boolean;
  tension: number; // 0.0–1.0
  speed: number; // 0.0–1.0
  timePressure: 'low' | 'medium' | 'high';
  hasSecurityFlags: boolean;
};
