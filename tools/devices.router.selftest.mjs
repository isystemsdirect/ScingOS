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

const deviceRouterPath = path.join(repoRoot, 'scing', 'devices', 'deviceRouter.ts');
const captureStorePath = path.join(repoRoot, 'scing', 'devices', 'captureStore.ts');

const { createDeviceRouter } = loadTsModule(deviceRouterPath);
const { createInMemoryCaptureStore } = loadTsModule(captureStorePath);

const store = createInMemoryCaptureStore();
const router = createDeviceRouter({ captureStore: store });

const allowCtx = {
  auth: { uid: 'u1', orgId: 'o1', deviceId: 'd1' },
  session: { sessionId: 's1', inspectionId: 'i1', startedAt: new Date().toISOString(), mode: 'offline', activeEngines: [] },
  entitlements: () => ({ allow: true, reason: 'OK', key: 'vision' }),
  emit: () => {},
  nowIso: () => new Date().toISOString(),
};

{
  const res = await router.capture(allowCtx, {
    requestId: 'r1',
    correlationId: 'c1',
    orgId: 'o1',
    uid: 'u1',
    deviceId: 'd1',
    inspectionId: 'i1',
    engineId: 'LARI-VISION',
    deviceKind: 'camera',
    captureKind: 'photo',
    requestedAt: new Date().toISOString(),
    mode: 'offline',
  });

  assert.equal(res.status, 'queued');
  const pending = await store.listPending();
  assert.equal(pending.length, 1);
  assert.equal(pending[0].record.requestId, 'r1');
}

{
  const denyCtx = {
    ...allowCtx,
    entitlements: () => ({ allow: false, reason: 'NO_ENTITLEMENT', key: 'vision' }),
  };

  let threw = false;
  try {
    await router.capture(denyCtx, {
      requestId: 'r2',
      orgId: 'o1',
      uid: 'u1',
      deviceId: 'd1',
      inspectionId: 'i1',
      engineId: 'LARI-VISION',
      deviceKind: 'camera',
      captureKind: 'photo',
      requestedAt: new Date().toISOString(),
      mode: 'online',
    });
  } catch {
    threw = true;
  }
  assert.equal(threw, true);
}

console.log('devices.router.selftest: OK');
