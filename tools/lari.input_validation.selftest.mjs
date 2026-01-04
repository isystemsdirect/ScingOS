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

const validatePath = path.join(repoRoot, 'scing', 'lari', 'contracts', 'validateLariInput.ts');
const { validateLariInput } = loadTsModule(validatePath);

const good = {
  engineId: 'LARI-PRISM',
  inspectionId: 'insp_1',
  receivedAt: '2026-01-03T00:00:00.000Z',
  artifacts: [{ artifactId: 'a1', type: 'photo' }],
  measurements: [
    {
      measurementId: 'm1',
      name: 'Roof pitch',
      kind: 'length',
      observedAt: '2026-01-03T00:00:00.000Z',
      value: { value: 12.5, unit: 'cm', tolerance: { abs: 0.5, rel: 0.1 } },
      evidence: [{ kind: 'artifact', refId: 'a1' }],
    },
  ],
  fieldInputs: [
    {
      fieldId: 'f1',
      label: 'Inspector note',
      valueText: 'No visible damage',
      observedAt: '2026-01-03T00:00:00.000Z',
      evidence: [{ kind: 'field_input', refId: 'f1' }],
    },
  ],
  schemaVersion: '1.0.0',
};

{
  const res = validateLariInput(good);
  assert.equal(res.ok, true);
}

{
  const bad = structuredClone(good);
  bad.measurements[0].value.unit = 'bananas';
  const res = validateLariInput(bad);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.includes('UNKNOWN_UNIT')));
}

{
  const bad = structuredClone(good);
  bad.measurements[0].value.tolerance.abs = -1;
  const res = validateLariInput(bad);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.includes('INVALID_TOL_ABS')));
}

console.log('lari.input_validation.selftest: OK');
