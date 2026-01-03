import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import Module from 'node:module';
import ts from 'typescript';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const srcRoot = path.join(repoRoot, 'scing');

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
  // Support relative imports within scing/.
  if (request.startsWith('.')) {
    const base = path.resolve(path.dirname(fromPath), request);
    const withTs = `${base}.ts`;
    const withIndexTs = path.join(base, 'index.ts');
    if (fs.existsSync(withTs)) return withTs;
    if (fs.existsSync(withIndexTs)) return withIndexTs;
    if (fs.existsSync(base)) return base;
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

  cache.set(absPath, m);
  m._compile(js, absPath);
  return m.exports;
};

const makeCollapse = ({ confidence, payload }) => ({
  selected: {
    id: 'h0',
    payload,
    confidence,
    stability: 1,
  },
  confidence,
  collapseReason: 'timeout',
});

const selectPath = path.join(srcRoot, 'attractors', 'select.ts');
const { collapseToAttractor } = loadTsModule(selectPath);

// 1) High risk => PROTECTION
{
  const collapse = makeCollapse({ confidence: 0.8, payload: { action: 'delete', target: 'prod' } });
  const out = collapseToAttractor(collapse, {
    userIntent: 'directive',
    hasSecurityFlags: true,
    timePressure: 'low',
  });
  assert.equal(out.id, 'protection');
}

// 2) High clarity + high collapse confidence => ORDER
{
  const collapse = makeCollapse({ confidence: 0.9, payload: { task: 'run build' } });
  const out = collapseToAttractor(collapse, {
    userIntent: 'directive',
    domain: 'engineering',
    timePressure: 'low',
  });
  assert.equal(out.id, 'order');
}

// 3) Exploratory + novelty high => INSIGHT
{
  const collapse = makeCollapse({ confidence: 0.6, payload: { topic: 'new idea' } });
  const out = collapseToAttractor(collapse, {
    userIntent: 'exploratory',
    domain: 'design',
    timePressure: 'low',
  });
  assert.equal(out.id, 'insight');
}

// 4) Low risk + communication need high => EXPRESSION
{
  const collapse = makeCollapse({
    confidence: 0.8,
    payload: { message: 'explain this to stakeholders' },
  });
  const out = collapseToAttractor(collapse, {
    userIntent: 'unknown',
    domain: 'stakeholder alignment',
    timePressure: 'low',
  });
  assert.equal(out.id, 'expression');
}

// 5) Tie cases confirm tie-break order
{
  // Force a tie by passing a neutral collapse + context that yields similar needs.
  // We test tie-break by directly calling selectAttractor on equal scores.
  const selectMod = loadTsModule(path.join(srcRoot, 'attractors', 'select.ts'));
  const typesMod = loadTsModule(path.join(srcRoot, 'attractors', 'types.ts'));

  const input = {
    collapse: makeCollapse({ confidence: 0.8, payload: {} }),
    context: { userIntent: 'unknown', domain: 'engineering', timePressure: 'low' },
  };

  const scores = [
    { id: 'expression', score: 0.5, reasons: [] },
    { id: 'insight', score: 0.5, reasons: [] },
    { id: 'order', score: 0.5, reasons: [] },
    { id: 'protection', score: 0.5, reasons: [] },
  ];

  const out = selectMod.selectAttractor(scores, input);
  assert.equal(out.id, 'protection');

  // Ensure tie-break is stable with same inputs.
  const out2 = selectMod.selectAttractor(scores, input);
  assert.deepEqual(out2, out);

  // Avoid unused import warning in some bundlers.
  assert.ok(typesMod);
}

// 6) Determinism: same inputs => same attractor
{
  const collapse = makeCollapse({ confidence: 0.62, payload: { topic: 'concept' } });
  const ctx = { userIntent: 'exploratory', domain: 'architecture', timePressure: 'medium' };

  const a = collapseToAttractor(collapse, ctx);
  const b = collapseToAttractor(collapse, ctx);
  assert.deepEqual(a, b);
}

console.log('OK: CB-02 attractors self-test passed');
