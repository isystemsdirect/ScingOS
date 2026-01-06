import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const pkgDir = process.cwd();
const coreVersionPath = join(pkgDir, '..', '..', '..', 'core', 'version.json');
const core = JSON.parse(readFileSync(coreVersionPath, 'utf8'));

mkdirSync(join(pkgDir, 'src'), { recursive: true });
writeFileSync(
  join(pkgDir, 'src', 'generated.ts'),
  `export const CORE_VERSION = ${JSON.stringify(core.version)} as const;\n` +
    `export const CORE_PRODUCT = ${JSON.stringify(core.product)} as const;\n` +
    `export const CORE_CHANNEL = ${JSON.stringify(core.channel)} as const;\n`,
  'utf8'
);

execSync('npx.cmd --yes tsc -p tsconfig.json', { stdio: 'inherit' });
