import https from "https";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import os from "os";
import { spawn } from "child_process";

const PORT = process.env.PORT ? Number(process.env.PORT) : 9443;
const UPLOAD_DIR = join(process.cwd(), "uploads");
const CERT_DIR = join(process.cwd(), "certs");
const CERT_FILE = join(CERT_DIR, "server.crt");
const KEY_FILE = join(CERT_DIR, "server.key");

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
if (!existsSync(CERT_DIR)) mkdirSync(CERT_DIR, { recursive: true });

const CLIP_FILE = join(process.cwd(), "clipboard.json");
let lastClip = { text: "", ts: 0, from: "" };

function loadClip() {
  try {
    if (existsSync(CLIP_FILE)) {
      const j = JSON.parse(readFileSync(CLIP_FILE, "utf8"));
      if (j && typeof j.text === "string") lastClip = j;
    }
  } catch {}
}
function saveClip() {
  try { writeFileSync(CLIP_FILE, JSON.stringify(lastClip), "utf8"); } catch {}
}
loadClip();

function getLanIPs() {
  const ifaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(ifaces)) {
    for (const i of (ifaces[name] || [])) {
      if (i && i.family === "IPv4" && !i.internal) ips.push(i.address);
    }
  }
  return ips;
}

function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

// Generate self-signed certificate if missing
function generateCertificate() {
  if (existsSync(CERT_FILE) && existsSync(KEY_FILE)) {
    console.log("[CERT] Using existing certificate");
    return true;
  }

  console.log("[CERT] Generating self-signed certificate (5-year validity)...");
  
  return new Promise((resolve) => {
    const cmd = spawn("openssl", [
      "req", "-x509", "-newkey", "rsa:2048",
      "-keyout", KEY_FILE,
      "-out", CERT_FILE,
      "-days", "1825",
      "-nodes",
      "-subj", "/CN=spectrocap.local/O=SpectroCAP/C=US"
    ]);

    cmd.on("close", (code) => {
      if (code === 0) {
        console.log("[CERT] Certificate generated successfully");
        resolve(true);
      } else {
        console.error("[CERT] Failed to generate certificate");
        resolve(false);
      }
    });

    cmd.on("error", (err) => {
      console.error("[CERT] openssl error:", err.message);
      console.log("[CERT] Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html");
      resolve(false);
    });
  });
}

// Request handler
function handleRequest(req, res) {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true, ts: Date.now(), port: PORT, ips: getLanIPs(), protocol: "https" });
  }

  if (req.method === "POST" && req.url === "/ingest") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        const j = JSON.parse(raw || "{}");
        const id = j.id || `cap_${Date.now()}`;
        const b64 = j.pngBase64 || "";
        if (!b64) return send(res, 400, { ok: false, error: "Missing pngBase64" });

        const buf = Buffer.from(b64, "base64");
        const out = join(UPLOAD_DIR, `${id}.png`);
        writeFileSync(out, buf);

        return send(res, 200, { ok: true, saved: out, bytes: buf.length });
      } catch (e) {
        return send(res, 400, { ok: false, error: String(e) });
      }
    });
    return;
  }

  // Clipboard: push from phone/app
  if (req.method === "POST" && req.url === "/clip/push") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        const j = JSON.parse(raw || "{}");
        const text = (j.text || "").toString();
        const from = (j.from || "unknown").toString();
        if (!text) return send(res, 400, { ok: false, error: "Missing text" });

        lastClip = { text, ts: Date.now(), from };
        saveClip();
        console.log(`[CLIP] Pushed from ${from}: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`);
        return send(res, 200, { ok: true, ts: lastClip.ts, from: lastClip.from, length: lastClip.text.length });
      } catch (e) {
        return send(res, 400, { ok: false, error: String(e) });
      }
    });
    return;
  }

  // Clipboard: pull for Windows client
  if (req.method === "GET" && req.url === "/clip/pull") {
    return send(res, 200, { ok: true, ...lastClip });
  }

  // Clipboard: clear
  if (req.method === "POST" && req.url === "/clip/clear") {
    lastClip = { text: "", ts: Date.now(), from: "cleared" };
    saveClip();
    console.log("[CLIP] Cleared");
    return send(res, 200, { ok: true });
  }

  send(res, 404, { ok: false, error: "Not found" });
}

// Start HTTPS server
async function start() {
  const certReady = await generateCertificate();
  
  if (!certReady || !existsSync(CERT_FILE) || !existsSync(KEY_FILE)) {
    console.error("\n❌ HTTPS certificate not available");
    console.error("   Install OpenSSL and retry");
    console.error("   Windows: https://slproweb.com/products/Win32OpenSSL.html");
    console.error("   Or use Git Bash: https://git-for-windows.github.io\n");
    process.exit(1);
  }

  const options = {
    key: readFileSync(KEY_FILE, 'utf8'),
    cert: readFileSync(CERT_FILE, 'utf8')
  };

  const server = https.createServer(options, handleRequest);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  SpectroCAP Receiver — HTTPS (TLS Encrypted)               ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    console.log(`Protocol:  HTTPS (Real TLS encryption)`);
    console.log(`Port:      ${PORT}`);
    console.log(`Health:    https://localhost:${PORT}/health`);
    console.log(`Ingest:    https://<LAN-IP>:${PORT}/ingest`);
    console.log(`Clip:      https://<LAN-IP>:${PORT}/clip/push|pull|clear`);
    console.log(`LAN IPs:   ${getLanIPs().join(", ") || "(none)"}`);
    console.log(`Uploads:   ${UPLOAD_DIR}`);
    console.log(`Clipboard: ${CLIP_FILE}`);
    console.log(`Cert:      ${CERT_FILE}`);
    console.log(`Key:       ${KEY_FILE}`);
    console.log(`\n✅ HTTPS ready. Import certificate on Android devices.\n`);
  });
}

start().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

