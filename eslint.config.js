import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import onlyWarn from 'eslint-plugin-only-warn';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['.output/**', '.wxt/**', 'dist/**', 'node_modules/**'],
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'unused-imports/no-unused-imports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^next/'],
            ['^react(?!-)'],
            ['^(?!@/|next/|react(?!-))(\\w|@)'],
            ['^@arena/'],
            ['^@/'],
            ['^\\.'],
            ['^.+\\.(css|scss|png|jpg|gif)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-console': 'off',
      'no-empty': 'off',
      'no-constant-condition': 'off',
      'no-useless-escape': 'off',
      'no-sparse-arrays': 'off',
      'no-empty-pattern': 'off',
      'no-extra-boolean-cast': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
