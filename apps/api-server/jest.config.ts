export default {
  displayName: 'api-server',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/apps/api-server',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
