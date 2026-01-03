import { InfluenceField } from './influenceField';

/**
 * Motif Engine: "repetitive randomness"
 * Canon:
 * - Motif identities may repeat (habit)
 * - Exact execution may never repeat
 */
export type MotifId = 'sway' | 'pulse' | 'spiral' | 'breath' | 'flicker';

export type Motif = {
  id: MotifId;
  bias: number[];
  habitWeight: number;
};

export class MotifEngine {
  private motifs: Motif[];
  private lastMotif: MotifId | null = null;

  constructor(private influence: InfluenceField) {
    this.motifs = [
      { id: 'sway', bias: [0.2, 0.08, 0.03], habitWeight: 1.2 },
      { id: 'pulse', bias: [0.35, 0.05, 0.02], habitWeight: 1.0 },
      { id: 'spiral', bias: [0.1, 0.25, 0.05], habitWeight: 0.9 },
      { id: 'breath', bias: [0.18, 0.06, 0.01], habitWeight: 1.3 },
      { id: 'flicker', bias: [0.05, 0.02, 0.2], habitWeight: 0.8 },
    ];
  }

  apply() {
    const pick = this.pickMotif();
    this.influence.ingest(this.driftedFlux(pick));
    this.lastMotif = pick.id;
  }

  private pickMotif(): Motif {
    // Habit bias: mildly favor repeating the previous motif, never forced
    if (this.lastMotif && Math.random() < 0.35) {
      const last = this.motifs.find((m) => m.id === this.lastMotif);
      if (last) return last;
    }

    // Weighted random by habitWeight
    const total = this.motifs.reduce((a, m) => a + m.habitWeight, 0);
    let t = Math.random() * total;
    for (const m of this.motifs) {
      t -= m.habitWeight;
      if (t <= 0) return m;
    }
    return this.motifs[this.motifs.length - 1];
  }

  private driftedFlux(m: Motif): number[] {
    const base = m.bias;
    const out: number[] = [];
    for (let i = 0; i < 16; i++) {
      const b = base[i % base.length];
      const jitter = (Math.random() - 0.5) * 0.12;
      const wobble = Math.sin(Math.random() * 6.283 + i) * (Math.random() * 0.03);
      out.push(b + jitter + wobble);
    }
    return out;
  }
}
