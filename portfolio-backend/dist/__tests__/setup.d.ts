/**
 * Jest setup file for backend tests
 *
 * This file runs before all tests and sets up the testing environment,
 * including environment variables, global mocks, and test utilities.
 */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidPortfolio(): R;
        }
    }
}
export {};
//# sourceMappingURL=setup.d.ts.map