import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';

import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, unicorn },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },

    linterOptions: {
      noInlineConfig: true,
    },

    // UNICORN PLUGIN
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            acc: true,
            env: true,
            i: true,
            j: true,
            props: true,
            Props: true,
            elem: true,
            params: true,
            btn: true,
          },
        },
      ],
    },
  },
  tseslint.configs.recommended,
  prettierConfig,
]);
