const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    files: ['src/**/*.ts', 'src/**/*.js', '**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: importPlugin,
    },
    rules: {
      // Recommended rules
      ...typescriptEslint.configs.recommended.rules,
      
      // Custom quote style
      quotes: ['error', 'single'],
      
      // Indentation
      indent: ['error', 2],
      
      // Line length
      'max-len': ['error', { code: 100 }],
      
      // Object spacing
      'object-curly-spacing': ['error', 'always'],
      
      // Disable JSDoc requirement
      'require-jsdoc': 'off',
      
      // Import rules
      'import/no-unresolved': 'off',
      
      // Handle unused vars with underscore prefix support
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    ignores: ['lib/**/*', 'node_modules/**/*'],
  },
];
