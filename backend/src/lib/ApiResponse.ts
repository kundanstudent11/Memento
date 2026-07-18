import type { ApiSuccess, ApiError, PaginationMeta, ErrorCode, ValidationFieldError } from '@shared/types';

/**
 * Builder for the standard API response envelope.
 * Controllers must always use these methods — never construct raw JSON responses.
 */
export const ApiResponse = {
  success<T>(
    data: T,
    options?: { message?: string; meta?: PaginationMeta }
  ): ApiSuccess<T> {
    return {
      success: true,
      data,
      ...(options?.message && { message: options.message }),
      ...(options?.meta && { meta: options.meta }),
    };
  },

  error(
    message: string,
    code: ErrorCode,
    details?: ValidationFieldError[]
  ): ApiError {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };
  },
};
