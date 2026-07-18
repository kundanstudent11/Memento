import { Request, Response } from 'express';
import { ApiResponse } from '../lib/ApiResponse';

export function notFound(req: Request, res: Response): void {
  res
    .status(404)
    .json(ApiResponse.error(`Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}
