import type { ErrorCode, ValidationFieldError } from '@shared/types';

/**
 * Base error class. All operational errors extend this.
 * The global error handler maps `AppError` subclasses → HTTP responses automatically.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ValidationFieldError[];
  public readonly isOperational: boolean = true;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: ValidationFieldError[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ValidationFieldError[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class AiExtractionError extends AppError {
  constructor(message: string) {
    super(message, 502, 'AI_EXTRACTION_FAILED');
  }
}
