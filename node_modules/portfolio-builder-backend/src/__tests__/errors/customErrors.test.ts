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

import {
  BaseError,
  ValidationError,
  FileProcessingError,
  SecurityThreatError,
  ServiceUnavailableError,
  NotFoundError,
  InternalServerError
} from '../../errors/customErrors';

describe('Custom Error Classes', () => {
  describe('BaseError', () => {
    // Create a concrete implementation for testing
    class TestError extends BaseError {
      readonly statusCode = 418;
      readonly isOperational = true;
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
      const error = new ValidationError('Invalid input data');
      
      expect(error.message).toBe('Invalid input data');
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should create validation error with context', () => {
      const context = { field: 'email', value: 'invalid-email' };
      const error = new ValidationError('Email format is invalid', context);
      
      expect(error.message).toBe('Email format is invalid');
      expect(error.context).toEqual(context);
      expect(error.statusCode).toBe(400);
    });
  });

  describe('FileProcessingError', () => {
    it('should create file processing error with correct properties', () => {
      const error = new FileProcessingError('Unable to process file');
      
      expect(error.message).toBe('Unable to process file');
      expect(error.name).toBe('FileProcessingError');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(FileProcessingError);
    });

    it('should create file processing error with context', () => {
      const context = { filename: 'test.pdf', size: 1024000 };
      const error = new FileProcessingError('File too large', context);
      
      expect(error.message).toBe('File too large');
      expect(error.context).toEqual(context);
      expect(error.statusCode).toBe(422);
    });
  });

  describe('SecurityThreatError', () => {
    it('should create security threat error with threats array', () => {
      const threats = ['malware', 'suspicious_content'];
      const error = new SecurityThreatError('Security threats detected', threats);
      
      expect(error.message).toBe('Security threats detected');
      expect(error.name).toBe('SecurityThreatError');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.threats).toEqual(threats);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(SecurityThreatError);
    });

    it('should create security threat error with threats and context', () => {
      const threats = ['virus', 'trojan'];
      const context = { filename: 'suspicious.exe', scanTime: Date.now() };
      const error = new SecurityThreatError('Multiple threats found', threats, context);
      
      expect(error.message).toBe('Multiple threats found');
      expect(error.threats).toEqual(threats);
      expect(error.context).toEqual(context);
      expect(error.statusCode).toBe(400);
    });

    it('should handle empty threats array', () => {
      const error = new SecurityThreatError('Generic security error', []);
      
      expect(error.threats).toEqual([]);
      expect(error.message).toBe('Generic security error');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with correct properties', () => {
      const error = new ServiceUnavailableError('External service is down');
      
      expect(error.message).toBe('External service is down');
      expect(error.name).toBe('ServiceUnavailableError');
      expect(error.statusCode).toBe(503);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ServiceUnavailableError);
    });

    it('should create service unavailable error with context', () => {
      const context = { service: 'linkedin-api', retryAfter: 300 };
      const error = new ServiceUnavailableError('LinkedIn API rate limited', context);
      
      expect(error.message).toBe('LinkedIn API rate limited');
      expect(error.context).toEqual(context);
      expect(error.statusCode).toBe(503);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with correct properties', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should create not found error with context', () => {
      const context = { resourceId: '123', resourceType: 'portfolio' };
      const error = new NotFoundError('Portfolio not found', context);
      
      expect(error.message).toBe('Portfolio not found');
      expect(error.context).toEqual(context);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with correct properties', () => {
      const error = new InternalServerError('Unexpected server error');
      
      expect(error.message).toBe('Unexpected server error');
      expect(error.name).toBe('InternalServerError');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false); // Non-operational error
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(InternalServerError);
    });

    it('should create internal server error with context', () => {
      const context = { operation: 'database_query', query: 'SELECT * FROM users' };
      const error = new InternalServerError('Database connection failed', context);
      
      expect(error.message).toBe('Database connection failed');
      expect(error.context).toEqual(context);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('error inheritance chain', () => {
    it('should maintain proper inheritance hierarchy', () => {
      const validationError = new ValidationError('Test');
      const fileError = new FileProcessingError('Test');
      const securityError = new SecurityThreatError('Test', []);
      const serviceError = new ServiceUnavailableError('Test');
      const notFoundError = new NotFoundError('Test');
      const internalError = new InternalServerError('Test');
      
      // All should be instances of BaseError
      expect(validationError).toBeInstanceOf(BaseError);
      expect(fileError).toBeInstanceOf(BaseError);
      expect(securityError).toBeInstanceOf(BaseError);
      expect(serviceError).toBeInstanceOf(BaseError);
      expect(notFoundError).toBeInstanceOf(BaseError);
      expect(internalError).toBeInstanceOf(BaseError);
      
      // All should be instances of Error
      expect(validationError).toBeInstanceOf(Error);
      expect(fileError).toBeInstanceOf(Error);
      expect(securityError).toBeInstanceOf(Error);
      expect(serviceError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(Error);
      expect(internalError).toBeInstanceOf(Error);
    });

    it('should have correct status codes for HTTP responses', () => {
      expect(new ValidationError('Test').statusCode).toBe(400);
      expect(new FileProcessingError('Test').statusCode).toBe(422);
      expect(new SecurityThreatError('Test', []).statusCode).toBe(400);
      expect(new ServiceUnavailableError('Test').statusCode).toBe(503);
      expect(new NotFoundError('Test').statusCode).toBe(404);
      expect(new InternalServerError('Test').statusCode).toBe(500);
    });

    it('should have correct operational flags', () => {
      expect(new ValidationError('Test').isOperational).toBe(true);
      expect(new FileProcessingError('Test').isOperational).toBe(true);
      expect(new SecurityThreatError('Test', []).isOperational).toBe(true);
      expect(new ServiceUnavailableError('Test').isOperational).toBe(true);
      expect(new NotFoundError('Test').isOperational).toBe(true);
      expect(new InternalServerError('Test').isOperational).toBe(false); // Only this one is non-operational
    });
  });
});
