import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const baseRules = {
  ...tseslint.configs.recommended.rules,
  ...react.configs.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  'react/no-unescaped-entities': [
    'error',
    {
      forbid: [{ char: '"', alternatives: ['&quot;', '&ldquo;', '&rdquo;'] }],
    },
  ],
  'react-hooks/set-state-in-effect': 'warn',
  'react-hooks/purity': 'warn',
  'react-hooks/refs': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    },
  ],
};

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...baseRules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    files: ['src/**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'coverage/**',
      '.baseline/**',
    ],
  },
];
