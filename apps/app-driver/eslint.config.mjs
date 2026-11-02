import nx from '@nx/eslint-plugin';
import baseConfig, {
  designTokenGuard,
  legacyOverrides,
} from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  { ignores: ['.expo/**', 'metro.config.js', 'babel.config.js'] },
  designTokenGuard,
  legacyOverrides,
];
