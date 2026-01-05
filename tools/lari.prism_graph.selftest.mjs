import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import Module from 'node:module';
import ts from 'typescript';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const cache = new Map();

const readTs = (absPath) => fs.readFileSync(absPath, 'utf8');

const transpile = (absPath) => {
  const source = readTs(absPath);
  const out = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      strict: false,
      skipLibCheck: true,
    },
    fileName: absPath,
  });
  return out.outputText;
};

const resolveTs = (fromPath, request) => {
  if (request.startsWith('.')) {
    const base = path.resolve(path.dirname(fromPath), request);
    const withTs = `${base}.ts`;
    const withIndexTs = path.join(base, 'index.ts');
    if (fs.existsSync(withTs)) return withTs;
    if (fs.existsSync(withIndexTs)) return withIndexTs;
  }
  return null;
};

const loadTsModule = (absPath) => {
  if (cache.has(absPath)) return cache.get(absPath).exports;

  const js = transpile(absPath);
  const m = new Module(absPath);
  m.filename = absPath;
  m.paths = Module._nodeModulePaths(path.dirname(absPath));

  m.require = (request) => {
    const resolved = resolveTs(absPath, request);
    if (resolved) return loadTsModule(resolved);
    return Module.createRequire(url.pathToFileURL(absPath))(request);
  };

  m._compile(js, absPath);
  cache.set(absPath, m);
  return m.exports;
};

const buildPath = path.join(repoRoot, 'scing', 'lari', 'prism', 'buildPrismGraph.ts');
const { buildPrismGraph } = loadTsModule(buildPath);

const artifactsA = [
  {
    artifactId: 'a1',
    createdAt: '2026-01-03T00:00:00.000Z',
    type: 'photo',
    source: 'device',
    integrity: { contentHash: 'h1', integrityState: 'ok' },
    finalized: true,
    tags: [],
    provenance: { capturedAt: '2026-01-03T00:00:00.000Z', engineId: 'LARI-VISION' },
  },
  {
    artifactId: 'a2',
    createdAt: '2026-01-03T00:00:01.000Z',
    type: 'thermal',
    source: 'device',
    integrity: { contentHash: 'h2', integrityState: 'ok' },
    finalized: true,
    tags: [],
    provenance: { capturedAt: '2026-01-03T00:00:01.000Z', engineId: 'LARI-VISION' },
  },
];

const findingsA = [
  {
    findingId: 'f1',
    createdAt: '2026-01-03T00:00:02.000Z',
    engineId: 'LARI-PRISM',
    title: 'Leak risk',
    severity: 'major',
    confidence: 0.8,
    rationale: 'Pattern indicates moisture',
    relatedArtifactIds: ['a2', 'a1'],
    codeRefs: [],
  },
];

const classificationsA = [
  {
    classificationId: 'c1',
    createdAt: '2026-01-03T00:00:03.000Z',
    engineId: 'LARI-PRISM',
    label: 'roof',
    confidence: 0.9,
    relatedArtifactIds: ['a1'],
    metadata: null,
  },
];

const g1 = buildPrismGraph({
  artifacts: artifactsA,
  findings: findingsA,
  classifications: classificationsA,
});

// Reorder inputs and ensure deterministic graphHash.
const g2 = buildPrismGraph({
  artifacts: [...artifactsA].reverse(),
  findings: [...findingsA].reverse(),
  classifications: [...classificationsA].reverse(),
});

assert.equal(g1.graphHash, g2.graphHash);
assert.equal(g1.nodes.length, g2.nodes.length);
assert.equal(g1.edges.length, g2.edges.length);

console.log('lari.prism_graph.selftest: OK');
