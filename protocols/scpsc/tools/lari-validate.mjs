/**
 * SCPSC LARI Intent Conformance Validator (Ultra-Grade™)
 * Validates test/vectors/lari/*.json against spec/schemas/lari.intent.schema.json
 * Emits evidence artifacts to .evidence/lari/*
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const schemaPath = path.join(root, "spec", "schemas", "lari.intent.schema.json");
const vectorsDir = path.join(root, "test", "vectors", "lari");
const evidenceDir = path.join(root, ".evidence", "lari");

const clean = process.argv.includes("--clean");
if (clean && fs.existsSync(evidenceDir)) {
  for (const f of fs.readdirSync(evidenceDir)) fs.rmSync(path.join(evidenceDir, f), { force: true });
}

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8"); }
function writeText(p, s) { fs.writeFileSync(p, s, "utf8"); }
const nowIso = () => new Date().toISOString();

const schema = readJson(schemaPath);
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const vectors = fs
  .readdirSync(vectorsDir)
  .filter(f => f.endsWith(".json") && !f.endsWith(".expect.json"))
  .sort();
if (vectors.length === 0) { console.error("No vectors found:", vectorsDir); process.exit(2); }

const report = { tool: "scpsc-lari-validate", version: "1.0", timestamp: nowIso(), schema: "spec/schemas/lari.intent.schema.json", results: [], summary: { total: 0, pass: 0, fail: 0 } };

for (const file of vectors) {
  const p = path.join(vectorsDir, file);
  const data = readJson(p);
  const ok = validate(data);

  const expectPath = p.replace(/\.json$/, ".expect.json");
  const expectObj = fs.existsSync(expectPath)
    ? readJson(expectPath)
    : { expect: file.startsWith("negative.") ? "fail" : "pass" };
  const expected = expectObj.expect;

  const entry = {
    vector: `test/vectors/lari/${file}`,
    expected,
    pass: Boolean(ok),
    match: expected === "pass" ? Boolean(ok) : !Boolean(ok),
    errors: ok ? [] : (validate.errors ?? []).map(e => ({
      instancePath: e.instancePath, schemaPath: e.schemaPath, keyword: e.keyword, message: e.message, params: e.params
    })),
  };
  report.results.push(entry);
  report.summary.total++;
  if (entry.match) report.summary.pass++; else report.summary.fail++;
  writeJson(path.join(evidenceDir, file.replace(".json", ".evidence.json")), entry);
}

writeJson(path.join(evidenceDir, "lari.intent.conformance.report.json"), report);

const human =
  `SCPSC LARI Intent Conformance Report\nGenerated: ${report.timestamp}\nSchema: ${report.schema}\nVectors: ${report.summary.total}\n\n` +
  report.results.map(r => `${r.match ? "PASS" : "FAIL"}  ${r.vector}` + (r.match ? "" : `\n  - ` + r.errors.map(e => `${e.instancePath || "/"}: ${e.message}`).join("\n  - "))).join("\n") +
  `\n\nSummary: ${report.summary.pass} pass / ${report.summary.fail} fail / ${report.summary.total} total\n`;

writeText(path.join(evidenceDir, "lari.intent.conformance.report.txt"), human);

if (report.summary.fail > 0) { console.error(human); process.exit(1); }
console.log(human);
