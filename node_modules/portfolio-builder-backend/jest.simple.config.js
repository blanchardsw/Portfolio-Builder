/**
 * Simplified Jest configuration to bypass hanging issues
 * Minimal setup for Railway deployment
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 10000,
  verbose: false,
  collectCoverage: false, // Disable coverage to avoid hanging
  passWithNoTests: true,
  forceExit: true, // Force Jest to exit after tests
  detectOpenHandles: true, // Help identify hanging handles
};
