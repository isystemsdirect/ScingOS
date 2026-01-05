import * as fs from "fs/promises";
import * as path from "path";

import type { BFIEngine } from "./registry/engine.types";

export type EngineRegistryEntry = BFIEngine & {
  // Compatibility fields expected by older callers
  displayName?: string;
};

export type EngineRegistryFile = {
  version: 2;
  updatedAt: string;
  engines: EngineRegistryEntry[];
};

function normalizeEngine(e: any): EngineRegistryEntry {
  const now = new Date().toISOString();
  const name = e?.name || e?.displayName || e?.id || "unknown";

  return {
    id: String(e?.id || ""),
    name: String(name),
    purpose: String(e?.purpose || ""),
    cognitiveRole: String(e?.cognitiveRole || ""),

    dependencies: Array.isArray(e?.dependencies) ? e.dependencies.map(String) : [],
    failureModes: Array.isArray(e?.failureModes) ? e.failureModes.map(String) : [],

    visualChannel: String(e?.visualChannel || ""),
    policySurface: Array.isArray(e?.policySurface) ? e.policySurface.map(String) : [],

    confidenceScore: typeof e?.confidenceScore === "number" ? e.confidenceScore : 0.5,
    lastReviewedAt: String(e?.lastReviewedAt || now),

    version: e?.version ? String(e.version) : undefined,
    family: e?.family ? String(e.family) : undefined,

    displayName: e?.displayName ? String(e.displayName) : undefined,
  };
}

async function readRegistry(filePath: string): Promise<EngineRegistryFile> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || (parsed.version !== 1 && parsed.version !== 2) || !Array.isArray(parsed.engines)) throw new Error("bad");
    return {
      version: 2,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      engines: (parsed.engines as any[]).map(normalizeEngine),
    };
  } catch {
    return { version: 2, updatedAt: new Date().toISOString(), engines: [] };
  }
}

export async function readEngineRegistry(repoRoot: string): Promise<EngineRegistryFile> {
  const filePath = path.join(repoRoot, "scingular.engine-registry.json");
  return readRegistry(filePath);
}

export async function upsertEngineRegistry(repoRoot: string, entry: EngineRegistryEntry) {
  const filePath = path.join(repoRoot, "scingular.engine-registry.json");
  const registry = await readRegistry(filePath);

  const idx = registry.engines.findIndex((e) => e.id === entry.id);
  if (idx >= 0) registry.engines[idx] = entry;
  else registry.engines.push(entry);

  registry.updatedAt = new Date().toISOString();

  await fs.writeFile(filePath, JSON.stringify(registry, null, 2) + "\n", "utf8");
  return { filePath, registry };
}
