// ScingGPT HTTPS MCP Proxy (Read-Only Gate)
// - Proxies requests to local stdio MCP server (http://127.0.0.1:8787)
// - Enforces REMOTE_GATE.json allowlist
// - Optional bearer token auth via REMOTE_TOKEN env var
// - Starts HTTPS if SSL_KEY_PATH/SSL_CERT_PATH provided, else HTTP fallback

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');

const ROOT_DIR = __dirname;
const GATE_PATH = path.join(ROOT_DIR, 'REMOTE_GATE.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs');
const AUDIT_FILE = path.join(LOG_DIR, 'proxy.audit.jsonl');

// Ensure logs dir
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}

// Load gate
let GATE;
try {
  GATE = JSON.parse(fs.readFileSync(GATE_PATH, 'utf8'));
} catch (e) {
  console.error('Failed to read REMOTE_GATE.json:', e.message);
  process.exit(1);
}

if (GATE.mode !== 'read_only') {
  console.error('GATE ERROR: Write mode is not enabled. Set mode to "read_only" until auth is enforced.');
  process.exit(1);
}

const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 8787; // Local stdio MCP server port
const REQUIRED_TOKEN = process.env.REMOTE_TOKEN || null; // Optional auth for now

function logAudit(entry) {
  const record = { ts: new Date().toISOString(), ...entry };
  fs.appendFile(AUDIT_FILE, JSON.stringify(record) + '\n', () => {});
}

function isAllowedPath(pathname) {
  if (!pathname) return false;
  return Array.isArray(GATE.allowed_tools) && GATE.allowed_tools.some(tool => pathname.includes(tool));
}

function handler(req, res) {
  const parsed = url.parse(req.url || '/', true);
  const pathname = parsed.pathname || '/';
  const ip = req.socket && req.socket.remoteAddress || 'unknown';

  // Optional bearer token check
  if (REQUIRED_TOKEN) {
    const auth = req.headers['authorization'] || '';
    const ok = auth.startsWith('Bearer ') && auth.slice('Bearer '.length) === REQUIRED_TOKEN;
    if (!ok) {
      logAudit({ ip, method: req.method, path: pathname, allowed: false, reason: 'unauthorized' });
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('Unauthorized');
      return;
    }
  }

  // Gate enforcement
  if (!isAllowedPath(pathname)) {
    logAudit({ ip, method: req.method, path: pathname, allowed: false, reason: 'denied_by_gate' });
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden: Access Denied');
    return;
  }

  // Proxy to local MCP server
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
    logAudit({ ip, method: req.method, path: pathname, allowed: true, status: proxyRes.statusCode });
  });

  proxyReq.on('error', (err) => {
    logAudit({ ip, method: req.method, path: pathname, allowed: true, error: err.message });
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
}

// HTTPS if certs provided, otherwise HTTP fallback
const hasTLS = process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH;
let server;
let port;

if (hasTLS) {
  const key = fs.readFileSync(process.env.SSL_KEY_PATH);
  const cert = fs.readFileSync(process.env.SSL_CERT_PATH);
  server = https.createServer({ key, cert }, handler);
  port = process.env.PORT ? Number(process.env.PORT) : 4443;
  server.listen(port, '127.0.0.1', () => {
    console.log(`HTTPS Proxy running on https://localhost:${port}`);
    console.log('Gate mode:', GATE.mode);
  });
} else {
  server = http.createServer(handler);
  port = process.env.PORT ? Number(process.env.PORT) : 8788;
  server.listen(port, '127.0.0.1', () => {
    console.log(`HTTP Proxy running on http://localhost:${port}`);
    console.log('Gate mode:', GATE.mode);
    console.warn('TLS not configured. For internet exposure, front this with Cloudflare Tunnel or similar.');
  });
}
