import { BaneKey, Entitlement, EntitlementDecision, PolicySnapshot, Stage } from './baneTypes';

function isExpired(expiresAtIso: string, nowMs: number): boolean {
  return new Date(expiresAtIso).getTime() <= nowMs;
}

function stageRank(s: Stage): number {
  if (s === 'A') return 1;
  if (s === 'B') return 2;
  return 0; // NA
}

export type EvaluateInput = {
  authUid?: string;
  orgId?: string;
  key: BaneKey;
  requiredStage?: Stage; // if omitted, any active stage is acceptable
  requiresExternalHardware?: boolean; // used for offline safety downgrade
  requiresPhysicalControl?: boolean; // used for offline safety downgrade
  deviceId?: string; // if entitlement is device-bound
  online: boolean; // runtime connectivity state
  snapshot?: PolicySnapshot; // offline policy snapshot if online=false
  entitlement?: Entitlement; // optional direct entitlement (server-side)
  nowMs?: number; // for deterministic tests
};

export function evaluateEntitlement(input: EvaluateInput): EntitlementDecision {
  const nowMs = input.nowMs ?? Date.now();
  const {
    authUid,
    orgId,
    key,
    requiredStage,
    requiresExternalHardware,
    requiresPhysicalControl,
    deviceId,
    online,
    snapshot,
    entitlement,
  } = input;

  if (!authUid) return { allow: false, reason: 'NO_AUTH', key };
  if (!orgId) return { allow: false, reason: 'NO_ORG', key };

  // OFFLINE path: must rely on snapshot
  if (!online) {
    if (!snapshot) return { allow: false, reason: 'OFFLINE_POLICY_MISSING', key };

    if (!snapshot.constraints.offlineAllowed) {
      return {
        allow: false,
        reason: 'OFFLINE_POLICY_EXPIRED',
        key,
        policyVersion: snapshot.policyVersion,
      };
    }

    const issuedAtMs = new Date(snapshot.issuedAt).getTime();
    const maxValidUntilMs = issuedAtMs + snapshot.constraints.maxOfflineSeconds * 1000;
    const expiresAtMs = new Date(snapshot.expiresAt).getTime();
    const effectiveExpiryMs = Math.min(expiresAtMs, maxValidUntilMs);

    if (nowMs >= effectiveExpiryMs) {
      return {
        allow: false,
        reason: 'OFFLINE_POLICY_EXPIRED',
        key,
        policyVersion: snapshot.policyVersion,
      };
    }

    // Offline hard denies
    if (requiresExternalHardware && snapshot.constraints.offlineHardDenyExternalHardware) {
      return {
        allow: false,
        reason: 'OFFLINE_DENY_EXTERNAL',
        key,
        policyVersion: snapshot.policyVersion,
      };
    }
    if (requiresPhysicalControl && snapshot.constraints.offlineHardDenyPhysicalControl) {
      return {
        allow: false,
        reason: 'OFFLINE_DENY_CONTROL',
        key,
        policyVersion: snapshot.policyVersion,
      };
    }

    const ent = snapshot.entitlements[key];
    if (!ent)
      return { allow: false, reason: 'NO_ENTITLEMENT', key, policyVersion: snapshot.policyVersion };
    if (ent.status === 'revoked')
      return { allow: false, reason: 'REVOKED', key, policyVersion: snapshot.policyVersion };
    if (isExpired(ent.expiresAt, nowMs))
      return { allow: false, reason: 'EXPIRED', key, policyVersion: snapshot.policyVersion };

    if (requiredStage && stageRank(ent.stage) < stageRank(requiredStage)) {
      return {
        allow: false,
        reason: 'STAGE_INSUFFICIENT',
        key,
        requiredStage,
        effectiveStage: ent.stage,
        policyVersion: snapshot.policyVersion,
      };
    }

    if (ent.deviceBound) {
      if (!deviceId) {
        return {
          allow: false,
          reason: 'DEVICE_NOT_ALLOWED',
          key,
          requiredStage,
          effectiveStage: ent.stage,
          policyVersion: snapshot.policyVersion,
        };
      }
      const allowList = ent.allowedDeviceIds ?? [];
      if (allowList.length > 0 && !allowList.includes(deviceId)) {
        return {
          allow: false,
          reason: 'DEVICE_NOT_ALLOWED',
          key,
          requiredStage,
          effectiveStage: ent.stage,
          policyVersion: snapshot.policyVersion,
        };
      }
    }

    return {
      allow: true,
      reason: 'OK',
      key,
      requiredStage,
      effectiveStage: ent.stage,
      capsGranted: ent.caps,
      policyVersion: snapshot.policyVersion,
    };
  }

  // ONLINE path: prefer direct entitlement if provided (server), else try snapshot
  const entOnline = entitlement ?? snapshot?.entitlements[key];
  if (!entOnline) return { allow: false, reason: 'NO_ENTITLEMENT', key };

  // Snapshot entitlements omit orgId; server entitlements include it.
  const policyVersion = (entOnline as any).policyVersion as number | undefined;

  if ((entOnline as any).status === 'revoked')
    return { allow: false, reason: 'REVOKED', key, policyVersion };
  if (isExpired((entOnline as any).expiresAt, nowMs))
    return { allow: false, reason: 'EXPIRED', key, policyVersion };

  if (requiredStage && stageRank((entOnline as any).stage) < stageRank(requiredStage)) {
    return {
      allow: false,
      reason: 'STAGE_INSUFFICIENT',
      key,
      requiredStage,
      effectiveStage: (entOnline as any).stage,
      policyVersion,
    };
  }

  if ((entOnline as any).deviceBound) {
    if (!deviceId) {
      return {
        allow: false,
        reason: 'DEVICE_NOT_ALLOWED',
        key,
        requiredStage,
        effectiveStage: (entOnline as any).stage,
        policyVersion,
      };
    }
    const allowList = ((entOnline as any).allowedDeviceIds ?? []) as string[];
    if (allowList.length > 0 && !allowList.includes(deviceId)) {
      return {
        allow: false,
        reason: 'DEVICE_NOT_ALLOWED',
        key,
        requiredStage,
        effectiveStage: (entOnline as any).stage,
        policyVersion,
      };
    }
  }

  return {
    allow: true,
    reason: 'OK',
    key,
    requiredStage,
    effectiveStage: (entOnline as any).stage,
    capsGranted: ((entOnline as any).caps ?? []) as string[],
    policyVersion,
  };
}
