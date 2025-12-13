const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    files: ['**/*.js', '**/*.ts'],
    ignores: ['.eslintrc.js', 'eslint.config.cjs', 'node_modules/**', '/lib/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      'quotes': ['error', 'single'],
      'import/no-unresolved': 0,
      'indent': ['error', 2],
      'max-len': ['error', { code: 100 }],
      'object-curly-spacing': ['error', 'always'],
      'require-jsdoc': 0,
    },
  },
];
