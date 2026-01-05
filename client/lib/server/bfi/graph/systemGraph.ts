import * as fs from "fs/promises";
import * as path from "path";
import { runGit } from "../git";
import { getBfiDir } from "../intentLedger";
import { readEngineRegistry } from "../registry";

export type GraphNodeType = "file" | "engine" | "registry" | "policy";
export type GraphEdgeType = "imports" | "references" | "registration" | "dependency";

export type SystemGraphNode = {
  id: string;
  type: GraphNodeType;
  metadata?: Record<string, any>;
};

export type SystemGraphEdge = {
  from: string;
  to: string;
  relation: GraphEdgeType;
};

export type SystemGraph = {
  nodes: SystemGraphNode[];
  edges: SystemGraphEdge[];
  meta: {
    generatedAt: string;
    repoCommit?: string;
    fileCount: number;
    roots: string[];
  };
};

const DEFAULT_ROOTS = ["client", "packages", "scing"]; // Phase 2: focused scan

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  ".git",
  "ScingOSEnvironment",
  "experiments",
  "docs",
  "legal",
]);

function isCodeFile(p: string) {
  return /\.(ts|tsx|js|jsx|mjs|cjs|json)$/.test(p);
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dirAbs: string, repoRoot: string, out: string[]) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name.startsWith(".")) {
      if (ent.name !== ".firebaserc") {
        // ignore dot-folders generally
      }
    }

    const abs = path.join(dirAbs, ent.name);
    const rel = path.relative(repoRoot, abs).replace(/\\/g, "/");

    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      await walk(abs, repoRoot, out);
      continue;
    }

    if (!ent.isFile()) continue;
    if (!isCodeFile(rel)) continue;
    out.push(rel);
  }
}

function addNode(nodes: Map<string, SystemGraphNode>, node: SystemGraphNode) {
  if (!nodes.has(node.id)) nodes.set(node.id, node);
}

function addEdge(edges: SystemGraphEdge[], edge: SystemGraphEdge) {
  if (edge.from === edge.to) return;
  edges.push(edge);
}

function resolveRelativeImport(fromFile: string, spec: string) {
  if (!spec.startsWith(".")) return null;
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    path.posix.join(base, "index.ts"),
    path.posix.join(base, "index.tsx"),
    path.posix.join(base, "index.js"),
  ];
  return candidates;
}

function extractImportSpecs(sourceText: string): string[] {
  const specs: string[] = [];

  // import ... from "x" / export ... from "x"
  const re1 = /\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  for (;;) {
    const m = re1.exec(sourceText);
    if (!m) break;
    specs.push(m[1]);
  }

  // require("x")
  const re2 = /\brequire\(\s*["']([^"']+)["']\s*\)/g;
  for (;;) {
    const m = re2.exec(sourceText);
    if (!m) break;
    specs.push(m[1]);
  }

  // import("x")
  const re3 = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (;;) {
    const m = re3.exec(sourceText);
    if (!m) break;
    specs.push(m[1]);
  }

  return Array.from(new Set(specs));
}

function pascalToKebab(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

export async function buildSystemGraph(repoRoot: string, opts?: { roots?: string[]; useCache?: boolean }): Promise<SystemGraph> {
  const roots = (opts?.roots?.length ? opts.roots : DEFAULT_ROOTS).slice();

  let repoCommit: string | undefined;
  try {
    const rev = await runGit(repoRoot, ["rev-parse", "HEAD"]);
    if (rev.exitCode === 0) repoCommit = rev.stdout.trim();
  } catch {
    // no git, continue without cache
  }

  const bfiDir = await getBfiDir(repoRoot);
  const cacheDir = path.join(bfiDir, "cache");
  await fs.mkdir(cacheDir, { recursive: true });
  const cachePath = repoCommit ? path.join(cacheDir, `systemGraph-${repoCommit}.json`) : null;

  if (opts?.useCache !== false && cachePath) {
    try {
      const raw = await fs.readFile(cachePath, "utf8");
      return JSON.parse(raw) as SystemGraph;
    } catch {
      // continue
    }
  }

  const files: string[] = [];
  for (const r of roots) {
    const abs = path.join(repoRoot, r);
    if (await exists(abs)) await walk(abs, repoRoot, files);
  }

  const nodes = new Map<string, SystemGraphNode>();
  const edges: SystemGraphEdge[] = [];

  // Core nodes
  addNode(nodes, { id: "registry:engine", type: "registry", metadata: { file: "scingular.engine-registry.json" } });
  addNode(nodes, { id: "policy:bfi", type: "policy", metadata: { package: "packages/bfi-policy" } });

  // File nodes
  for (const f of files) {
    addNode(nodes, { id: `file:${f}`, type: "file", metadata: { path: f } });
  }

  // Engine nodes from filesystem
  const engineFiles = files.filter((f) => f.startsWith("scing/engines/") && /\.(ts|tsx|js|jsx)$/.test(f));
  for (const ef of engineFiles) {
    const base = path.posix.basename(ef).replace(/\.[^.]+$/, "");
    const engineId = pascalToKebab(base);
    addNode(nodes, { id: `engine:${engineId}`, type: "engine", metadata: { file: ef } });
    addEdge(edges, { from: `engine:${engineId}`, to: `file:${ef}`, relation: "references" });
  }

  // Engine nodes + relations from registry
  const reg = await readEngineRegistry(repoRoot);
  for (const eng of reg.engines) {
    addNode(nodes, { id: `engine:${eng.id}`, type: "engine", metadata: { registry: true, name: eng.name } });
    addEdge(edges, { from: "registry:engine", to: `engine:${eng.id}`, relation: "registration" });

    for (const dep of eng.dependencies || []) {
      addNode(nodes, { id: `engine:${dep}`, type: "engine", metadata: { inferred: true } });
      addEdge(edges, { from: `engine:${eng.id}`, to: `engine:${dep}`, relation: "dependency" });
    }
  }

  // Import edges between files (relative imports only)
  for (const f of files) {
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f)) continue;

    let raw = "";
    try {
      raw = await fs.readFile(path.join(repoRoot, f), "utf8");
    } catch {
      continue;
    }

    const specs = extractImportSpecs(raw);
    for (const spec of specs) {
      const candidates = resolveRelativeImport(f, spec);
      if (!candidates) continue;

      for (const cand of candidates) {
        const abs = path.join(repoRoot, cand);
        if (await exists(abs)) {
          const toId = `file:${cand}`;
          if (nodes.has(toId)) addEdge(edges, { from: `file:${f}`, to: toId, relation: "imports" });
          break;
        }
      }
    }

    // Registry references
    if (raw.includes("scingular.engine-registry.json")) {
      addEdge(edges, { from: `file:${f}`, to: "registry:engine", relation: "references" });
    }
  }

  const graph: SystemGraph = {
    nodes: Array.from(nodes.values()),
    edges,
    meta: {
      generatedAt: new Date().toISOString(),
      repoCommit,
      fileCount: files.length,
      roots,
    },
  };

  if (cachePath) {
    try {
      await fs.writeFile(cachePath, JSON.stringify(graph, null, 2) + "\n", "utf8");
    } catch {
      // best-effort
    }
  }

  return graph;
}
