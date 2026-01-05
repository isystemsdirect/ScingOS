import { spawnSync } from 'node:child_process';

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith('-')) return null;
  return v;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const phase = argValue('--phase');
const msg = argValue('--msg');

if (!phase) {
  console.error('Missing --phase (e.g. LFCB-10)');
  process.exit(2);
}

const commitMsg = msg || `${phase}: ship`;

run('git', ['status']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', commitMsg]);
run('git', ['push']);
