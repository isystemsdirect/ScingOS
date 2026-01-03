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

const derive = loadTsModule(path.join(srcRoot, 'gradients', 'derive.ts'));
const apply = loadTsModule(path.join(srcRoot, 'gradients', 'apply.ts'));

// Bounds + determinism
{
  const ctx = {
    userIntent: 'exploratory',
    timePressure: 'medium',
    hasSecurityFlags: false,
    recentErrors: 2,
    systemLoad: 'low',
    sensor: { bioStress: 0.4, voiceTension: 0.2 },
  };

  const a = derive.deriveGradients(ctx);
  const b = derive.deriveGradients(ctx);
  assert.deepEqual(a, b);

  for (const k of ['stress', 'curiosity', 'urgency', 'confidence']) {
    assert.ok(a[k] >= 0 && a[k] <= 1);
  }
}

// Urgency high => fewer cycles + higher varianceThreshold
{
  const g = derive.deriveGradients({ userIntent: 'directive', timePressure: 'high' });
  const eff = apply.effectiveCollapseParams(g);
  assert.ok(eff.maxEvaluationCycles <= 3);
  assert.ok(eff.varianceThreshold >= 0.05);
}

// Curiosity high => more cycles + lower varianceThreshold
{
  const g = derive.deriveGradients({ userIntent: 'exploratory', timePressure: 'low', hasSecurityFlags: false });
  assert.ok(g.curiosity >= 0.7);
  const eff = apply.effectiveCollapseParams(g);
  assert.ok(eff.maxEvaluationCycles >= 3);
  assert.ok(eff.varianceThreshold <= 0.05);
}

// Stress high + security flags => curiosity capped and posture tightens
{
  const g = derive.deriveGradients({
    userIntent: 'overloaded',
    hasSecurityFlags: true,
    systemLoad: 'high',
    sensor: { bioStress: 1.0, voiceTension: 1.0 },
  });

  assert.ok(g.stress >= 0.35);
  assert.ok(g.curiosity <= 0.45);

  const basePolicy = {
    verbosity: 'expanded',
    tone: 'creative',
    structure: 'hybrid',
    riskPosture: 'open',
  };

  const next = apply.applyToAttractorPolicy(basePolicy, g, { hasSecurityFlags: true, userIntent: 'overloaded' }, false);
  assert.equal(next.riskPosture, 'cautious');
}

// Policy shift limiter: never exceed 1 verbosity level
{
  const g = { stress: 0.9, curiosity: 0.95, urgency: 0.95, confidence: 0.5 };
  const basePolicy = {
    verbosity: 'expanded',
    tone: 'creative',
    structure: 'hybrid',
    riskPosture: 'open',
  };

  const next = apply.applyToAttractorPolicy(basePolicy, g, { hasSecurityFlags: false }, false);
  // Multiple triggers exist; limiter means only net 1 level shift.
  // expanded -> standard (one step down) is the maximum allowed here.
  assert.equal(next.verbosity, 'standard');
}

// Confidence injection smoothing
{
  const g0 = derive.deriveGradients({});
  const g1 = apply.withCollapseConfidence(g0, 1.0);
  // Weighted: 0.65*1.0 + 0.35*0.5 = 0.825
  assert.ok(Math.abs(g1.confidence - 0.825) < 1e-12);
}

console.log('OK: CB-03 gradients self-test passed');
