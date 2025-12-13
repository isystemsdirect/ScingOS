import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const eslintConfigPath = path.join(root, 'eslint.config.cjs');

function sh(cmd) {
  console.log('\n$ ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

function writeFile(p, content) {
  fs.writeFileSync(p, content, 'utf8');
  console.log('Wrote', path.relative(root, p));
}

function ensureNodeProject() {
  const pkg = path.join(root, 'package.json');
  if (!fs.existsSync(pkg)) {
    console.log('No package.json found. Initializing npm project...');
    sh('npm init -y');
  }
}

function writeEslintConfig() {
  const content = `const tseslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Minimal canon-safe ruleset (structural sanity, not stylistic opinion)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'no-constant-condition': 'error',
      'no-unreachable': 'error',

      // Soft guardrail warnings (architecture rules enforced elsewhere)
      'no-loop-func': 'warn',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      'no-unused-vars': ['warn'],
    },
  },
]
`;
  writeFile(eslintConfigPath, content);
}

function installDeps() {
  // Keep minimal: eslint + TS parser/plugin only.
  sh('npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin');
}

function runEslint() {
  sh('npx eslint "scing/**/*.{ts,tsx}" "tools/**/*.{js,mjs}"');
}

try {
  console.log('[VSCI] Starting consolidated ESLint setup...\n');

  ensureNodeProject();
  writeEslintConfig();
  installDeps();
  runEslint();

  console.log('\n✅ ESLint setup complete and lint run finished.\n');
  console.log('Next (manual):');
  console.log('  git add eslint.config.cjs package.json package-lock.json');
  console.log('  git commit -m "chore: add minimal ESLint config"');
  console.log('  git push\n');
} catch (err) {
  console.error('\n❌ VSCI CB failed.\n');
  console.error(err);
  process.exit(1);
}
