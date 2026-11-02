/* E2E tests: real Postgres/PostGIS via Testcontainers (Docker required). */
export default {
  displayName: 'api-server-e2e',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.e2e.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  testTimeout: 180_000,
  maxWorkers: 1,
};
