/**
 * InfluenceField: shared continuous signal substrate.
 * No resets. No replay caches. No deterministic stabilization.
 */
export class InfluenceField {
  private field: number[]

  constructor(dim: number = 16) {
    this.field = new Array(dim).fill(0)
  }

  ingest(flux: number[]) {
    const n = Math.min(this.field.length, flux.length)
    for (let i = 0; i < n; i++) {
      const eps = (Math.random() - 0.5) * 0.0001
      this.field[i] = this.field[i] + flux[i] + eps
    }
    for (let i = n; i < this.field.length; i++) {
      this.field[i] = this.field[i] * (0.999 + Math.random() * 0.002)
    }
  }

  sample(): number[] {
    return this.field.slice()
  }
}
