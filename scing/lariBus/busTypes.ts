import type { BaneKey, Stage, EntitlementDecision, PolicySnapshot } from '../bane';
import type {
  ArtifactRecord,
  FindingRecord,
  ClassificationRecord,
  MapLayerRecord,
  TelemetryRecord,
} from '../evidence';
import type { EngineHUDPayload } from '../ui/scingTypes';
import type { DeviceRouter } from '../devices/deviceRouter';

export type EngineId =
  | 'LARI-CORE'
  | 'LARI-PRISM'
  | 'LARI-VISION'
  | 'LARI-MAPPER'
  | 'LARI-DOSE'
  | 'LARI-ECHO'
  | 'BANE'
  | 'SCING';

export type BusMode = 'online' | 'offline';

export type BusAuth = {
  uid: string;
  orgId: string;
  role?: string;
  deviceId: string;
};

export type BusSession = {
  sessionId: string;
  inspectionId: string;
  startedAt: string;
  mode: BusMode;
  activeEngines: EngineId[];
};

export type EngineInput =
  | { kind: 'telemetry'; payload: any }
  | { kind: 'artifact'; artifactId: string; localPath?: string; meta?: any }
  | { kind: 'command'; name: string; args?: any }
  | { kind: 'tick'; dtMs: number };

export type EngineOutput =
  | { kind: 'hud'; payload: EngineHUDPayload }
  | { kind: 'artifactRecord'; record: ArtifactRecord }
  | { kind: 'finding'; record: FindingRecord }
  | { kind: 'classification'; record: ClassificationRecord }
  | { kind: 'mapLayer'; record: MapLayerRecord }
  | { kind: 'telemetry'; record: TelemetryRecord }
  | {
      kind: 'log';
      level: 'debug' | 'info' | 'warn' | 'error';
      message: string;
      data?: any;
    };

export type EngineGate = {
  key: BaneKey;
  requiredStage?: Stage;
  requiresExternalHardware?: boolean;
  requiresPhysicalControl?: boolean;
};

export type EngineContract = {
  engineId: EngineId;
  displayName: string;
  gates: EngineGate[];
  init?: (ctx: BusContext) => Promise<void> | void;
  handle: (ctx: BusContext, input: EngineInput) => Promise<EngineOutput[]> | EngineOutput[];
  shutdown?: (ctx: BusContext) => Promise<void> | void;
};

export type BusContext = {
  auth: BusAuth;
  session: BusSession;
  policySnapshot?: PolicySnapshot;
  entitlements: (gate: EngineGate) => EntitlementDecision;
  emit: (out: EngineOutput) => void;
  nowIso: () => string;
  deviceRouter?: DeviceRouter;
};
