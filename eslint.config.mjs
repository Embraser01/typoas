// @ts-check
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';

/**
 * @type {import("eslint").FlatConfig[]}
 */
const config = [
  {
    ignores: [
      '.idea',
      '.yarn',
      '.pnp.cjs',
      '.pnp.loader.mjs',
      'examples/src/',
      '**/dist/',
      'packages/typoas-react-query/src/__tests__/sample-client.ts',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
      },
    },
  },
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/__tests__/**/*'],
    ...vitest.configs.recommended,
  },
];

export default config;
