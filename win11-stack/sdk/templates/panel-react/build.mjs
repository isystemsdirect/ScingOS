import { rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';

const distDir = join(process.cwd(), 'dist');
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  outfile: join(distDir, 'app.js')
});

copyFileSync(join(process.cwd(), 'src/index.html'), join(distDir, 'index.html'));
