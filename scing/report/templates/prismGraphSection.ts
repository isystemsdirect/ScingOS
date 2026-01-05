import type { PrismGraph } from '../../lari/prism/prismGraph.types';

export function prismGraphSection(graph: PrismGraph): {
  graph: PrismGraph;
  note: string;
} {
  return {
    graph,
    note: 'Prism graph is a deterministic causal/evidence structure linking findings and classifications to specific artifacts.',
  };
}
