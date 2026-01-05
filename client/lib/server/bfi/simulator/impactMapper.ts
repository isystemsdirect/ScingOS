import type { BFIIntent } from "@scingular/bfi-intent";
import type { SystemGraph } from "../graph/systemGraph";

export type ImpactClassification = "direct" | "indirect" | "unknown";

export type ImpactMapOutput = {
  affectedNodes: string[];
  affectedEngines: string[];
  affectedPolicies: string[];
  classification: Record<string, ImpactClassification>;
  unknownDependencies: string[];
};

function seedNodes(intent: BFIIntent, graph: SystemGraph): string[] {
  const seeds: string[] = [];

  if (intent.scope === "registry") {
    seeds.push("registry:engine");
  }

  if (intent.scope === "policy") {
    seeds.push("policy:bfi");
  }

  if (intent.scope === "ui") {
    for (const n of graph.nodes) {
      if (n.type !== "file") continue;
      const p = String(n.metadata?.path || "");
      if (p.startsWith("client/pages/") || p.startsWith("client/components/")) seeds.push(n.id);
    }
  }

  if (intent.scope === "engine") {
    // Prefer explicit engine IDs mentioned in text; otherwise seed all engines.
    const d = intent.description.toLowerCase();
    const mentioned = graph.nodes
      .filter((n) => n.type === "engine")
      .map((n) => n.id)
      .filter((id) => {
        const slug = id.replace(/^engine:/, "");
        return d.includes(slug);
      });

    if (mentioned.length) return Array.from(new Set(mentioned));

    for (const n of graph.nodes) {
      if (n.type === "engine") seeds.push(n.id);
    }
  }

  if (intent.scope === "infra") {
    for (const n of graph.nodes) {
      if (n.type !== "file") continue;
      const p = String(n.metadata?.path || "");
      if (p === "package.json" || p.startsWith("scripts/") || p.startsWith("cloud/")) seeds.push(n.id);
    }
  }

  // Fallback: always include likely BFI surface.
  if (!seeds.length) {
    for (const n of graph.nodes) {
      if (n.type === "file") {
        const p = String(n.metadata?.path || "");
        if (p.startsWith("client/lib/server/bfi/") || p.startsWith("client/pages/api/bfi/")) seeds.push(n.id);
      }
    }
  }

  return Array.from(new Set(seeds));
}

export function mapIntentToImpact(intent: BFIIntent, graph: SystemGraph): ImpactMapOutput {
  const classification: Record<string, ImpactClassification> = {};
  const unknownDependencies: string[] = [];

  const seed = seedNodes(intent, graph);
  for (const s of seed) classification[s] = "direct";

  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  // BFS depth 2 from seeds (architectural awareness v1)
  const q: Array<{ id: string; depth: number }> = seed.map((id) => ({ id, depth: 0 }));
  const seen = new Set(seed);

  while (q.length) {
    const cur = q.shift()!;
    if (cur.depth >= 2) continue;

    const next = adj.get(cur.id) || [];
    for (const n of next) {
      if (!seen.has(n)) {
        seen.add(n);
        classification[n] = "indirect";
        q.push({ id: n, depth: cur.depth + 1 });
      }
    }
  }

  // Unknown dependencies: edges pointing to nodes not in graph
  const nodeSet = new Set(graph.nodes.map((n) => n.id));
  for (const e of graph.edges) {
    if (!nodeSet.has(e.to)) {
      unknownDependencies.push(e.to);
      classification[e.to] = "unknown";
    }
  }

  const affectedNodes = Array.from(seen);
  const affectedEngines = affectedNodes.filter((id) => id.startsWith("engine:"));
  const affectedPolicies = affectedNodes.filter((id) => id.startsWith("policy:"));

  return {
    affectedNodes,
    affectedEngines: affectedEngines.map((x) => x.replace(/^engine:/, "")),
    affectedPolicies: affectedPolicies.map((x) => x.replace(/^policy:/, "")),
    classification,
    unknownDependencies: Array.from(new Set(unknownDependencies)),
  };
}
