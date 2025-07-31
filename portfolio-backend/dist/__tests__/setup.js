"use strict";
/**
 * Jest setup file for backend tests
 *
 * This file runs before all tests and sets up the testing environment,
 * including environment variables, global mocks, and test utilities.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// Store original console methods for restoration
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
};
// Load test environment variables
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../../.env.test') });
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
        }
        else {
            return {
                message: () => `expected ${received} to be a valid portfolio with required fields`,
                pass: false,
            };
        }
    },
});
// Suppress console output during tests
beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.info = jest.fn();
});
// Restore console methods after each test
afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
});
// Clean up after all tests
afterAll(() => {
    // Clean up any test files or resources
});
//# sourceMappingURL=setup.js.map