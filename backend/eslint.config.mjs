// eslint.config.mjs
import globals from 'globals';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  // Глобальные игноры
  {
    ignores: [
      'node_modules',
      'build',
      'dist',
      '**/*.test.ts',
      '**/*.test.js',
      '**/migrations/**',
      'eslint.config.mjs',
      'jest.config.js',
    ],
  },

  // Базовый JS-конфиг (flat) без .rules
  js.configs.recommended,

  // TypeScript-конфиг (не используем tsPlugin.configs.*)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // для @typescript-eslint v8 + flat config
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier,
    },
    rules: {
      // полностью выключаем встроенное eslint-правило
      'no-unused-vars': ['off', { argsIgnorePattern: '^_' }],

      allowEmptyCatch: 'true',

      // и его TS-аналог (можно off или настроить)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      '@typescript-eslint/no-explicit-any': ['off', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-debugger': 'warn',
      eqeqeq: 'error',
      'prettier/prettier': 'error',
    },
  },

  // Для тестов
  {
    files: ['**/*.test.{ts,js}'],
    rules: {
      'no-console': 'off',
    },
  },
];
