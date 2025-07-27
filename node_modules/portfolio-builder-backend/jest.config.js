/**
 * Optimized Jest configuration for better performance and stability
 * Fixed hanging issues and improved test execution speed
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest'
  },
  
  // Coverage settings - only collect when explicitly requested
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  
  // Performance improvements
  maxWorkers: '50%',           // Use half of available CPU cores
  testTimeout: 30000,          // Increase timeout to 30 seconds
  
  // Stability improvements
  forceExit: false,           // Let tests exit naturally
  detectOpenHandles: false,   // Disable for cleaner output
  
  // Debugging and output
  verbose: true,              // Show detailed test output
  clearMocks: true,
  passWithNoTests: true,
  
  // Suppress console output during tests
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Coverage thresholds (only applied when coverage is collected)
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
