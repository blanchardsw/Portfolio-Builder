"use strict";
/**
 * Minimal test to verify Jest environment is working
 */
describe('Minimal Test Suite', () => {
    it('should pass a basic test', () => {
        expect(1 + 1).toBe(2);
    });
    it('should handle async operations', async () => {
        const result = await Promise.resolve('test');
        expect(result).toBe('test');
    });
    it('should handle environment variables', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });
});
//# sourceMappingURL=minimal.test.js.map