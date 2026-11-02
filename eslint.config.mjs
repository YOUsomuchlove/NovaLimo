import nx from '@nx/eslint-plugin';

/**
 * Design-system guard: colours must come from libs/design-tokens, never raw hex.
 * Exported so per-project configs can re-append it last (nx flat/react overrides no-restricted-syntax).
 */
export const designTokenGuard = {
  // 'warn' while legacy screens are being rebuilt; flip to 'error' at the end of phase 4.
  // Globs are relative to whichever eslint.config.mjs is running (root or per-project).
  files: ['**/*.{ts,tsx}'],
  ignores: [
    '**/design-tokens/**',
    '**/*.spec.{ts,tsx}',
    '**/nova-limo-design-tokens.ts',
  ],
  rules: {
    'no-restricted-syntax': [
      'warn',
      'WithStatement',
      {
        selector:
          'Literal[value=/#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\\b/]',
        message:
          'Không dùng mã màu hex trực tiếp — dùng token từ libs/design-tokens.',
      },
      {
        selector:
          'TemplateElement[value.raw=/#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\\b/]',
        message:
          'Không dùng mã màu hex trực tiếp — dùng token từ libs/design-tokens.',
      },
    ],
  },
};

/**
 * Rules relaxed only while legacy screens still exist (they are rewritten in phases 3–5).
 * Remove this block once the rebuild of web-booking and app-driver is done.
 */
export const legacyOverrides = {
  files: ['**/*.{ts,tsx}'],
  rules: {
    'react-hooks/set-state-in-effect': 'warn',
  },
};

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/out-tsc',
      '**/.next',
      '**/.next/**',
      '**/.expo',
      '**/.expo/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  designTokenGuard,
];
