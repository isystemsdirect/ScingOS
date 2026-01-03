import type { EngineId } from '../engine';
import type { BaneKey, EntitlementDecision, PolicySnapshot, Stage } from './baneTypes';
import { evaluateEntitlement } from './baneEntitlements';

export type CheckEntitlementParams = {
  authUid: string;
  orgId: string;
  key: BaneKey;
  requiredStage?: Stage;
  requiresExternalHardware?: boolean;
  requiresPhysicalControl?: boolean;
  deviceId?: string;
  online: boolean;
  snapshot?: PolicySnapshot;
};

export function checkEntitlement(p: CheckEntitlementParams): EntitlementDecision {
  return evaluateEntitlement({
    authUid: p.authUid,
    orgId: p.orgId,
    key: p.key,
    requiredStage: p.requiredStage,
    requiresExternalHardware: p.requiresExternalHardware,
    requiresPhysicalControl: p.requiresPhysicalControl,
    deviceId: p.deviceId,
    online: p.online,
    snapshot: p.snapshot,
  });
}

export function keyForEngine(engineId: EngineId): BaneKey | null {
  switch (engineId) {
    case 'LARI-VISION':
      return 'vision';
    case 'LARI-MAPPER':
      return 'mapper';
    case 'LARI-DOSE':
      return 'dose';
    case 'LARI-PRISM':
      return 'prism';
    case 'LARI-ECHO':
      return 'echo';
    case 'LARI-GIS':
      return 'gis';
    case 'LARI-WEATHERBOT':
      return 'weatherbot';
    case 'LARI-CONTROL':
      return 'control';
    case 'LARI-THERM':
      return 'therm';
    case 'LARI-NOSE':
      return 'nose';
    case 'LARI-SONIC':
      return 'sonic';
    case 'LARI-GROUND':
      return 'ground';
    case 'LARI-AEGIS':
      return 'aegis';
    case 'LARI-EDDY':
      return 'eddy';
    default:
      return null;
  }
}

export type CheckEngineEntitlementParams = Omit<CheckEntitlementParams, 'key'> & {
  engineId: EngineId;
};

export function checkEngineEntitlement(p: CheckEngineEntitlementParams): EntitlementDecision {
  const key = keyForEngine(p.engineId);
  if (!key) return { allow: true, reason: 'OK', key: 'control' };
  return checkEntitlement({ ...p, key });
}
