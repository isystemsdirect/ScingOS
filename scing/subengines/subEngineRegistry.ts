import { SubEngineBase, SubEngineKind } from './subEngineBase';

export type SubEngineStatus = 'active' | 'dormant' | 'retired';

export type SubEngineRecord = {
  id: string;
  kind: SubEngineKind;
  status: SubEngineStatus;
  createdAt: number;
  lastActive: number;
  pressureScore: number;
};

export class SubEngineRegistry {
  private engines = new Map<string, SubEngineBase>();
  private meta = new Map<string, SubEngineRecord>();

  register(engine: SubEngineBase) {
    if (this.engines.has(engine.id)) return;

    this.engines.set(engine.id, engine);
    this.meta.set(engine.id, {
      id: engine.id,
      kind: engine.kind,
      status: 'active',
      createdAt: Date.now(),
      lastActive: Date.now(),
      pressureScore: 0,
    });
  }

  get(id: string) {
    return this.engines.get(id);
  }

  records() {
    return Array.from(this.meta.values());
  }

  touch(id: string, pressureDelta = 0) {
    const m = this.meta.get(id);
    if (!m) return;
    m.lastActive = Date.now();
    m.pressureScore = Math.max(0, m.pressureScore + pressureDelta);
  }

  retire(id: string) {
    const m = this.meta.get(id);
    if (!m) return;
    m.status = 'retired';
    this.engines.delete(id);
  }
}
