import nx from '@nx/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import baseConfig, {
  designTokenGuard,
  legacyOverrides,
} from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // App Router only — this rule looks for a pages/ directory.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  { ignores: ['.next/**', 'next-env.d.ts'] },
  designTokenGuard,
  legacyOverrides,
];
