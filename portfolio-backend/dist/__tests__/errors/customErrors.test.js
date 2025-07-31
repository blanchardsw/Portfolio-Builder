"use strict";
/**
 * Unit tests for custom error classes
 *
 * Tests cover:
 * - Error class inheritance and properties
 * - Status codes and operational flags
 * - Context data handling
 * - Stack trace capture
 * - Error message formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
const customErrors_1 = require("../../errors/customErrors");
describe('Custom Error Classes', () => {
    describe('BaseError', () => {
        // Create a concrete implementation for testing
        class TestError extends customErrors_1.BaseError {
            constructor() {
                super(...arguments);
                this.statusCode = 418;
                this.isOperational = true;
            }
        }
        it('should create error with message', () => {
            const error = new TestError('Test error message');
            expect(error.message).toBe('Test error message');
            expect(error.name).toBe('TestError');
            expect(error.statusCode).toBe(418);
            expect(error.isOperational).toBe(true);
            expect(error.context).toBeUndefined();
            expect(error.stack).toBeDefined();
        });
        it('should create error with message and context', () => {
            const context = { userId: '123', action: 'test' };
            const error = new TestError('Test error with context', context);
            expect(error.message).toBe('Test error with context');
            expect(error.context).toEqual(context);
            expect(error.name).toBe('TestError');
        });
        it('should capture stack trace', () => {
            const error = new TestError('Stack trace test');
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('TestError');
            expect(error.stack).toContain('Stack trace test');
        });
    });
    describe('ValidationError', () => {
        it('should create validation error with correct properties', () => {
            const error = new customErrors_1.ValidationError('Invalid input data');
            expect(error.message).toBe('Invalid input data');
            expect(error.name).toBe('ValidationError');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
            expect(error).toBeInstanceOf(customErrors_1.BaseError);
            expect(error).toBeInstanceOf(customErrors_1.ValidationError);
        });
        it('should create validation error with context', () => {
            const context = { field: 'email', value: 'invalid-email' };
            const error = new customErrors_1.ValidationError('Email format is invalid', context);
            expect(error.message).toBe('Email format is invalid');
            expect(error.context).toEqual(context);
            expect(error.statusCode).toBe(400);
        });
    });
    describe('FileProcessingError', () => {
        it('should create file processing error with correct properties', () => {
            const error = new customErrors_1.FileProcessingError('Unable to process file');
            expect(error.message).toBe('Unable to process file');
            expect(error.name).toBe('FileProcessingError');
            expect(error.statusCode).toBe(422);
            expect(error.isOperational).toBe(true);
            expect(error).toBeInstanceOf(customErrors_1.BaseError);
            expect(error).toBeInstanceOf(customErrors_1.FileProcessingError);
        });
        it('should create file processing error with context', () => {
            const context = { filename: 'test.pdf', size: 1024000 };
            const error = new customErrors_1.FileProcessingError('File too large', context);
            expect(error.message).toBe('File too large');
            expect(error.context).toEqual(context);
            expect(error.statusCode).toBe(422);
        });
    });
    describe('SecurityThreatError', () => {
        it('should create security threat error with threats array', () => {
            const threats = ['malware', 'suspicious_content'];
            const error = new customErrors_1.SecurityThreatError('Security threats detected', threats);
            expect(error.message).toBe('Security threats detected');
            expect(error.name).toBe('SecurityThreatError');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
            expect(error.threats).toEqual(threats);
            expect(error).toBeInstanceOf(customErrors_1.BaseError);
            expect(error).toBeInstanceOf(customErrors_1.SecurityThreatError);
        });
        it('should create security threat error with threats and context', () => {
            const threats = ['virus', 'trojan'];
            const context = { filename: 'suspicious.exe', scanTime: Date.now() };
            const error = new customErrors_1.SecurityThreatError('Multiple threats found', threats, context);
            expect(error.message).toBe('Multiple threats found');
            expect(error.threats).toEqual(threats);
            expect(error.context).toEqual(context);
            expect(error.statusCode).toBe(400);
        });
        it('should handle empty threats array', () => {
            const error = new customErrors_1.SecurityThreatError('Generic security error', []);
            expect(error.threats).toEqual([]);
            expect(error.message).toBe('Generic security error');
        });
    });
    describe('ServiceUnavailableError', () => {
        it('should create service unavailable error with correct properties', () => {
            const error = new customErrors_1.ServiceUnavailableError('External service is down');
            expect(error.message).toBe('External service is down');
            expect(error.name).toBe('ServiceUnavailableError');
            expect(error.statusCode).toBe(503);
            expect(error.isOperational).toBe(true);
            expect(error).toBeInstanceOf(customErrors_1.BaseError);
            expect(error).toBeInstanceOf(customErrors_1.ServiceUnavailableError);
        });
        it('should create service unavailable error with context', () => {
            const context = { service: 'linkedin-api', retryAfter: 300 };
            const error = new customErrors_1.ServiceUnavailableError('LinkedIn API rate limited', context);
            expect(error.message).toBe('LinkedIn API rate limited');
            expect(error.context).toEqual(context);
            expect(error.statusCode).toBe(503);
        });
    });
    describe('NotFoundError', () => {
        it('should create not found error with correct properties', () => {
            const error = new customErrors_1.NotFoundError('Resource not found');
            expect(error.message).toBe('Resource not found');
            expect(error.name).toBe('NotFoundError');
            expect(error.statusCode).toBe(404);
            expect(error.isOperational).toBe(true);
            expect(error).toBeInstanceOf(customErrors_1.BaseError);
            expect(error).toBeInstanceOf(customErrors_1.NotFoundError);
        });
        it('should create not found error with context', () => {
            const context = { resourceId: '123', resourceType: 'portfolio' };
            const error = new customErrors_1.NotFoundError('Portfolio not found', context);
            expect(error.message).toBe('Portfolio not found');
            expect(error.context).toEqual(context);
            expect(error.statusCode).toBe(404);
        });
    });
    describe('InternalServerError', () => {
        it('should create internal server error with correct properties', () => {
            const error = new customErrors_1.InternalServerError('Unexpected server error');
            expect(error.message).toBe('Unexpected server error');
            expect(error.name).toBe('InternalServerError');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false); // Non-operational error
            expect(error).toBeInstanceOf(customErrors_1.BaseError);
            expect(error).toBeInstanceOf(customErrors_1.InternalServerError);
        });
        it('should create internal server error with context', () => {
            const context = { operation: 'database_query', query: 'SELECT * FROM users' };
            const error = new customErrors_1.InternalServerError('Database connection failed', context);
            expect(error.message).toBe('Database connection failed');
            expect(error.context).toEqual(context);
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false);
        });
    });
    describe('error inheritance chain', () => {
        it('should maintain proper inheritance hierarchy', () => {
            const validationError = new customErrors_1.ValidationError('Test');
            const fileError = new customErrors_1.FileProcessingError('Test');
            const securityError = new customErrors_1.SecurityThreatError('Test', []);
            const serviceError = new customErrors_1.ServiceUnavailableError('Test');
            const notFoundError = new customErrors_1.NotFoundError('Test');
            const internalError = new customErrors_1.InternalServerError('Test');
            // All should be instances of BaseError
            expect(validationError).toBeInstanceOf(customErrors_1.BaseError);
            expect(fileError).toBeInstanceOf(customErrors_1.BaseError);
            expect(securityError).toBeInstanceOf(customErrors_1.BaseError);
            expect(serviceError).toBeInstanceOf(customErrors_1.BaseError);
            expect(notFoundError).toBeInstanceOf(customErrors_1.BaseError);
            expect(internalError).toBeInstanceOf(customErrors_1.BaseError);
            // All should be instances of Error
            expect(validationError).toBeInstanceOf(Error);
            expect(fileError).toBeInstanceOf(Error);
            expect(securityError).toBeInstanceOf(Error);
            expect(serviceError).toBeInstanceOf(Error);
            expect(notFoundError).toBeInstanceOf(Error);
            expect(internalError).toBeInstanceOf(Error);
        });
        it('should have correct status codes for HTTP responses', () => {
            expect(new customErrors_1.ValidationError('Test').statusCode).toBe(400);
            expect(new customErrors_1.FileProcessingError('Test').statusCode).toBe(422);
            expect(new customErrors_1.SecurityThreatError('Test', []).statusCode).toBe(400);
            expect(new customErrors_1.ServiceUnavailableError('Test').statusCode).toBe(503);
            expect(new customErrors_1.NotFoundError('Test').statusCode).toBe(404);
            expect(new customErrors_1.InternalServerError('Test').statusCode).toBe(500);
        });
        it('should have correct operational flags', () => {
            expect(new customErrors_1.ValidationError('Test').isOperational).toBe(true);
            expect(new customErrors_1.FileProcessingError('Test').isOperational).toBe(true);
            expect(new customErrors_1.SecurityThreatError('Test', []).isOperational).toBe(true);
            expect(new customErrors_1.ServiceUnavailableError('Test').isOperational).toBe(true);
            expect(new customErrors_1.NotFoundError('Test').isOperational).toBe(true);
            expect(new customErrors_1.InternalServerError('Test').isOperational).toBe(false); // Only this one is non-operational
        });
    });
});
//# sourceMappingURL=customErrors.test.js.map