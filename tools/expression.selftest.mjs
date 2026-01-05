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

const compose = loadTsModule(path.join(srcRoot, 'expression', 'compose.ts'));
const language = loadTsModule(path.join(srcRoot, 'expression', 'languagePlan.ts'));
const telemetry = loadTsModule(path.join(srcRoot, 'expression', 'telemetryPlan.ts'));

const mkDecision = (disposition, extra = {}) => ({
  disposition,
  confidence: 0.8,
  constraints: {
    forbidBegging: true,
    forbidPanic: true,
    forbidOverExplain: true,
    enforceDirectness: false,
    enforceStructure: 'inherit',
    enforceTone: 'inherit',
    silenceAllowed: false,
  },
  outputLimits: {
    maxOptions: 4,
    maxLength: 'medium',
    requireConcreteDates: false,
    requireExplicitAssumptions: false,
  },
  ...extra,
});

const mkAttractor = (id, policyOverrides = {}) => ({
  id,
  confidence: 0.75,
  policy: {
    verbosity: 'standard',
    tone: 'creative',
    structure: 'hybrid',
    riskPosture: 'open',
    ...policyOverrides,
  },
});

// Determinism + curiosity expands verbosity
{
  const input = {
    collapse: { confidence: 0.7 },
    attractor: mkAttractor('expression'),
    gradients: { stress: 0.1, curiosity: 0.8, urgency: 0.2, confidence: 0.7 },
    decision: mkDecision('act'),
    context: { hasSecurityFlags: false },
  };

  const a = compose.composeExpressionBundle(input);
  const b = compose.composeExpressionBundle(input);
  assert.deepEqual(a, b);

  assert.equal(a.responsePlan.verbosity, 'expanded');
  assert.ok(typeof a.responsePlan.limits.maxOptions === 'number');
  assert.ok(['short', 'medium', 'long'].includes(a.responsePlan.limits.maxLength));
  assert.equal(a.telemetry.state, 'speaking');
  assert.equal(a.telemetry.channel, 'rainbow_speak');
  assert.ok(a.telemetry.intensity >= 0 && a.telemetry.intensity <= 1);
}

// Urgency high => reduce verbosity
{
  const input = {
    collapse: { confidence: 0.8 },
    attractor: mkAttractor('insight', { verbosity: 'standard' }),
    gradients: { stress: 0.2, curiosity: 0.4, urgency: 0.95, confidence: 0.7 },
    decision: mkDecision('act'),
    context: { hasSecurityFlags: false },
  };

  const plan = language.buildResponsePlan(input.attractor, input.gradients, input.decision);
  assert.equal(plan.verbosity, 'minimal');
  assert.ok(plan.limits.maxOptions >= 1);
}

// ASK disposition override
{
  const input = {
    collapse: { confidence: 0.4 },
    attractor: mkAttractor('order'),
    gradients: { stress: 0.2, curiosity: 0.2, urgency: 0.2, confidence: 0.4 },
    decision: mkDecision('ask'),
    context: { hasSecurityFlags: false },
  };

  const plan = language.buildResponsePlan(input.attractor, input.gradients, input.decision);
  assert.equal(plan.structure, 'checklist');
  assert.equal(plan.verbosity, 'minimal');
  assert.equal(plan.limits.maxOptions, 1);
  assert.deepEqual(
    plan.sections.filter((s) => s.enabled).map((s) => s.id),
    ['question', 'next']
  );
  assert.equal(plan.formatting.bulletStyle, 'dash');

  const frame = telemetry.buildTelemetry(
    input.attractor,
    input.gradients,
    input.decision,
    input.context
  );
  assert.equal(frame.state, 'asking');
  assert.equal(frame.channel, 'amber_think');
}

// Posture constraints applied to ResponsePlan
{
  const input = {
    collapse: { confidence: 0.7 },
    attractor: mkAttractor('insight', { verbosity: 'expanded', structure: 'hybrid' }),
    gradients: { stress: 0.2, curiosity: 0.6, urgency: 0.2, confidence: 0.7 },
    decision: mkDecision('act', {
      outputLimits: { maxOptions: 5, maxLength: 'long', requireExplicitAssumptions: false },
    }),
    posture: {
      id: 'overloaded',
      confidence: 0.9,
      signals: {
        brevityPreference: 0.95,
        structurePreference: 0.95,
        toleranceForOptions: 0.1,
        urgencyCue: 0.5,
        frictionCue: 0.6,
      },
      constraints: {
        maxOptions: 1,
        maxLength: 'short',
        askSingleQuestion: true,
        preferChecklist: true,
      },
    },
    context: { hasSecurityFlags: false },
  };

  const bundle = compose.composeExpressionBundle(input);
  assert.equal(bundle.responsePlan.limits.maxOptions, 1);
  assert.equal(bundle.responsePlan.limits.maxLength, 'short');
  assert.equal(bundle.responsePlan.structure, 'checklist');
}

// Protection attractor => alert channel + protection tag
{
  const input = {
    collapse: { confidence: 0.9 },
    attractor: mkAttractor('protection', { tone: 'guarded', riskPosture: 'restricted' }),
    gradients: { stress: 0.6, curiosity: 0.2, urgency: 0.4, confidence: 0.9 },
    decision: mkDecision('act'),
    context: { hasSecurityFlags: true },
  };

  const frame = telemetry.buildTelemetry(
    input.attractor,
    input.gradients,
    input.decision,
    input.context
  );
  assert.equal(frame.channel, 'redviolet_alert');
  assert.ok(frame.tags.includes('protection_mode'));
}

// Assumptions required => section enabled
{
  const decision = mkDecision('act', { outputLimits: { requireExplicitAssumptions: true } });
  const attractor = mkAttractor('order');
  const gradients = { stress: 0.2, curiosity: 0.2, urgency: 0.2, confidence: 0.7 };

  const plan = language.buildResponsePlan(attractor, gradients, decision);
  assert.ok(plan.sections.some((s) => s.id === 'assumptions' && s.enabled === true));
}

console.log('OK: CB-05 expression self-test passed');
