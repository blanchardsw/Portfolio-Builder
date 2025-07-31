"use strict";
/**
 * Custom error classes for better error handling and type safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotFoundError = exports.ServiceUnavailableError = exports.SecurityThreatError = exports.FileProcessingError = exports.ValidationError = exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
class ValidationError extends BaseError {
    constructor(message, context) {
        super(message, context);
        this.statusCode = 400;
        this.isOperational = true;
    }
}
exports.ValidationError = ValidationError;
class FileProcessingError extends BaseError {
    constructor(message, context) {
        super(message, context);
        this.statusCode = 422;
        this.isOperational = true;
    }
}
exports.FileProcessingError = FileProcessingError;
class SecurityThreatError extends BaseError {
    constructor(message, threats, context) {
        super(message, context);
        this.threats = threats;
        this.statusCode = 400;
        this.isOperational = true;
    }
}
exports.SecurityThreatError = SecurityThreatError;
class ServiceUnavailableError extends BaseError {
    constructor(message, context) {
        super(message, context);
        this.statusCode = 503;
        this.isOperational = true;
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class NotFoundError extends BaseError {
    constructor(message, context) {
        super(message, context);
        this.statusCode = 404;
        this.isOperational = true;
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends BaseError {
    constructor(message, context) {
        super(message, context);
        this.statusCode = 500;
        this.isOperational = false;
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=customErrors.js.map