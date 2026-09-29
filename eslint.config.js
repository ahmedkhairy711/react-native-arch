// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['node_modules/', 'dist/', '.expo/', 'android/', 'ios/', 'coverage/', 'src/core/generated/'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // Correctness
      '@typescript-eslint/no-floating-promises': 'error', // unhandled promise = silent bug
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      eqeqeq: ['error', 'always'],
      // Noisy false positives with libs exposing both default instance & named helpers (axios, i18next).
      'import/no-named-as-default-member': 'off',
      // Use `logger` (stripped/guarded in prod) instead of console.
      'no-console': 'error',
      // Consistent, grouped imports (auto-fixed).
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '@test/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    // Architecture boundaries: shared & core must not depend on features (DI container excepted).
    files: ['src/core/**', 'src/shared/**'],
    ignores: ['src/core/di/dependencies.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*', '@/app/*'], message: 'core/shared must not import features.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/app/*'], message: 'Features must not import routes.' }] },
      ],
    },
  },
  {
    files: ['*.js', '*.mjs', 'scripts/**'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/core/logger/logger.ts', 'src/core/network/http-logger.ts', 'scripts/**'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'test/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
]);
