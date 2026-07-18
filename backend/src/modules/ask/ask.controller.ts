import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../lib/ApiResponse';
import { UnauthorizedError } from '../../lib/AppError';
import { askService } from './ask.service';
import type { AskBody } from './ask.schema';
import type { User } from '@shared/types';

function getAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export const askController = {
  async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await askService.ask(
        getAuthenticatedUser(req).id,
        req.body as AskBody
      );
      res.json(ApiResponse.success(result));
    } catch (err) {
      next(err);
    }
  },
};
