export type BioReading = {
  hr: number
  hrv: number
  stress: number
  motion?: number
}

/**
 * Learns user bio-signature over time (drifting baseline), no hard profiles.
 * Canon: bio changes modulate SRT continuously.
 */
export class BioSignature {
  private baseline = { hr: 0, hrv: 0, stress: 0, motion: 0 }
  private initialized = false

  learn(r: BioReading) {
    const motion = r.motion ?? 0
    if (!this.initialized) {
      this.baseline = { hr: r.hr, hrv: r.hrv, stress: r.stress, motion }
      this.initialized = true
      return
    }
    const a = 0.01
    this.baseline.hr = this.baseline.hr * (1 - a) + r.hr * a
    this.baseline.hrv = this.baseline.hrv * (1 - a) + r.hrv * a
    this.baseline.stress = this.baseline.stress * (1 - a) + r.stress * a
    this.baseline.motion = this.baseline.motion * (1 - a) + motion * a
  }

  flux(r: BioReading): number[] {
    const motion = r.motion ?? 0
    return [
      (r.hr - this.baseline.hr) * 0.01,
      (r.hrv - this.baseline.hrv) * 0.02,
      (r.stress - this.baseline.stress) * 0.03,
      (motion - this.baseline.motion) * 0.02,
    ]
  }
}
