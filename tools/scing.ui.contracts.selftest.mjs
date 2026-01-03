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

const registry = loadTsModule(path.join(srcRoot, 'engine', 'engineRegistry.ts'));
const ui = loadTsModule(path.join(srcRoot, 'ui', 'engineContracts.ts'));

const engineIds = Object.keys(registry.ENGINE_REGISTRY).slice().sort();
assert.ok(engineIds.length > 0, 'ENGINE_REGISTRY should not be empty');

for (const id of engineIds) {
  const c = ui.getEngineUIContract(id);
  assert.equal(c.engineId, id, `engineId mismatch for ${id}`);
  assert.ok(
    typeof c.displayName === 'string' && c.displayName.length > 0,
    `missing displayName for ${id}`
  );
  assert.ok(
    Array.isArray(c.reportSections) && c.reportSections.length > 0,
    `missing report sections for ${id}`
  );
}

console.log(`ok: validated UI contracts for ${engineIds.length} engines`);
