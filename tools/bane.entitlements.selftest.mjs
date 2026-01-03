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

const ent = loadTsModule(path.join(srcRoot, 'bane', 'baneEntitlements.ts'));

const nowMs = Date.now();
const nowIso = new Date(nowMs).toISOString();
const laterIso = new Date(nowMs + 60 * 60 * 1000).toISOString();

const snapshot = {
  uid: 'u1',
  orgId: 'o1',
  issuedAt: nowIso,
  expiresAt: laterIso,
  policyVersion: 1,
  roles: { u1: 'admin' },
  entitlements: {
    vision: {
      uid: 'u1',
      key: 'vision',
      stage: 'A',
      status: 'active',
      issuedAt: nowIso,
      expiresAt: laterIso,
      graceUntil: null,
      seatBound: false,
      deviceBound: false,
      allowedDeviceIds: [],
      caps: ['read'],
      policyVersion: 1,
      updatedAt: nowIso,
    },
  },
  constraints: {
    offlineAllowed: true,
    offlineHardDenyExternalHardware: true,
    offlineHardDenyPhysicalControl: true,
    maxOfflineSeconds: 3600,
  },
  hash: 'test',
  signature: { alg: 'HS256', kid: 'test', sig: 'test' },
};

// 1) Offline allow when snapshot valid and stage sufficient
{
  const d = ent.evaluateEntitlement({
    authUid: 'u1',
    orgId: 'o1',
    key: 'vision',
    requiredStage: 'A',
    online: false,
    snapshot,
    nowMs,
  });
  assert.equal(d.allow, true);
  assert.equal(d.reason, 'OK');
}

// 2) Offline hard-deny external hardware
{
  const d = ent.evaluateEntitlement({
    authUid: 'u1',
    orgId: 'o1',
    key: 'vision',
    requiredStage: 'A',
    requiresExternalHardware: true,
    online: false,
    snapshot,
    nowMs,
  });
  assert.equal(d.allow, false);
  assert.equal(d.reason, 'OFFLINE_DENY_EXTERNAL');
}

console.log('OK tools/bane.entitlements.selftest.mjs');
