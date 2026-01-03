import { registerEngine } from '../../scing/lariBus/busRegistry';
import { LariBusRuntime } from '../../scing/lariBus/busRuntime';

test('bus starts and dispatches ticks', async () => {
  registerEngine({
    engineId: 'LARI-CORE' as any,
    displayName: 'Core',
    gates: [],
    handle: async () => [{ kind: 'log', level: 'info', message: 'tick', data: null }],
  });

  const bus = new LariBusRuntime({
    auth: { uid: 'u1', orgId: 'o1', deviceId: 'd1' } as any,
    session: {
      sessionId: 's1',
      inspectionId: 'i1',
      startedAt: new Date().toISOString(),
      mode: 'online',
      activeEngines: ['LARI-CORE' as any],
    } as any,
    mode: 'online',
    bridge: {
      onHUD: () => {},
      onArtifact: () => {},
      onFinding: () => {},
      onClassification: () => {},
      onMapLayer: () => {},
      onTelemetry: () => {},
      onLog: () => {},
    },
  });

  await bus.start();
  await new Promise((r) => setTimeout(r, 120));
  await bus.stop();
});
