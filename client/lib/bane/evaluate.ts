import type { BaneKey, EntitlementDecision, PolicySnapshot, Stage } from '../../../scing/bane';
import { checkEntitlement } from '../../../scing/bane';

export function evaluateOnClient(p: {
  authUid: string;
  orgId: string;
  key: BaneKey;
  requiredStage?: Stage;
  requiresExternalHardware?: boolean;
  requiresPhysicalControl?: boolean;
  deviceId?: string;
  online: boolean;
  snapshot?: PolicySnapshot;
}): EntitlementDecision {
  return checkEntitlement({
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
