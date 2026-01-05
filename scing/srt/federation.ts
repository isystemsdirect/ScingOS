import { InfluenceField } from './influenceField';

export type FederationNode = {
  id: string;
  weight: () => number;
  act: (field: number[]) => number[];
};

/**
 * Federation: autonomous yet interdependent algorithms.
 * No priority locks. No stable weights.
 */
export class Federation {
  private nodes: FederationNode[];

  constructor(private influence: InfluenceField) {
    this.nodes = [
      {
        id: 'coherence-modulator',
        weight: () => 0.9 + Math.random() * 0.2,
        act: (f) => f.map((v) => v * (0.99 + Math.random() * 0.02)),
      },
      {
        id: 'tension-injector',
        weight: () => 0.1 + Math.random() * 0.4,
        act: (f) => f.map((v, i) => v + Math.sin(v + i) * (Math.random() * 0.01)),
      },
    ];
  }

  negotiate() {
    const base = this.influence.sample();
    const composed = new Array(base.length).fill(0);

    for (const node of this.nodes) {
      const w = node.weight();
      const out = node.act(base);
      for (let i = 0; i < composed.length; i++) composed[i] += out[i] * w;
    }

    this.influence.ingest(composed);
  }
}
