import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const write = (p, c) => {
  const a = path.join(root, p);
  fs.mkdirSync(path.dirname(a), { recursive: true });
  fs.writeFileSync(a, c, "utf8");
  console.log("Wrote", p);
};

/* ============================================================
   SUB-ENGINE GOVERNANCE CORE
============================================================ */

write("scing/subengines/subEngineRegistry.ts", `
import { SubEngineBase, SubEngineKind } from './subEngineBase'

export type SubEngineStatus = 'active' | 'dormant' | 'retired'

export type SubEngineRecord = {
  id: string
  kind: SubEngineKind
  status: SubEngineStatus
  createdAt: number
  lastActive: number
  pressureScore: number
}

export class SubEngineRegistry {
  private engines = new Map<string, SubEngineBase>()
  private meta = new Map<string, SubEngineRecord>()

  register(engine: SubEngineBase) {
    if (this.engines.has(engine.id)) return

    this.engines.set(engine.id, engine)
    this.meta.set(engine.id, {
      id: engine.id,
      kind: engine.kind,
      status: 'active',
      createdAt: Date.now(),
      lastActive: Date.now(),
      pressureScore: 0,
    })
  }

  get(id: string) {
    return this.engines.get(id)
  }

  records() {
    return Array.from(this.meta.values())
  }

  touch(id: string, pressureDelta = 0) {
    const m = this.meta.get(id)
    if (!m) return
    m.lastActive = Date.now()
    m.pressureScore = Math.max(0, m.pressureScore + pressureDelta)
  }

  retire(id: string) {
    const m = this.meta.get(id)
    if (!m) return
    m.status = 'retired'
    this.engines.delete(id)
  }
}
`);

/* ============================================================
   LIFECYCLE MANAGER
============================================================ */

write("scing/subengines/lifecycleManager.ts", `
import { SubEngineRegistry } from './subEngineRegistry'
import { SubEngineBase } from './subEngineBase'
import { AuditLog } from '../guards/auditLog'

/**
 * LifecycleManager:
 * - births engines (Growth or Catalyst)
 * - monitors pressure
 * - retires or promotes engines
 * Canon: no engine is immortal by default.
 */
export class LifecycleManager {
  private audit = new AuditLog()

  constructor(private registry: SubEngineRegistry) {}

  birth(engine: SubEngineBase) {
    this.registry.register(engine)
    this.audit.note('subengine_birth', { id: engine.id, kind: engine.kind })
  }

  step(signal: number[]) {
    for (const rec of this.registry.records()) {
      const engine = this.registry.get(rec.id)
      if (!engine) continue

      engine.ingest(signal)
      engine.step()

      // Pressure accumulation (abstract, non-stateful)
      const pressure = signal.reduce((a, b) => a + Math.abs(b), 0)
      this.registry.touch(rec.id, pressure * 0.001)

      if (engine.retireEligible()) {
        this.registry.retire(rec.id)
        this.audit.note('subengine_retire', { id: rec.id })
      }
    }
  }
}
`);

/* ============================================================
   GROWTH SUB-ENGINE TEMPLATE
============================================================ */

write("scing/subengines/growthEngines/growthTemplate.ts", `
import { SubEngineBase } from '../subEngineBase'

/**
 * Growth Sub-Engine:
 * - long-horizon
 * - pattern accumulation
 * - may be promoted into permanent capability
 */
export class GrowthTemplateEngine extends SubEngineBase {
  private saturation = 0

  constructor(id: string) {
    super(id, 'growth')
  }

  ingest(signal: number[]) {
    this.saturation += signal.reduce((a, b) => a + Math.abs(b), 0) * 0.0005
  }

  step() {
    // deliberate, slow evolution
    this.saturation *= 0.999
  }

  retireEligible(): boolean {
    // growth engines retire only if they fail to justify existence
    return this.saturation < 0.01
  }
}
`);

/* ============================================================
   CATALYST SUB-ENGINE TEMPLATE
============================================================ */

write("scing/subengines/catalystEngines/catalystTemplate.ts", `
import { SubEngineBase } from '../subEngineBase'

/**
 * Catalyst Sub-Engine:
 * - short-horizon
 * - pressure resolving
 * - often temporary
 */
export class CatalystTemplateEngine extends SubEngineBase {
  private pressure = 0

  constructor(id: string) {
    super(id, 'catalyst')
  }

  ingest(signal: number[]) {
    this.pressure += signal.reduce((a, b) => a + Math.abs(b), 0)
  }

  step() {
    // pressure decays after resolution
    this.pressure *= 0.92
  }

  retireEligible(): boolean {
    return this.pressure < 0.05
  }
}
`);

/* ============================================================
   GOVERNANCE WIRING EXAMPLE
============================================================ */

write("scing/subengines/subEngineGovernance.ts", `
import { SubEngineRegistry } from './subEngineRegistry'
import { LifecycleManager } from './lifecycleManager'
import { GrowthTemplateEngine } from './growthEngines/growthTemplate'
import { CatalystTemplateEngine } from './catalystEngines/catalystTemplate'

export const registry = new SubEngineRegistry()
export const lifecycle = new LifecycleManager(registry)

// Example births (real triggers come from Growth/Catalyst Protocols)
registry.register(new GrowthTemplateEngine('growth-core-patterns'))
registry.register(new CatalystTemplateEngine('catalyst-pressure-resolver'))
`);

/* ============================================================
   BARREL EXPORT
============================================================ */

write("scing/subengines/index.ts", `
export * from './subEngineBase'
export * from './subEngineRegistry'
export * from './lifecycleManager'
`);

/* ============================================================
   DONE
============================================================ */

console.log("\n✅ VSCI complete: Sub-Engine Lifecycle & Governance installed\n");
