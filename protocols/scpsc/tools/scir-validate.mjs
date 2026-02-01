import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaPath = path.join(process.cwd(), "spec", "scls", "schemas", "scir.schema.json");
const vectorsDir = path.join(process.cwd(), "test", "vectors", "scir");
const evidenceDir = path.join(process.cwd(), ".evidence", "scir");

if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8"); }

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(readJson(schemaPath));

const vectors = fs.readdirSync(vectorsDir)
  .filter(f => f.endsWith(".json") && !f.endsWith(".expect.json"))
  .sort();

let mismatches = 0;
for (const file of vectors) {
  const data = readJson(path.join(vectorsDir, file));
  const expectPath = path.join(vectorsDir, file.replace(/\.json$/, ".expect.json"));
  const expected = fs.existsSync(expectPath) ? (readJson(expectPath).expect) : (file.startsWith("negative.") ? "fail" : "pass");
  const ok = validate(data);
  const match = expected === "pass" ? Boolean(ok) : !Boolean(ok);

  const entry = {
    vector: `test/vectors/scir/${file}`,
    expected,
    pass: Boolean(ok),
    match,
    errors: ok ? [] : (validate.errors ?? []).map(e => ({ instancePath: e.instancePath, message: e.message }))
  };
  writeJson(path.join(evidenceDir, file.replace(/\.json$/, ".evidence.json")), entry);
  if (!match) mismatches++;
}

if (mismatches > 0) process.exit(1);
