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

const regPath = path.join(repoRoot, 'scing', 'domains', 'domainRegistry.ts');
const { getDomain } = loadTsModule(regPath);

const d = getDomain('moisture_mold');
assert.ok(d);
assert.equal(d.domainKey, 'moisture_mold');
assert.equal(d.version, '1.0.0');
assert.ok(d.requiredMeasurements.length > 0);
assert.ok(d.requiredArtifacts.length > 0);

console.log('domains.moisture.selftest: OK');
