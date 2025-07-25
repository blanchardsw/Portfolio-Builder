/**
 * Jest setup file for backend tests
 * 
 * This file runs before all tests and sets up the testing environment,
 * including environment variables, global mocks, and test utilities.
 */

import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.join(__dirname, '../../.env.test') });

// Set default test environment variables if not provided
process.env.NODE_ENV = 'test';
process.env.OWNER_SECRET_KEY = 'test-secret-key';
process.env.GITHUB_URL = 'https://github.com/testuser';
process.env.LINKEDIN_URL = 'https://linkedin.com/in/testuser';
process.env.LINKEDIN_PHOTO_URL = 'https://example.com/test-photo.jpg';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  // Uncomment to silence console.log in tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidPortfolio(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidPortfolio(received) {
    const pass = received &&
      typeof received === 'object' &&
      received.personalInfo &&
      Array.isArray(received.workExperience) &&
      Array.isArray(received.education) &&
      Array.isArray(received.skills) &&
      Array.isArray(received.projects);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid portfolio`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid portfolio with required fields`,
        pass: false,
      };
    }
  },
});

// Clean up after all tests
afterAll(() => {
  // Clean up any test files or resources
});
