import { LariBusRuntime } from '../../../scing/lariBus/busRuntime';
import type { StoreBridge } from '../../../scing/lariBus/busStoreBridge';

export function startBus(params: {
  auth: { uid: string; orgId: string; role?: string; deviceId: string };
  inspectionId: string;
  mode: 'online' | 'offline';
  snapshot?: any;
  bridge: StoreBridge;
}) {
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
  const bus = new LariBusRuntime({
    auth: params.auth as any,
    session: {
      sessionId,
      inspectionId: params.inspectionId,
      startedAt: new Date().toISOString(),
      mode: params.mode,
      activeEngines: ['LARI-CORE', 'LARI-VISION', 'LARI-MAPPER', 'LARI-PRISM', 'LARI-ECHO', 'LARI-DOSE'],
    } as any,
    mode: params.mode,
    snapshot: params.snapshot,
    bridge: params.bridge,
  });
  bus.start();
  return bus;
}
