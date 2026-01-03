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

const transpile = (absPath) => {
  const source = fs.readFileSync(absPath, 'utf8');
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

  cache.set(absPath, m);
  m._compile(js, absPath);
  return m.exports;
};

const gate = loadTsModule(path.join(srcRoot, 'orderFocus', 'gate.ts'));

const mkInput = (overrides = {}) => {
  const now = Date.now();
  return {
    collapse: { confidence: 0.8 },
    attractor: {
      id: 'order',
      confidence: 0.8,
      policy: {
        verbosity: 'standard',
        tone: 'formal',
        structure: 'checklist',
        riskPosture: 'open',
      },
    },
    gradients: { stress: 0.2, curiosity: 0.2, urgency: 0.6, confidence: 0.8 },
    decisionDraft: undefined,
    context: {
      userIntent: 'directive',
      hasSecurityFlags: false,
      requestImpact: 'medium',
      timePressure: 'medium',
    },
    signals: { ambiguity: 0.2, contradiction: 0.0, lastInputTs: now, lastIntentLabel: 'directive' },
    history: {
      intents: [
        { ts: now - 30_000, label: 'directive' },
        { ts: now - 20_000, label: 'directive' },
        { ts: now - 10_000, label: 'directive' },
      ],
      constraints: [],
    },
    ...overrides,
  };
};

// High coherence + stable intent => act
{
  const now = Date.now();
  const input = mkInput();
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'act');
  assert.equal(s.reasonCode, 'stable');
  assert.ok(s.coherence >= 0);
  assert.ok(s.intentStability >= 0.6);
}

// Medium coherence => ask
{
  const now = Date.now();
  const input = mkInput({
    collapse: { confidence: 0.75 },
    attractor: { ...mkInput().attractor, id: 'order' },
    gradients: { ...mkInput().gradients, curiosity: 0.3, urgency: 0.6, stress: 0.2 },
    context: { ...mkInput().context, userIntent: 'directive' },
    signals: { ...mkInput().signals, ambiguity: 0.25 },
    history: {
      intents: [
        { ts: now - 30_000, label: 'directive' },
        { ts: now - 20_000, label: 'exploratory' },
        { ts: now - 10_000, label: 'exploratory' },
      ],
      constraints: [],
    },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'ask');
}

// Low coherence => pause
{
  const now = Date.now();
  const input = mkInput({
    collapse: { confidence: 0.25 },
    attractor: { ...mkInput().attractor, id: 'expression' },
    gradients: { ...mkInput().gradients, curiosity: 0.9, urgency: 0.1, stress: 0.8 },
    context: { ...mkInput().context, userIntent: 'unknown' },
    signals: { ambiguity: 0.95, contradiction: 0.0, lastInputTs: now, lastIntentLabel: 'unknown' },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'pause');
}

// High contradiction => pause (or ask if timePressure high)
{
  const now = Date.now();
  const input = mkInput({
    signals: { ...mkInput().signals, contradiction: 0.9 },
    context: { ...mkInput().context, timePressure: 'medium' },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'pause');
  assert.equal(s.reasonCode, 'conflicted');
}
{
  const now = Date.now();
  const input = mkInput({
    signals: { ...mkInput().signals, contradiction: 0.9 },
    context: { ...mkInput().context, timePressure: 'high' },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'ask');
}

// Oscillation high => pause
{
  const now = Date.now();
  const input = mkInput({
    history: {
      intents: [
        { ts: now - 40_000, label: 'directive' },
        { ts: now - 30_000, label: 'exploratory' },
        { ts: now - 20_000, label: 'directive' },
        { ts: now - 10_000, label: 'exploratory' },
      ],
      constraints: [],
    },
    context: { ...mkInput().context, timePressure: 'medium' },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'pause');
  assert.equal(s.reasonCode, 'oscillating');
}

// Protection attractor + low coherence => defer
{
  const now = Date.now();
  const input = mkInput({
    attractor: {
      id: 'protection',
      confidence: 0.7,
      policy: {
        verbosity: 'minimal',
        tone: 'guarded',
        structure: 'checklist',
        riskPosture: 'restricted',
      },
    },
    collapse: { confidence: 0.35 },
    gradients: { ...mkInput().gradients, curiosity: 0.8, urgency: 0.2, stress: 0.7 },
    context: { ...mkInput().context, hasSecurityFlags: true },
    signals: { ...mkInput().signals, ambiguity: 0.8, contradiction: 0.1 },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.dispositionBias, 'defer');
  assert.equal(s.reasonCode, 'risky');
}

// Stale input => ask + coherence reduced
{
  const now = Date.now();
  const input = mkInput({
    signals: { ...mkInput().signals, lastInputTs: now - 600_000 },
  });
  const s = gate.gateOrderFocus(input, now);
  assert.equal(s.reasonCode, 'stale_inputs');
  assert.equal(s.dispositionBias, 'ask');
}

// Determinism across runs
{
  const now = Date.now();
  const input = mkInput();
  const a = gate.gateOrderFocus(input, now);
  const b = gate.gateOrderFocus(input, now);
  assert.deepEqual(a, b);
}

console.log('OK: CB-06 orderFocus self-test passed');
