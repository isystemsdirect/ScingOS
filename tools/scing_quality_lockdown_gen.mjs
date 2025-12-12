import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(rel, content) {
  const abs = path.join(root, rel);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, content, 'utf8');
  console.log('Wrote', rel);
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readJson(rel) {
  const abs = path.join(root, rel);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

function writeJson(rel, obj) {
  const abs = path.join(root, rel);
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('Wrote', rel);
}

/* ============================================================
   1) CANON SCAN (HARDENED)
============================================================ */
write(
  'tools/canon-scan.mjs',
  `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const TARGET_DIR = path.join(root, "scing");

const RULES = [
  {
    name: "Deterministic seeding (seeded RNG / explicit seeds)",
    pattern: /seedrandom\\s*\\(|Math\\.seed|setSeed\\s*\\(|\\bseed\\s*[:=]/i,
    scope: /scing[\\\\\\/]srt/,
  },
  {
    name: "Loop ownership in SRT (timing must be external)",
    pattern: /requestAnimationFrame\\s*\\(|setInterval\\s*\\(|setTimeout\\s*\\(/i,
    scope: /scing[\\\\\\/]srt/,
  },
  {
    name: "Replay / timeline / keyframe constructs in SRT",
    pattern:
      /\\breplay\\b|\\btimeline\\b|\\bkeyframe\\b|\\bplayback\\b|frameBuffer|bufferedFrame|recordFrame|captureFrame/i,
    scope: /scing[\\\\\\/]srt/,
  },
  {
    name: "State machine indicators in SRT",
    pattern: /stateMachine|currentState|nextState|\\bFSM\\b/i,
    scope: /scing[\\\\\\/]srt/,
  },
];

let violations = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && /\\.(ts|js|mjs)$/.test(e.name)) scanFile(p);
  }
}

function stripComments(src) {
  return src
    .replace(/\/\\*[\s\\S]*?\\*\//g, "")
    .replace(/(^|\\s)\\/\\/.*$/gm, "$1");
}

function scanFile(file) {
  const rel = path.relative(root, file);
  let content = fs.readFileSync(file, "utf8");
  content = stripComments(content);

  for (const rule of RULES) {
    if (!rule.scope.test(rel)) continue;
    if (rule.pattern.test(content)) {
      violations.push({ file: rel, rule: rule.name });
    }
  }
}

console.log("\\n[SCING] Canon scan started...\\n");

if (!fs.existsSync(TARGET_DIR)) {
  console.error("❌ canon-scan: ./scing directory not found.");
  process.exit(1);
}

walk(TARGET_DIR);

if (violations.length) {
  console.error("❌ CANON VIOLATIONS DETECTED:\\n");
  for (const v of violations) {
    console.error(' - ' + v.rule + ' → ' + v.file);
  }
  console.error("\\nBuild halted. Fix violations to restore canon compliance.\\n");
  process.exit(1);
}

console.log("✅ Canon scan passed. No violations found.\\n");
`
);

/* ============================================================
   2) GITHUB ACTIONS CI WORKFLOW
============================================================ */
write(
  '.github/workflows/scing-quality.yml',
  `name: scing-quality

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Typecheck scing (isolated)
        run: npx -y tsc -p tools/tmp-tsconfig.json

      - name: Lint scing + tools
        run: npx eslint "scing/**/*.{ts,tsx}" "tools/**/*.{js,mjs}" --max-warnings=0

      - name: Canon scan
        run: node tools/canon-scan.mjs

      - name: Prettier check (optional)
        run: |
          if npx --no -- prettier -v >/dev/null 2>&1; then
            npx prettier --check "scing/**/*.{ts,tsx,js,mjs,json,md}" "tools/**/*.{js,mjs,json,md}"
          else
            echo "prettier not installed; skipping"
          fi
`
);

/* ============================================================
   3) PACKAGE.JSON SCRIPTS (NON-DESTRUCTIVE MERGE)
============================================================ */
if (exists('package.json')) {
  const pkg = readJson('package.json');
  pkg.scripts = pkg.scripts || {};

  pkg.scripts['typecheck:scing'] = 'npx -y tsc -p tools/tmp-tsconfig.json';
  pkg.scripts['lint:scing'] =
    'npx eslint "scing/**/*.{ts,tsx}" "tools/**/*.{js,mjs}" --max-warnings=0';
  pkg.scripts['canon:scan'] = 'node tools/canon-scan.mjs';
  pkg.scripts['format:check'] =
    'npx prettier --check "scing/**/*.{ts,tsx,js,mjs,json,md}" "tools/**/*.{js,mjs,json,md}"';
  pkg.scripts['quality:scing'] =
    'npm run typecheck:scing && npm run lint:scing && npm run canon:scan && npm run format:check';

  writeJson('package.json', pkg);
} else {
  console.warn('WARN: package.json not found; skipping script injection.');
}

/* ============================================================
   4) CONTRIBUTING GUARDRAILS (PR DISCIPLINE)
============================================================ */
const contributingPath = 'CONTRIBUTING.md';
const contributing = `# Contributing

## Guardrails

### Changes under \`scing/**\`
Treat \`scing/**\` as canon-bound implementation.

Required before merging changes:
- \`npm run typecheck:scing\`
- \`npm run lint:scing\`
- \`npm run canon:scan\`
- \`npm run format:check\`

### Discipline
- Avoid deterministic seeding inside \`scing/srt/**\`.
- Avoid timing ownership (intervals / animation frames) inside \`scing/srt/**\`.
- Avoid replay/timeline/keyframe constructs inside \`scing/srt/**\`.
- Prefer continuous modulation over state machines.

## Local quality
Run the full gate locally: npm run quality:scing
`;

if (!exists(contributingPath)) {
  write(contributingPath, contributing);
} else {
  const cur = fs.readFileSync(path.join(root, contributingPath), 'utf8');
  if (!cur.includes('Changes under `scing/**`')) {
    write(contributingPath, cur.trimEnd() + '\n\n' + contributing);
  } else {
    console.log('Skipped CONTRIBUTING.md (already contains scing guardrails)');
  }
}

/* ============================================================
   DONE
============================================================ */
console.log(
  `\n✅ Consolidated quality + canon + CI lockdown applied.\n\nNext (run locally):\n  npm run quality:scing\n\nThen commit:\n  git add tools/canon-scan.mjs .github/workflows/scing-quality.yml package.json CONTRIBUTING.md\n  git commit -m "chore: lock scing quality gates (typecheck/lint/canon/format) + CI"\n  git push\n`
);
