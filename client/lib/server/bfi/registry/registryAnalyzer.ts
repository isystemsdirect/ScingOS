import * as fs from "fs/promises";
import * as path from "path";
import { readEngineRegistry } from "../registry";

function jaccard(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = Array.from(A).filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4)
    .slice(0, 24);
}

async function listEngineFiles(repoRoot: string) {
  const enginesDir = path.join(repoRoot, "scing", "engines");
  const out: string[] = [];
  async function walk(dir: string) {
    let entries: any[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (ent.isFile() && /\.(ts|tsx|js|jsx)$/.test(ent.name)) {
        out.push(path.relative(repoRoot, abs).replace(/\\/g, "/"));
      }
    }
  }
  await walk(enginesDir);
  return out;
}

function guessEngineIdFromFile(rel: string) {
  const base = rel.split("/").pop()!.replace(/\.[^.]+$/, "");
  return base
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

export async function analyzeRegistry(repoRoot: string) {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const risks: string[] = [];

  const items: Array<{
    severity: "warning" | "risk";
    engineId?: string;
    what: string;
    why: string;
    confidence: number;
    suggestedAction: string;
  }> = [];

  const registry = await readEngineRegistry(repoRoot);
  const engineFiles = await listEngineFiles(repoRoot);

  const registeredIds = new Set(registry.engines.map((e) => e.id));
  const fileIds = new Set(engineFiles.map(guessEngineIdFromFile));

  // Unused (registered but no file)
  for (const id of registeredIds) {
    if (!fileIds.has(id)) {
      warnings.push(`Engine '${id}' is registered but no engine file was found under scing/engines.`);
      suggestions.push(`Create scing/engines/${id} (or update registry id to match file naming).`);

      items.push({
        severity: "warning",
        engineId: id,
        what: `Registered engine '${id}' has no implementation file`,
        why: "Registry-to-filesystem resolution could not find a matching engine module under scing/engines.",
        confidence: 0.85,
        suggestedAction: "Create the engine file or update the registry id to match file naming.",
      });
    }
  }

  // Orphaned (file exists but not registered)
  for (const id of fileIds) {
    if (!registeredIds.has(id)) {
      warnings.push(`Engine file for '${id}' exists but it is not registered.`);
      suggestions.push(`Add '${id}' to scingular.engine-registry.json so it is discoverable.`);

      items.push({
        severity: "warning",
        engineId: id,
        what: `Engine '${id}' exists but is not registered`,
        why: "The filesystem contains an engine module that does not appear in the registry.",
        confidence: 0.8,
        suggestedAction: "Register the engine (or delete/relocate it if it should not be discoverable).",
      });
    }
  }

  // Missing dependencies
  for (const e of registry.engines) {
    for (const dep of e.dependencies || []) {
      if (!registeredIds.has(dep) && !fileIds.has(dep)) {
        risks.push(`Engine '${e.id}' depends on '${dep}', but '${dep}' is not registered and no engine file is present.`);
        suggestions.push(`Register '${dep}' or remove/replace the dependency from '${e.id}'.`);

        items.push({
          severity: "risk",
          engineId: e.id,
          what: `Missing dependency '${dep}' for engine '${e.id}'`,
          why: "Dependency resolution could not find this engine in the registry or as an engine module.",
          confidence: 0.9,
          suggestedAction: `Register '${dep}' or update '${e.id}' dependencies to point to an existing engine.`,
        });
      }
    }
  }

  // Overlapping purposes
  for (let i = 0; i < registry.engines.length; i++) {
    for (let j = i + 1; j < registry.engines.length; j++) {
      const a = registry.engines[i];
      const b = registry.engines[j];
      const sim = jaccard(tokenize(a.purpose || ""), tokenize(b.purpose || ""));
      if (sim >= 0.6) {
        warnings.push(`Engines '${a.id}' and '${b.id}' appear to overlap in purpose (similarity ~${sim.toFixed(2)}).`);
        suggestions.push(`Consider consolidating '${a.id}' and '${b.id}' or differentiating their purpose fields.`);

        items.push({
          severity: "warning",
          what: `Possible redundancy between '${a.id}' and '${b.id}'`,
          why: "Purpose text similarity suggests overlapping cognitive function.",
          confidence: Math.max(0.6, Math.min(0.9, sim)),
          suggestedAction: "Consolidate engines or rewrite purpose fields to clarify boundaries.",
        });
      }
    }
  }

  const penalty = warnings.length * 0.05 + risks.length * 0.1;
  const healthScore = Math.max(0, Math.min(1, 1 - penalty));

  const flaggedEngines = Array.from(
    new Set(
      [...warnings, ...risks]
        .map((w) => (w.match(/'([^']+)'/) || [])[1])
        .filter(Boolean)
    )
  );

  return { healthScore, flaggedEngines, warnings, suggestions, risks, items };
}
