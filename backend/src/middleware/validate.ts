import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../lib/AppError';

type RequestTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates a specific part of the request against a Zod schema.
 * On failure, it throws a typed ValidationError (handled by the global error handler).
 *
 * @example
 * router.post('/upload', validate('body', uploadBodySchema), controller.upload);
 */
export function validate(target: RequestTarget, schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = flattenZodErrors(result.error);
      return next(new ValidationError('Request validation failed', details));
    }

    // Replace with parsed/coerced value so downstream code gets clean data
    req[target] = result.data;
    next();
  };
}

function flattenZodErrors(error: ZodError) {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}
