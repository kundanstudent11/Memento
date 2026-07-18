import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../lib/ApiResponse';
import { AppError, UnauthorizedError } from '../../lib/AppError';
import { documentsService } from './documents.service';
import type { UploadDocumentBody, ListDocumentsQuery, QueryDocumentsBody } from './documents.schema';
import type { User } from '@shared/types';

function getAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

/**
 * Controllers are thin adapters: parse validated request data,
 * call the service, format the response. No business logic here.
 */
export const documentsController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListDocumentsQuery;
      const { items, total } = await documentsService.list(getAuthenticatedUser(req).id, query);
      const perPage = query.perPage ?? 20;
      res.json(
        ApiResponse.success(items, {
          meta: {
            total,
            page: query.page ?? 1,
            perPage,
            totalPages: Math.ceil(total / perPage),
          },
        })
      );
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await documentsService.getById(getAuthenticatedUser(req).id, req.params.id);
      res.json(ApiResponse.success(doc));
    } catch (err) {
      next(err);
    }
  },

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        return next(new AppError('No file uploaded', 400, 'VALIDATION_ERROR'));
      }
      const body = req.body as UploadDocumentBody;
      const doc = await documentsService.create(getAuthenticatedUser(req).id, req.file, body);
      res
        .status(201)
        .json(ApiResponse.success(doc, { message: 'Document uploaded. AI extraction queued.' }));
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await documentsService.delete(getAuthenticatedUser(req).id, req.params.id);
      res.json(ApiResponse.success(null, { message: 'Document deleted' }));
    } catch (err) {
      next(err);
    }
  },

  async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as QueryDocumentsBody;
      const result = await documentsService.query(getAuthenticatedUser(req).id, body);
      res.json(ApiResponse.success(result));
    } catch (err) {
      next(err);
    }
  },
};
