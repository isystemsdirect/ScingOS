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

const identity = loadTsModule(path.join(srcRoot, 'identity', 'gating.ts'));
const style = loadTsModule(path.join(srcRoot, 'identity', 'styleRules.ts'));

const makeCollapse = (confidence, payload = {}) => ({
  selected: { id: 'h0', payload, confidence, stability: 1 },
  confidence,
  collapseReason: 'timeout',
});

const makeAttractor = (id, confidence, policy) => ({ id, confidence, policy });

const basePolicy = {
  verbosity: 'standard',
  tone: 'formal',
  structure: 'checklist',
  riskPosture: 'cautious',
};

// 1) Directive + order attractor => act, checklist, formal, short
{
  const input = {
    collapse: makeCollapse(0.9),
    attractor: makeAttractor('order', 0.9, basePolicy),
    gradients: { stress: 0.2, curiosity: 0.2, urgency: 0.2, confidence: 0.8 },
    context: { userIntent: 'directive', requestImpact: 'medium', hasSecurityFlags: false },
  };
  const d = identity.evaluateIdentityConstraints(input);
  assert.equal(d.disposition, 'act');
  assert.equal(d.constraints.enforceStructure, 'checklist');
  assert.equal(d.outputLimits.maxLength, 'short');
}

// 2) High contradiction => pause, short
{
  const input = {
    collapse: makeCollapse(0.75),
    attractor: makeAttractor('expression', 0.7, { ...basePolicy, structure: 'narrative', tone: 'neutral' }),
    gradients: { stress: 0.2, curiosity: 0.2, urgency: 0.2, confidence: 0.7 },
    context: { userIntent: 'unknown', contradiction: 0.9, requestImpact: 'medium', hasSecurityFlags: false },
  };
  const d = identity.evaluateIdentityConstraints(input);
  assert.equal(d.disposition, 'pause');
  assert.equal(d.outputLimits.maxLength, 'short');
}

// 3) High ambiguity + medium/high impact => ask, exactly one question after style filter
{
  const input = {
    collapse: makeCollapse(0.28),
    attractor: makeAttractor('insight', 0.7, { ...basePolicy, structure: 'hybrid', tone: 'creative' }),
    gradients: { stress: 0.2, curiosity: 0.7, urgency: 0.2, confidence: 0.4 },
    context: { userIntent: 'unknown', requestImpact: 'high', hasSecurityFlags: false },
  };
  const d = identity.evaluateIdentityConstraints(input);
  assert.equal(d.disposition, 'ask');

  const draft = 'First question? Second question?';
  const filtered = style.applyStyleRules(draft, d);
  assert.equal((filtered.match(/\?/g) || []).length, 1);
}

// 4) Security flags + high impact + low confidence => defer
{
  const input = {
    collapse: makeCollapse(0.4),
    attractor: makeAttractor('protection', 0.8, { ...basePolicy, riskPosture: 'restricted', tone: 'guarded' }),
    gradients: { stress: 0.8, curiosity: 0.1, urgency: 0.6, confidence: 0.4 },
    context: { userIntent: 'directive', requestImpact: 'high', hasSecurityFlags: true },
  };
  const d = identity.evaluateIdentityConstraints(input);
  assert.equal(d.disposition, 'defer');
  assert.equal(d.constraints.enforceStructure, 'checklist');
}

// 5) Disallowed request => decline, guarded, short
{
  const input = {
    collapse: makeCollapse(0.9),
    attractor: makeAttractor('order', 0.9, basePolicy),
    gradients: { stress: 0.2, curiosity: 0.2, urgency: 0.2, confidence: 0.8 },
    context: { userIntent: 'directive', requestImpact: 'high', hasSecurityFlags: true, disallowed: true },
  };
  const d = identity.evaluateIdentityConstraints(input);
  assert.equal(d.disposition, 'decline');
  assert.equal(d.constraints.enforceTone, 'guarded');
  assert.equal(d.outputLimits.maxLength, 'short');
}

// 6) No forbidden phrases appear when styleRules applied
{
  const input = {
    collapse: makeCollapse(0.9),
    attractor: makeAttractor('expression', 0.7, { ...basePolicy, structure: 'narrative', tone: 'neutral' }),
    gradients: { stress: 0.2, curiosity: 0.2, urgency: 0.8, confidence: 0.8 },
    context: { userIntent: 'unknown', requestImpact: 'low', hasSecurityFlags: false },
  };
  const d = identity.evaluateIdentityConstraints(input);

  const draft = "Sorry, I can't do that. Sit tight—give me time. I'm excited!";
  const filtered = style.applyStyleRules(draft, d);

  assert.ok(!/\bsorry\b/i.test(filtered));
  assert.ok(!/\bsit tight\b/i.test(filtered));
  assert.ok(!/\bgive me time\b/i.test(filtered));
  assert.ok(!/\bI'm excited\b/i.test(filtered));
  assert.ok(!/\bI can't\b/i.test(filtered));
}

console.log('OK: CB-04 identity self-test passed');
