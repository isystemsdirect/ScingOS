module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { es2021: true, node: true, browser: true },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' }
    }
  ]
};
