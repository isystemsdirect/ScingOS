#!/usr/bin/env node

/**
 * Generates a CI-parity-ish quality gate transcript.
 *
 * Note: This script does not attempt to fix local environment problems (e.g. Node engine mismatch).
 * It captures outputs exactly as observed on the machine running it.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const outPath = path.join(repoRoot, 'docs', '_export_notes', 'quality-gate-latest.md');

const npmCmd = (() => {
  if (process.platform !== 'win32') return 'npm';
  // Using the absolute path avoids PATH and PATHEXT edge cases when running under VS Code.
  return path.join(path.dirname(process.execPath), 'npm.cmd');
})();

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

function run(cmd, args, cwd, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const cmdToRun = cmd === 'npm.cmd' ? npmCmd : cmd;

  const shellQuote = (s) => {
    const text = String(s);
    if (process.platform !== 'win32') return text;
    // Minimal cmd.exe quoting: wrap if whitespace/specials; escape embedded quotes.
    if (!/[\s&|<>^]/.test(text)) return text;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const commandLine = [cmdToRun, ...args].map(shellQuote).join(' ');
  // On Windows, many dev tools are `.cmd` shims; using `shell: true` makes execution reliable.
  const res = spawnSync(commandLine, {
    cwd,
    encoding: 'utf8',
    shell: true,
    timeout: timeoutMs,
  });
  return {
    cmd: [cmd, ...args].join(' '),
    cwd,
    status: res.status,
    signal: res.signal,
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    error: res.error
      ? String(
          [res.error.code, res.error.message].filter(Boolean).join(': ') || String(res.error)
        )
      : null,
  };
}

function mdEscapeFence(s) {
  // Ensure we don't break fenced blocks.
  return String(s).replace(/```/g, '``\u0060');
}

function section(title) {
  return `\n## ${title}\n`;
}

function block(label, text) {
  const body = mdEscapeFence(text).trimEnd();
  return `\n**${label}**\n\n\u0060\u0060\u0060\n${body}\n\u0060\u0060\u0060\n`;
}

function commandBlock(r) {
  const combined = `${r.stdout}${r.stderr ? (r.stdout ? '\n' : '') + r.stderr : ''}`;
  return (
    `\n### ${r.cmd}\n` +
    `- cwd: ${r.cwd}\n` +
    `- exit: ${r.status}${r.signal ? ` (signal: ${r.signal})` : ''}\n` +
    (r.error ? `- error: ${r.error}\n` : '') +
    block('output', combined || '(no output)')
  );
}

function main() {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const continueOnFailure = process.argv.includes('--full') || process.argv.includes('--continue');

  const append = (text) => {
    fs.appendFileSync(outPath, text, 'utf8');
  };

  fs.writeFileSync(outPath, '', 'utf8');

  append('# ScingOS quality gate run (local transcript)\n\n');
  append(`**Timestamp (local):** ${new Date().toISOString()}\n`);
  append(`**Repo:** ${repoRoot}\n`);

  append(section('Versions'));
  append(commandBlock(run('node', ['--version'], repoRoot)));
  append(commandBlock(run('npm.cmd', ['--version'], repoRoot)));
  append(commandBlock(run('npm.cmd', ['config', 'get', 'engine-strict'], repoRoot)));

  append(section('Git'));
  append(commandBlock(run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], repoRoot)));
  append(commandBlock(run('git', ['rev-parse', 'HEAD'], repoRoot)));
  append(commandBlock(run('git', ['status', '--porcelain=v1'], repoRoot)));

  const steps = [
    { title: 'Root: npm ci', cmd: 'npm.cmd', args: ['ci'], cwd: repoRoot },
    { title: 'Root: npm run format:check', cmd: 'npm.cmd', args: ['run', 'format:check'], cwd: repoRoot },
    { title: 'Root: npm run quality:scing', cmd: 'npm.cmd', args: ['run', 'quality:scing'], cwd: repoRoot },
    { title: 'Root: npm run build', cmd: 'npm.cmd', args: ['run', 'build'], cwd: repoRoot },

    { title: 'Client: npm ci', cmd: 'npm.cmd', args: ['ci', '--prefix', 'client'], cwd: repoRoot },
    { title: 'Client: npm run lint', cmd: 'npm.cmd', args: ['run', 'lint', '--prefix', 'client'], cwd: repoRoot },
    { title: 'Client: npm run type-check', cmd: 'npm.cmd', args: ['run', 'type-check', '--prefix', 'client'], cwd: repoRoot },
    { title: 'Client: npm test -- --coverage', cmd: 'npm.cmd', args: ['test', '--prefix', 'client', '--', '--coverage'], cwd: repoRoot },

    { title: 'Functions: npm ci', cmd: 'npm.cmd', args: ['ci', '--prefix', 'cloud/functions'], cwd: repoRoot },
    { title: 'Functions: npm run lint', cmd: 'npm.cmd', args: ['run', 'lint', '--prefix', 'cloud/functions'], cwd: repoRoot },
    { title: 'Functions: npm run build', cmd: 'npm.cmd', args: ['run', 'build', '--prefix', 'cloud/functions'], cwd: repoRoot },
    { title: 'Functions: npm test', cmd: 'npm.cmd', args: ['test', '--prefix', 'cloud/functions'], cwd: repoRoot },
  ];

  for (const s of steps) {
    append(section(s.title));
    const result = run(s.cmd, s.args, s.cwd);
    append(commandBlock(result));

    if (!continueOnFailure && result.status !== 0) {
      append('\n> Stopped early: first failing step (run with `--full` to continue).\n');
      break;
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

main();
