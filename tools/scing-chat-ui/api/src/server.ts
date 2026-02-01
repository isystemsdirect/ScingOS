import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { z } from "zod";

const app = express();
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
]);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow same-origin/dev tools
    callback(null, allowedOrigins.has(origin));
  },
  methods: ["GET", "POST", "OPTIONS"],
}));
app.use(express.json({ limit: "1mb" }));

// Repo root is the parent of tools/scing-chat-ui
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const NOTES_DIR = path.join(REPO_ROOT, ".scing", "notes");

// Guardrails (keep simple + strict)
const DENY = [
  ".env", ".git", "node_modules", "secrets", ".keystore", ".p12"
];

function assertSafe(p: string) {
  const abs = path.resolve(p);
  if (!abs.startsWith(NOTES_DIR + path.sep) && abs !== NOTES_DIR) {
    throw new Error("Blocked: outside .scing/notes");
  }
  const rel = path.relative(NOTES_DIR, abs).replaceAll("\\\\", "/");
  for (const d of DENY) {
    if (rel.includes(d)) throw new Error("Blocked path segment: " + d);
  }
  return abs;
}

function listThreads() {
  if (!fs.existsSync(NOTES_DIR)) fs.mkdirSync(NOTES_DIR, { recursive: true });
  return fs.readdirSync(NOTES_DIR)
    .filter(f => f.startsWith("thread__") && f.endsWith(".jsonl"))
    .map(f => {
      const full = path.join(NOTES_DIR, f);
      const st = fs.statSync(full);
      return { name: f, bytes: st.size, mtime: st.mtime.toISOString() };
    })
    .sort((a,b) => (a.mtime < b.mtime ? 1 : -1));
}

app.get("/api/health", (_req, res) => res.json({ ok: true, repo: REPO_ROOT }));

// Simple test route to verify connectivity from UI
app.get("/api/test", (_req, res) => {
  res.status(200).json({ message: "API is connected and working!" });
});

// Alternate ping route
app.get("/api/ping", (_req, res) => {
  res.status(200).json({ pong: true });
});

app.get("/api/threads", (_req, res) => res.json({ threads: listThreads() }));

app.get("/api/thread/:name", (req, res) => {
  const name = req.params.name;
  const file = assertSafe(path.join(NOTES_DIR, name));
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Thread not found" });

  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw ? raw.split(/\r?\n/) : [];
  const msgs = lines.map((ln) => {
    try { return JSON.parse(ln); } catch { return { ts: "", from: "system", role: "note", topic: "parse_error", text: ln }; }
  });
  res.json({ name, messages: msgs });
});

app.post("/api/thread/:name/append", (req, res) => {
  const name = req.params.name;
  const schema = z.object({
    from: z.string().min(1).max(32),
    role: z.enum(["user","assistant","system","note"]),
    topic: z.string().min(1).max(64),
    text: z.string().min(1).max(8000),
    tags: z.array(z.string().min(1).max(24)).optional()
  });
  const body = schema.parse(req.body);

  const file = assertSafe(path.join(NOTES_DIR, name));
  if (!name.startsWith("thread__") || !name.endsWith(".jsonl")) {
    return res.status(400).json({ error: "Invalid thread name. Use thread__*.jsonl" });
  }

  const ts = new Date().toISOString();
  const lineObj = { ts, ...body };
  const line = JSON.stringify(lineObj);

  fs.mkdirSync(NOTES_DIR, { recursive: true });
  fs.appendFileSync(file, line + "\n", "utf8");

  res.json({ ok: true, appended: lineObj });
});

app.get("/api/search", (req, res) => {
  const qRaw = String(req.query.q ?? "").trim();
  const threadFilter = String(req.query.thread ?? "").trim();
  const limit = Math.max(1, Math.min(500, Number(req.query.limit ?? 80)));

  if (!qRaw) return res.json({ q: qRaw, results: [] });

  const q = qRaw.toLowerCase();
  const threads = listThreads()
    .map(t => t.name)
    .filter(n => !threadFilter || n === threadFilter);

  const results: any[] = [];
  for (const name of threads) {
    const file = assertSafe(path.join(NOTES_DIR, name));
    if (!fs.existsSync(file)) continue;

    const raw = fs.readFileSync(file, "utf8");
    const lines = raw ? raw.split(/\r?\n/) : [];

    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (!ln) continue;

      if (ln.toLowerCase().includes(q)) {
        let obj: any = null;
        try { obj = JSON.parse(ln); } catch { obj = { ts:"", from:"system", role:"note", topic:"parse_error", text: ln }; }

        const text = String(obj.text ?? "");
        const idx = text.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 60);
        const end = Math.min(text.length, idx + q.length + 120);
        const preview = (idx >= 0) ? (text.slice(start, end)) : text.slice(0, 180);

        results.push({
          thread: name,
          ts: obj.ts ?? "",
          from: obj.from ?? "",
          role: obj.role ?? "",
          topic: obj.topic ?? "",
          tags: obj.tags ?? [],
          preview,
          line: i + 1
        });

        if (results.length >= limit) break;
      }
    }

    if (results.length >= limit) break;
  }

  results.sort((a,b) => (String(a.ts) < String(b.ts) ? 1 : -1));

  res.json({ q: qRaw, thread: threadFilter || null, limit, results });
});

const PORT = Number(process.env.PORT ?? 3345);
app.listen(PORT, () => {
  console.log("SCING Chatbox API listening on http://localhost:" + PORT);
  console.log("Repo:", REPO_ROOT);
  console.log("Notes:", NOTES_DIR);
});
