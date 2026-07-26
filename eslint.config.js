import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage', 'build']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    rules: {
      /****************************/
      /* TypeScript Rules */
      /****************************/

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unused-expressions': 'error',

      '@typescript-eslint/no-empty-function': 'warn',

      '@typescript-eslint/no-inferrable-types': 'off',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],

      /****************************/
      /* JavaScript Rules */
      /****************************/

      'prefer-const': 'error',

      'no-var': 'error',

      eqeqeq: ['error', 'always'],

      'no-debugger': 'error',

      'no-alert': 'warn',

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'no-duplicate-imports': 'error',

      'no-unreachable': 'error',

      'no-shadow': 'off',

      /****************************/
      /* React Hooks */
      /****************************/

      'react-hooks/exhaustive-deps': 'warn',

      // False positives bahut aate hain
      'react-hooks/set-state-in-effect': 'off',

      // React 19 compiler rule
      'react-hooks/refs': 'off',

      /****************************/
      /* React Refresh */
      /****************************/

      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
    },
  },
]);
