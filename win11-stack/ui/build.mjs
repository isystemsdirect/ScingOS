import { mkdirSync, rmSync, copyFileSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';

const distDir = join(process.cwd(), 'dist');
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  outfile: join(distDir, 'app.js')
});

copyFileSync(join(process.cwd(), 'src/index.html'), join(distDir, 'index.html'));

const assetsSrcDir = join(process.cwd(), 'src/assets');
const assetsDistDir = join(distDir, 'assets');
if (existsSync(assetsSrcDir)) {
  mkdirSync(assetsDistDir, { recursive: true });
  cpSync(assetsSrcDir, assetsDistDir, { recursive: true });
}

// Copy shell splash so MSI-built UI always includes it.
// (Phase 6 gate rebuilds UI from this script and wipes dist/ each time.)
const splashSrcDir = join(process.cwd(), '../shell/Scing.Emulator.Shell/src/splash');
const splashDistDir = join(distDir, 'splash');
if (existsSync(splashSrcDir)) {
  mkdirSync(splashDistDir, { recursive: true });
  cpSync(splashSrcDir, splashDistDir, { recursive: true });
}
