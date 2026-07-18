import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import { ApiResponse } from '../lib/ApiResponse';
import { logger } from '../lib/logger';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    // Operational error — expected, already typed
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, stack: err.stack });
    }
    res
      .status(err.statusCode)
      .json(ApiResponse.error(err.message, err.code, err.details));
    return;
  }

  // Unhandled/programmer error — always 500
  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error('Unhandled error', {
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json(
    ApiResponse.error(
      env.NODE_ENV === 'production' ? 'Internal server error' : message,
      'INTERNAL_ERROR'
    )
  );
}
