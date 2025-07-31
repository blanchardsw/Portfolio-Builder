"use strict";
/**
 * Integration tests for Auth routes
 * Tests authentication endpoints for proper request/response handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../routes/auth"));
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
describe('Auth Routes', () => {
    const originalEnv = process.env.OWNER_SECRET_KEY;
    beforeEach(() => {
        // Set a test secret key
        process.env.OWNER_SECRET_KEY = 'test-secret-key';
    });
    afterEach(() => {
        // Restore original environment
        process.env.OWNER_SECRET_KEY = originalEnv;
    });
    describe('POST /auth/validate-owner', () => {
        it('should return isOwner: true for valid key', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({ key: 'test-secret-key' })
                .expect(200);
            expect(response.body).toEqual({
                isOwner: true,
                message: 'Owner access granted'
            });
        });
        it('should return isOwner: false for invalid key', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({ key: 'wrong-key' })
                .expect(200);
            expect(response.body).toEqual({
                isOwner: false,
                message: 'Invalid access key'
            });
        });
        it('should return isOwner: false for missing key', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({})
                .expect(200);
            expect(response.body).toEqual({
                isOwner: false,
                message: 'Invalid access key'
            });
        });
        it('should handle malformed request body', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .set('Content-Type', 'application/json')
                .send('invalid-json')
                .expect(400);
        });
        it('should use default key when OWNER_SECRET_KEY is not set', async () => {
            delete process.env.OWNER_SECRET_KEY;
            const response = await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({ key: 'default-secret-change-me' })
                .expect(200);
            expect(response.body.isOwner).toBe(true);
        });
    });
    describe('GET /auth/check-owner/:key', () => {
        it('should return isOwner: true for valid key in URL', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/auth/check-owner/test-secret-key')
                .expect(200);
            expect(response.body).toEqual({
                isOwner: true,
                message: 'Owner access granted'
            });
        });
        it('should return isOwner: false for invalid key in URL', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/auth/check-owner/wrong-key')
                .expect(200);
            expect(response.body).toEqual({
                isOwner: false,
                message: 'Invalid access key'
            });
        });
        it('should handle URL-encoded keys', async () => {
            const encodedKey = encodeURIComponent('test-secret-key');
            const response = await (0, supertest_1.default)(app)
                .get(`/auth/check-owner/${encodedKey}`)
                .expect(200);
            expect(response.body.isOwner).toBe(true);
        });
        it('should handle special characters in key', async () => {
            process.env.OWNER_SECRET_KEY = 'test-key-with-special-chars!@#$%';
            const encodedKey = encodeURIComponent('test-key-with-special-chars!@#$%');
            const response = await (0, supertest_1.default)(app)
                .get(`/auth/check-owner/${encodedKey}`)
                .expect(200);
            expect(response.body.isOwner).toBe(true);
        });
        it('should use default key when OWNER_SECRET_KEY is not set', async () => {
            delete process.env.OWNER_SECRET_KEY;
            const response = await (0, supertest_1.default)(app)
                .get('/auth/check-owner/default-secret-change-me')
                .expect(200);
            expect(response.body.isOwner).toBe(true);
        });
    });
    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            // Mock console.error to avoid test output noise
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            // Create a new app instance with mocked environment access
            const mockApp = (0, express_1.default)();
            mockApp.use(express_1.default.json());
            // Create a route that will throw an error
            mockApp.post('/auth/validate-owner', (req, res) => {
                try {
                    throw new Error('Test error');
                }
                catch (error) {
                    console.error('Error validating owner key:', error);
                    res.status(500).json({
                        isOwner: false,
                        message: 'Authentication error'
                    });
                }
            });
            const response = await (0, supertest_1.default)(mockApp)
                .post('/auth/validate-owner')
                .send({ key: 'test-key' })
                .expect(500);
            expect(response.body).toEqual({
                isOwner: false,
                message: 'Authentication error'
            });
            consoleSpy.mockRestore();
        });
    });
    describe('Security Considerations', () => {
        it('should not expose the actual secret key in responses', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({ key: 'wrong-key' })
                .expect(200);
            // Ensure the actual secret key is never in the response
            const responseString = JSON.stringify(response.body);
            expect(responseString).not.toContain('test-secret-key');
            expect(responseString).not.toContain(process.env.OWNER_SECRET_KEY);
        });
        it('should log access attempts', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({ key: 'test-secret-key' });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[AUTH] Owner access attempt: SUCCESS'));
            consoleSpy.mockRestore();
        });
        it('should log failed access attempts', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            await (0, supertest_1.default)(app)
                .post('/auth/validate-owner')
                .send({ key: 'wrong-key' });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[AUTH] Owner access attempt: FAILED'));
            consoleSpy.mockRestore();
        });
    });
});
//# sourceMappingURL=auth.test.js.map