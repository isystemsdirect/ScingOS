import type { EngineId } from '../lariBus/busTypes';
import type { BaneKey, Stage } from '../bane/baneTypes';

export type DeviceKind = 'camera' | 'drone' | 'spectrometer' | 'sonar' | 'unknown';

export type CaptureKind =
  | 'photo'
  | 'video'
  | 'telemetry'
  | 'spectrum'
  | 'sonar_scan'
  | 'unknown';

export type CaptureStatus = 'ok' | 'queued' | 'rejected';

export type CaptureArtifact = {
  artifactId: string;
  kind: CaptureKind;
  mimeType?: string;
  sizeBytes?: number;
  contentHash?: string;
  // Local-only reference (file://, blob:, app-private path, etc.)
  localUri?: string;
  meta?: Record<string, any>;
};

export type CaptureRequest = {
  requestId: string;
  correlationId?: string;

  orgId: string;
  uid: string;
  deviceId: string;

  inspectionId: string;
  engineId: EngineId;

  deviceKind: DeviceKind;
  captureKind: CaptureKind;

  requestedAt: string; // ISO
  mode: 'online' | 'offline';

  // Optional explicit policy knobs. If omitted, router applies safe defaults.
  requiredStage?: Stage;
  requiresExternalHardware?: boolean;
  requiresPhysicalControl?: boolean;

  params?: Record<string, any>;
};

export type CaptureRecord = {
  captureId: string;
  requestId: string;
  correlationId?: string;
  orgId: string;
  uid: string;
  deviceId: string;
  inspectionId: string;
  engineId: EngineId;
  deviceKind: DeviceKind;
  captureKind: CaptureKind;
  capturedAt: string; // ISO
  status: CaptureStatus;
  artifacts?: CaptureArtifact[];
  error?: { code: string; message: string };
};

export type CaptureResult = {
  status: CaptureStatus;
  record: CaptureRecord;
};

export type DeviceCapability = {
  deviceKind: DeviceKind;
  captureKinds: CaptureKind[];
  // Optional capability hints
  label?: string;
  requiresExternalHardware?: boolean;
  requiresPhysicalControl?: boolean;
};

export type DevicePolicyDecision = {
  allow: boolean;
  reason: string;
  key?: BaneKey;
  requiredStage?: Stage;
};
