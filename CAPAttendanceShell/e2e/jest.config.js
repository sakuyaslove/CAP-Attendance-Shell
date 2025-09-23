module.exports = {
  testRunner: 'jest-circus/runner',
  testTimeout: 120000,
  testMatch: ['**/?(*.)+(e2e).[tj]s?(x)'],
  setupFilesAfterEnv: ['./setup.ts'],
};
