import { ENGINE_REGISTRY } from './engineRegistry';
import { EngineId } from './engineTypes';

export type EngineGraph = {
  nodes: EngineId[];
  edges: Array<{ from: EngineId; to: EngineId }>;
};

export function buildDependencyGraph(): EngineGraph {
  const nodes = (Object.keys(ENGINE_REGISTRY) as EngineId[]).slice().sort();
  const edges: EngineGraph['edges'] = [];
  for (const id of nodes) {
    for (const dep of ENGINE_REGISTRY[id].dependsOn) edges.push({ from: dep, to: id });
  }
  edges.sort((a, b) =>
    a.from === b.from ? a.to.localeCompare(b.to) : a.from.localeCompare(b.from)
  );
  return { nodes, edges };
}

// Topological order for deterministic startup / validation
export function topoSort(): EngineId[] {
  const { nodes, edges } = buildDependencyGraph();
  const indeg = new Map<EngineId, number>(nodes.map((n) => [n, 0]));
  const outgoing = new Map<EngineId, EngineId[]>();

  for (const e of edges) {
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
    const list = outgoing.get(e.from) ?? [];
    list.push(e.to);
    outgoing.set(e.from, list);
  }
  for (const [, list] of outgoing) list.sort((a, b) => a.localeCompare(b));

  const q: EngineId[] = nodes.filter((n) => (indeg.get(n) ?? 0) === 0);
  q.sort((a, b) => a.localeCompare(b));

  const out: EngineId[] = [];
  while (q.length) {
    const n = q.shift()!;
    out.push(n);
    const outs = outgoing.get(n) ?? [];
    for (const to of outs) {
      indeg.set(to, (indeg.get(to) ?? 0) - 1);
      if ((indeg.get(to) ?? 0) === 0) {
        q.push(to);
        q.sort((a, b) => a.localeCompare(b));
      }
    }
  }

  if (out.length !== nodes.length) throw new Error('Engine dependency cycle detected');
  return out;
}
