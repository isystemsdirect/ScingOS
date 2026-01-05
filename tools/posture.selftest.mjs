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

const extract = loadTsModule(path.join(srcRoot, 'posture', 'extract.ts'));
const classify = loadTsModule(path.join(srcRoot, 'posture', 'classify.ts'));

const mkInput = (text, overrides = {}) => {
  const now = Date.now();
  return {
    text,
    interaction: {
      messageLengthChars: text.length,
      messagesLast2Min: 0,
      repeatedPhrases: 0,
      capsRatio: 0,
    },
    context: { timePressure: 'medium', hasSecurityFlags: false },
    history: { lastPostures: [] },
    sensors: { voiceTension: 0, voiceRate: 0, bioStress: 0 },
    _now: now,
    ...overrides,
  };
};

const run = (input) => {
  const features = extract.extractSignals(input);
  const scores = classify.scorePostures(features);
  return classify.selectPostureWithContext(scores, input.history, input.context);
};

// Short imperative command => DIRECTIVE
{
  const input = mkInput('fix this now');
  const res = run(input);
  assert.equal(res.id, 'directive');
}

// “options/compare/why” => EXPLORATORY
{
  const input = mkInput('what if we compare options and explain why?');
  const res = run(input);
  assert.equal(res.id, 'exploratory');
}

// rapid messages + overload phrase => OVERLOADED
{
  const input = mkInput("I'm overwhelmed and can't track this");
  input.interaction.messagesLast2Min = 6;
  input.sensors.bioStress = 0.9;
  const res = run(input);
  assert.equal(res.id, 'overloaded');
  assert.equal(res.constraints.askSingleQuestion, true);
}

// caps + “still/broken” => FRUSTRATED
{
  const input = mkInput('THIS IS STILL BROKEN');
  input.interaction.capsRatio = 0.6;
  input.interaction.repeatedPhrases = 3;
  const res = run(input);
  assert.equal(res.id, 'frustrated');
}

// “proceed/locked/perfect” => CONFIDENT
{
  const input = mkInput('perfect. proceed. locked. go');
  const res = run(input);
  assert.equal(res.id, 'confident');
}

// no markers => UNKNOWN
{
  const input = mkInput('ok');
  const res = run(input);
  assert.equal(res.id, 'unknown');
}

// hysteresis prevents frequent flipping
{
  const now = Date.now();
  const history = { lastPostures: [{ ts: now - 1000, id: 'directive' }] };

  const input = mkInput('what if we compare options?', { history });
  // Make exploratory not clearly dominant by raising time pressure (boosts directive) and keeping text short-ish.
  input.context.timePressure = 'high';

  const features = extract.extractSignals(input);
  const scores = classify.scorePostures(features);
  const res = classify.selectPostureWithContext(scores, history, input.context);

  assert.equal(res.id, 'directive');
}

console.log('OK: CB-07 posture self-test passed');
