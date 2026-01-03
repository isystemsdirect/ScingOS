import type { PolicySnapshot } from '../../scing/bane';

export function makeSnapshot(opts?: Partial<PolicySnapshot>): PolicySnapshot {
  const base: PolicySnapshot = {
    uid: 'u1',
    orgId: 'o1',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    policyVersion: 1,
    roles: { u1: 'inspector' },
    entitlements: {
      vision: {
        uid: 'u1',
        key: 'vision',
        stage: 'A',
        status: 'active',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        seatBound: false,
        deviceBound: false,
        caps: ['capture_builtin'],
        policyVersion: 1,
        updatedAt: new Date().toISOString(),
      },
    },
    constraints: {
      offlineAllowed: true,
      offlineHardDenyExternalHardware: true,
      offlineHardDenyPhysicalControl: true,
      maxOfflineSeconds: 3600,
    },
    hash: 'x',
    signature: { alg: 'HS256', kid: 'k1', sig: 's1' },
  };
  return { ...base, ...(opts ?? {}) };
}
