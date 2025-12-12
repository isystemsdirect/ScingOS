
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
