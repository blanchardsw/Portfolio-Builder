/**
 * Custom error classes for better error handling and type safety
 */
export declare abstract class BaseError extends Error {
    readonly context?: Record<string, any> | undefined;
    abstract readonly statusCode: number;
    abstract readonly isOperational: boolean;
    constructor(message: string, context?: Record<string, any> | undefined);
}
export declare class ValidationError extends BaseError {
    readonly statusCode = 400;
    readonly isOperational = true;
    constructor(message: string, context?: Record<string, any>);
}
export declare class FileProcessingError extends BaseError {
    readonly statusCode = 422;
    readonly isOperational = true;
    constructor(message: string, context?: Record<string, any>);
}
export declare class SecurityThreatError extends BaseError {
    readonly threats: string[];
    readonly statusCode = 400;
    readonly isOperational = true;
    constructor(message: string, threats: string[], context?: Record<string, any>);
}
export declare class ServiceUnavailableError extends BaseError {
    readonly statusCode = 503;
    readonly isOperational = true;
    constructor(message: string, context?: Record<string, any>);
}
export declare class NotFoundError extends BaseError {
    readonly statusCode = 404;
    readonly isOperational = true;
    constructor(message: string, context?: Record<string, any>);
}
export declare class InternalServerError extends BaseError {
    readonly statusCode = 500;
    readonly isOperational = false;
    constructor(message: string, context?: Record<string, any>);
}
//# sourceMappingURL=customErrors.d.ts.map