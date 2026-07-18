import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { UnauthorizedError } from '../lib/AppError';
import { getUserFromSession } from '../modules/auth/auth.service';

/**
 * Verifies the session cookie and attaches the authenticated user to the request.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies[env.SESSION_COOKIE_NAME] as string | undefined;
    if (!token) {
      return next(new UnauthorizedError());
    }

    req.user = await getUserFromSession(token);
    next();
  } catch (err) {
    next(err);
  }
}
