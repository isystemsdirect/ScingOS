/**
 * SCPSC Envelope Conformance Validator (Ultra-Grade™)
 * - Validates vectors against spec/schemas/envelope.schema.json
 * - Emits evidence artifacts to .evidence/envelope/*
 * - Produces stable, inspectable output for auditors and CI
 *
 * Usage:
 *   node tools/envelope-validate.mjs
 *   node tools/envelope-validate.mjs --clean
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const schemaPath = path.join(root, "spec", "schemas", "envelope.schema.json");
const vectorsDir = path.join(root, "test", "vectors", "envelope");
const evidenceDir = path.join(root, ".evidence", "envelope");

const clean = process.argv.includes("--clean");
if (clean && fs.existsSync(evidenceDir)) {
  for (const f of fs.readdirSync(evidenceDir)) fs.rmSync(path.join(evidenceDir, f), { force: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeText(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

const schema = readJson(schemaPath);
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);

const validate = ajv.compile(schema);

const vectors = fs.readdirSync(vectorsDir).filter(f => f.endsWith(".json")).sort();
if (vectors.length === 0) {
  console.error("No vectors found in:", vectorsDir);
  process.exit(2);
}

const report = {
  scpsc: {
    tool: "scpsc-envelope-validate",
    version: "1.0",
    timestamp: nowIso(),
  },
  schema: {
    path: "spec/schemas/envelope.schema.json",
    $id: schema.$id ?? null,
    title: schema.title ?? null,
  },
  results: [],
  summary: {
    total: 0,
    pass: 0,
    fail: 0,
  },
};

for (const file of vectors) {
  const p = path.join(vectorsDir, file);
  const data = readJson(p);

  const ok = validate(data);
  const entry = {
    vector: `test/vectors/envelope/${file}`,
    pass: Boolean(ok),
    errors: ok ? [] : (validate.errors ?? []).map(e => ({
      instancePath: e.instancePath,
      schemaPath: e.schemaPath,
      keyword: e.keyword,
      message: e.message,
      params: e.params,
    })),
  };

  report.results.push(entry);
  report.summary.total += 1;
  if (entry.pass) report.summary.pass += 1;
  else report.summary.fail += 1;

  // Per-vector evidence artifact
  writeJson(path.join(evidenceDir, file.replace(".json", ".evidence.json")), entry);
}

writeJson(path.join(evidenceDir, "envelope.conformance.report.json"), report);

const human =
  `SCPSC Envelope Conformance Report\n` +
  `Generated: ${report.scpsc.timestamp}\n` +
  `Schema: ${report.schema.path}\n` +
  `Vectors: ${vectors.length}\n\n` +
  report.results.map(r =>
    `${r.pass ? "PASS" : "FAIL"}  ${r.vector}` +
    (r.pass ? "" : `\n  - ` + r.errors.map(e => `${e.instancePath || "/"}: ${e.message}`).join("\n  - "))
  ).join("\n") +
  `\n\nSummary: ${report.summary.pass} pass / ${report.summary.fail} fail / ${report.summary.total} total\n`;

writeText(path.join(evidenceDir, "envelope.conformance.report.txt"), human);

if (report.summary.fail > 0) {
  console.error(human);
  process.exit(1);
}

console.log(human);
