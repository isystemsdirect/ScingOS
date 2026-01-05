import type { BusAuth, BusSession, EngineInput, EngineOutput } from './busTypes';
import { listEngines, getEngine } from './busRegistry';
import { buildDefaultSchedule, ScheduledJob } from './busScheduler';
import { makeContext } from './busContext';
import { dispatchToEngine, emitAll } from './busDispatch';
import type { PolicySnapshot } from '../bane';
import type { StoreBridge } from './busStoreBridge';
import { routeOutput } from './busStoreBridge';
import type { DeviceRouter } from '../devices/deviceRouter';

export type BusRuntimeConfig = {
  auth: BusAuth;
  session: BusSession;
  mode: 'online' | 'offline';
  snapshot?: PolicySnapshot;
  bridge: StoreBridge;
  deviceRouter?: DeviceRouter;
};

export class LariBusRuntime {
  private cfg: BusRuntimeConfig;
  private schedule: ScheduledJob[] = [];
  private running = false;

  constructor(cfg: BusRuntimeConfig) {
    this.cfg = cfg;
    const engines = listEngines();
    this.schedule = buildDefaultSchedule(engines);
  }

  async start() {
    this.running = true;
    const ctx = makeContext({
      auth: this.cfg.auth,
      session: this.cfg.session,
      mode: this.cfg.mode,
      snapshot: this.cfg.snapshot,
      deviceId: this.cfg.auth.deviceId,
      deviceRouter: this.cfg.deviceRouter,
      onEmit: (out: EngineOutput) => routeOutput(this.cfg.bridge, out),
    });

    // init all engines
    for (const e of listEngines()) {
      if (e.init) await e.init(ctx);
    }

    // main loop (cooperative)
    const loop = async () => {
      if (!this.running) return;
      const now = Date.now();
      for (const job of this.schedule) {
        if (now - job.lastRunAt >= job.everyMs) {
          job.lastRunAt = now;
          const engine = getEngine(job.engineId as any);
          const input = job.makeInput();
          const outs = await dispatchToEngine(ctx, engine, input);
          emitAll(ctx, outs);
        }
      }
      setTimeout(loop, 50);
    };

    loop();
  }

  async stop() {
    this.running = false;
    const ctx = makeContext({
      auth: this.cfg.auth,
      session: this.cfg.session,
      mode: this.cfg.mode,
      snapshot: this.cfg.snapshot,
      deviceId: this.cfg.auth.deviceId,
      deviceRouter: this.cfg.deviceRouter,
      onEmit: () => {},
    });
    for (const e of listEngines()) {
      if (e.shutdown) await e.shutdown(ctx);
    }
  }

  async send(engineId: string, input: EngineInput) {
    const ctx = makeContext({
      auth: this.cfg.auth,
      session: this.cfg.session,
      mode: this.cfg.mode,
      snapshot: this.cfg.snapshot,
      deviceId: this.cfg.auth.deviceId,
      deviceRouter: this.cfg.deviceRouter,
      onEmit: (out: EngineOutput) => routeOutput(this.cfg.bridge, out),
    });
    const engine = getEngine(engineId as any);
    const outs = await dispatchToEngine(ctx, engine, input);
    emitAll(ctx, outs);
  }
}
