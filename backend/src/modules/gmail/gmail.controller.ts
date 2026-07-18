import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { ApiResponse } from '../../lib/ApiResponse';
import { UnauthorizedError } from '../../lib/AppError';
import {
  buildGmailAuthUrl,
  completeGmailConnect,
  disconnectGmail,
  getGmailConnectionStatus,
  signGmailOAuthState,
  verifyGmailOAuthState,
} from './gmail.oauth.service';
import { syncGmail } from './gmail.sync.service';
import { getGmailStats } from './gmail.stats.service';
import { gmailInsightRepository } from './gmail-insight.repository';
import type { ListInsightsQuery, SyncGmailBody } from './gmail.schema';
import type { User } from '@shared/types';

function getAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export const gmailController = {
  connect(req: Request, res: Response, next: NextFunction): void {
    try {
      const user = getAuthenticatedUser(req);
      const state = signGmailOAuthState(user.id);
      res.redirect(buildGmailAuthUrl(state));
    } catch (err) {
      next(err);
    }
  },

  async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state } = req.query;
      if (typeof code !== 'string' || typeof state !== 'string') {
        return next(new UnauthorizedError('Invalid Gmail OAuth callback'));
      }

      const userId = verifyGmailOAuthState(state);
      await completeGmailConnect(userId, code);
      res.redirect(`${env.FRONTEND_URL}/dashboard?gmail=connected`);
    } catch (err) {
      next(err);
    }
  },

  async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const connection = await getGmailConnectionStatus(getAuthenticatedUser(req).id);
      res.json(ApiResponse.success(connection));
    } catch (err) {
      next(err);
    }
  },

  async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as SyncGmailBody;
      const result = await syncGmail(getAuthenticatedUser(req).id, body.windowDays);
      res.json(ApiResponse.success(result, { message: 'Gmail sync completed' }));
    } catch (err) {
      next(err);
    }
  },

  async insights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListInsightsQuery;
      const { items, total } = await gmailInsightRepository.findAll(
        getAuthenticatedUser(req).id,
        query
      );
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

  async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await getGmailStats(getAuthenticatedUser(req).id);
      res.json(ApiResponse.success(stats));
    } catch (err) {
      next(err);
    }
  },

  async disconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await disconnectGmail(getAuthenticatedUser(req).id);
      res.json(ApiResponse.success(null, { message: 'Gmail disconnected' }));
    } catch (err) {
      next(err);
    }
  },
};
