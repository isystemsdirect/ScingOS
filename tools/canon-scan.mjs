import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const TARGET_DIR = path.join(root, 'scing');

const RULES = [
  {
    name: 'Deterministic seeding (seeded RNG / explicit seeds)',
    pattern: /seedrandom\s*\(|Math\.seed|setSeed\s*\(|\bseed\s*[:=]/i,
    scope: /scing[\\\/]srt/,
  },
  {
    name: 'Loop ownership in SRT (timing must be external)',
    pattern: /requestAnimationFrame\s*\(|setInterval\s*\(|setTimeout\s*\(/i,
    scope: /scing[\\\/]srt/,
  },
  {
    name: 'Replay / timeline / keyframe constructs in SRT',
    pattern:
      /\breplay\b|\btimeline\b|\bkeyframe\b|\bplayback\b|frameBuffer|bufferedFrame|recordFrame|captureFrame/i,
    scope: /scing[\\\/]srt/,
  },
  {
    name: 'State machine indicators in SRT',
    pattern: /stateMachine|currentState|nextState|\bFSM\b/i,
    scope: /scing[\\\/]srt/,
  },
];

let violations = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && /\.(ts|js|mjs)$/.test(e.name)) scanFile(p);
  }
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
}

function scanFile(file) {
  const rel = path.relative(root, file);
  let content = fs.readFileSync(file, 'utf8');
  content = stripComments(content);

  for (const rule of RULES) {
    if (!rule.scope.test(rel)) continue;
    if (rule.pattern.test(content)) {
      violations.push({ file: rel, rule: rule.name });
    }
  }
}

console.log('\n[SCING] Canon scan started...\n');

if (!fs.existsSync(TARGET_DIR)) {
  console.error('❌ canon-scan: ./scing directory not found.');
  process.exit(1);
}

walk(TARGET_DIR);

if (violations.length) {
  console.error('❌ CANON VIOLATIONS DETECTED:\n');
  for (const v of violations) {
    console.error(' - ' + v.rule + ' → ' + v.file);
  }
  console.error('\nBuild halted. Fix violations to restore canon compliance.\n');
  process.exit(1);
}

console.log('✅ Canon scan passed. No violations found.\n');
