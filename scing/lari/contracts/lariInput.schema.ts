import type { QuantityKind, UnitId } from './units';

export type InputEvidenceRef = {
  kind: 'artifact' | 'measurement' | 'field_input' | 'external_standard';
  refId: string;
  note?: string;
};

export type ToleranceBlock = {
  // Absolute tolerance in the same unit as `unit`.
  abs?: number;
  // Relative tolerance in [0..1] (e.g. 0.05 means 5%).
  rel?: number;
};

export type UnitValue = {
  value: number;
  unit: UnitId;
  tolerance?: ToleranceBlock;
};

export type LariInputArtifact = {
  artifactId: string;
  type: string;
  contentHash?: string;
  capturedAt?: string;
  engineId?: string;
};

export type LariInputMeasurement = {
  measurementId: string;
  name: string;
  kind: QuantityKind;
  observedAt: string;
  value: UnitValue;
  evidence: InputEvidenceRef[];
};

export type LariFieldInput = {
  fieldId: string;
  label: string;
  valueText: string;
  observedAt: string;
  evidence: InputEvidenceRef[];
};

export type LariEngineInput = {
  engineId: string;
  inspectionId: string;
  receivedAt: string;

  artifacts: LariInputArtifact[];
  measurements: LariInputMeasurement[];
  fieldInputs: LariFieldInput[];

  sensorCaptures?: {
    providerId: string;
    captureId: string;
  }[];

  assumptions?: string[];
  constraints?: {
    preferredUnits?: UnitId[];
  };

  schemaVersion: '1.0.0';
};
