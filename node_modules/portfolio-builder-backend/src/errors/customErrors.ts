/**
 * Custom error classes for better error handling and type safety
 */

export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

export class FileProcessingError extends BaseError {
  readonly statusCode = 422;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

export class SecurityThreatError extends BaseError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string, public readonly threats: string[], context?: Record<string, any>) {
    super(message, context);
  }
}

export class ServiceUnavailableError extends BaseError {
  readonly statusCode = 503;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

export class InternalServerError extends BaseError {
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}
