export type EngineStatus = 'offline' | 'idle' | 'active' | 'warning' | 'error';
export type Severity = 'info' | 'minor' | 'major' | 'critical';

export type EngineHUDState = {
  engineId: string;
  status: EngineStatus;
  readiness: number; // 0..1
  warnings: string[];
  lastUpdate: string;
};

export type HUDOverlayItem =
  | { kind: 'text'; text: string; severity?: Severity }
  | { kind: 'badge'; label: string; color?: string }
  | { kind: 'measurement'; label: string; value: number; unit: string }
  | { kind: 'warning'; code: string; message: string; severity: Severity };

export type EngineHUDPayload = {
  engineId: string;
  overlays: HUDOverlayItem[];
  metrics?: Record<string, number>;
};

export type GuidedStep = {
  stepId: string;
  title: string;
  instruction: string;
  requiredArtifacts?: string[];
  blocking: boolean;
};

export type GuidedWorkflow = {
  workflowId: string;
  engineId?: string;
  steps: GuidedStep[];
};
