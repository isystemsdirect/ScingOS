export type ProsodyReading = {
  cadence: number
  pitchVar: number
  pauseRate: number
  intensity?: number
}

/**
 * Learns prosody signature (drifting baseline), no emotion labels.
 * Canon: listens to mood via prosody shifts and reacts through modulation.
 */
export class ProsodySignature {
  private baseline = { cadence: 0, pitchVar: 0, pauseRate: 0, intensity: 0 }
  private initialized = false

  learn(p: ProsodyReading) {
    const intensity = p.intensity ?? 0
    if (!this.initialized) {
      this.baseline = { cadence: p.cadence, pitchVar: p.pitchVar, pauseRate: p.pauseRate, intensity }
      this.initialized = true
      return
    }
    const a = 0.02
    this.baseline.cadence = this.baseline.cadence * (1 - a) + p.cadence * a
    this.baseline.pitchVar = this.baseline.pitchVar * (1 - a) + p.pitchVar * a
    this.baseline.pauseRate = this.baseline.pauseRate * (1 - a) + p.pauseRate * a
    this.baseline.intensity = this.baseline.intensity * (1 - a) + intensity * a
  }

  flux(p: ProsodyReading): number[] {
    const intensity = p.intensity ?? 0
    return [
      (p.cadence - this.baseline.cadence) * 0.10,
      (p.pitchVar - this.baseline.pitchVar) * 0.20,
      (p.pauseRate - this.baseline.pauseRate) * -0.15,
      (intensity - this.baseline.intensity) * 0.12,
    ]
  }
}
