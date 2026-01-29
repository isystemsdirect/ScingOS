import http from "http";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import os from "os";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8088;
const UPLOAD_DIR = join(process.cwd(), "uploads");
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

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
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true, ts: Date.now(), port: PORT, ips: getLanIPs() });
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

  send(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Spectrocap Receiver running");
  console.log(`  Health:  http://localhost:${PORT}/health`);
  console.log(`  Ingest:  http://<LAN-IP>:${PORT}/ingest`);
  console.log(`  LAN IPs: ${getLanIPs().join(", ") || "(none)"}`);
  console.log(`  Uploads: ${UPLOAD_DIR}`);
});
