import { InfluenceField } from './influenceField'
import { Federation } from './federation'
import { MotifEngine } from './motifEngine'
import { AntiRepeatGuard } from './antiRepeatGuard'

/**
 * SRTRuntime: embedded sensory expression substrate.
 * Canon:
 * - Does not own timing
 * - Invoked continuously by ScingRuntime
 */
export class SRTRuntime {
  influence = new InfluenceField(16)
  federation = new Federation(this.influence)
  motifs = new MotifEngine(this.influence)
  antiRepeat = new AntiRepeatGuard()

  exist(inputFlux: number[]) {
    this.influence.ingest(inputFlux)
    this.federation.negotiate()
    this.motifs.apply()
    this.antiRepeat.assert()
  }
}
