import type { BusContext, BusAuth, BusSession, EngineGate, EngineOutput } from './busTypes';
import type { PolicySnapshot } from '../bane';
import { checkEntitlement } from '../bane/baneApi';

export function makeContext(params: {
  auth: BusAuth;
  session: BusSession;
  mode: 'online' | 'offline';
  snapshot?: PolicySnapshot;
  deviceId: string;
  onEmit: (out: EngineOutput) => void;
}): BusContext {
  const nowIso = () => new Date().toISOString();

  return {
    auth: params.auth,
    session: params.session,
    policySnapshot: params.snapshot,
    entitlements: (gate: EngineGate) =>
      checkEntitlement({
        authUid: params.auth.uid,
        orgId: params.auth.orgId,
        key: gate.key,
        requiredStage: gate.requiredStage,
        requiresExternalHardware: gate.requiresExternalHardware,
        requiresPhysicalControl: gate.requiresPhysicalControl,
        deviceId: params.deviceId,
        online: params.mode === 'online',
        snapshot: params.snapshot,
      }),
    emit: params.onEmit,
    nowIso,
  };
}
