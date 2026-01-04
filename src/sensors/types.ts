export type SensorKind = 'mic' | 'camera' | 'wearable';

export type MicVad = 'speech_start' | 'speech_end' | 'speaking' | 'silence';

export type MicVadEvent = {
  kind: 'mic';
  ts: number;
  correlationId: string;
  vad: MicVad;
  rms: number;
  clipped: boolean;
};

export type MicSttEvent = {
  kind: 'mic';
  ts: number;
  correlationId: string;
  transcriptInterim?: string;
  transcriptFinal?: string;
  sttConfidence?: number;
};

export type CameraEvent = {
  kind: 'camera';
  ts: number;
  correlationId: string;
  facePresent: boolean;
  gazeApprox?: 'toward' | 'away' | 'unknown';
  motionEnergy: number;
  lightingLevel: number;
};

export type WearableEvent = {
  kind: 'wearable';
  ts: number;
  correlationId: string;
  metric: 'heart_rate' | 'hrv' | 'sleep' | 'steps' | 'activity';
  value: number;
  unit: string;
  source: 'android_health_connect' | 'wearos_health_services' | 'ios_healthkit';
};

export type SensorEvent = MicVadEvent | MicSttEvent | CameraEvent | WearableEvent;

export type FeatureVector = {
  ts: number;
  correlationId: string;
  userId: string;
  features: Record<string, number | string | boolean>;
  confidence: number; // 0..1
  sources: string[];
};

export type SituationSnapshot = {
  tsStart: number;
  tsEnd: number;
  correlationId: string;
  userId: string;
  fused: FeatureVector;
  derivedState: {
    energy: 'low' | 'normal' | 'high' | 'unknown';
    load: 'low' | 'normal' | 'high' | 'unknown';
    focus: 'low' | 'normal' | 'high' | 'unknown';
    confidence: number;
    reasons: string[];
  };
};
