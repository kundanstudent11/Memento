/**
 * Standard API envelope used by every endpoint.
 * Backend builds it via ApiResponse helper; frontend consumes it via apiClient.
 */

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
};

export type ApiError = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationFieldError[];
  };
};

/** Union — use this as the return type of every endpoint */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export type PaginationMeta = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type PaginatedRequest = {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'AI_EXTRACTION_FAILED'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE';

export type ValidationFieldError = {
  field: string;
  message: string;
};
