import { spawnSync } from 'node:child_process';

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run('node', ['-e', "console.log('OBS_SMOKE_LOCAL_OK')"]);
