import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { ApiResponse } from '../../lib/ApiResponse';
import { UnauthorizedError } from '../../lib/AppError';
import {
  authenticateWithGoogle,
  buildGoogleAuthUrl,
  createOAuthState,
  signSessionToken,
} from './auth.service';

const OAUTH_STATE_COOKIE = 'memento_oauth_state';

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

function oauthStateCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 10 * 60 * 1000,
    path: '/',
  };
}

export const authController = {
  googleRedirect(_req: Request, res: Response): void {
    const state = createOAuthState();
    res.cookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions());
    res.redirect(buildGoogleAuthUrl(state));
  },

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state } = req.query;
      const storedState = req.cookies[OAUTH_STATE_COOKIE] as string | undefined;

      if (typeof code !== 'string' || typeof state !== 'string' || !storedState || state !== storedState) {
        return next(new UnauthorizedError('Invalid OAuth callback'));
      }

      res.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

      const user = await authenticateWithGoogle(code);
      const token = signSessionToken(user.id);

      res
        .cookie(env.SESSION_COOKIE_NAME, token, sessionCookieOptions())
        .redirect(env.FRONTEND_URL);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new UnauthorizedError());
      }
      res.json(ApiResponse.success(req.user));
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response): void {
    res.clearCookie(env.SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.json(ApiResponse.success(null, { message: 'Logged out' }));
  },
};
