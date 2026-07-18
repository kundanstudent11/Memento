import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../lib/AppError';
import { authRepository } from './auth.repository';
import type { User } from '@shared/types';

type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

type JwtPayload = {
  sub: string;
};

const oauthClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL
);

/**
 * Builds the Google OAuth consent URL with a CSRF state token.
 */
export function buildGoogleAuthUrl(state: string): string {
  return oauthClient.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });
}

/**
 * Generates a cryptographically secure OAuth state value.
 */
export function createOAuthState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Exchanges an authorization code for a Google profile and upserts the user.
 */
export async function authenticateWithGoogle(code: string): Promise<User> {
  const { tokens } = await oauthClient.getToken(code);
  if (!tokens.id_token) {
    throw new UnauthorizedError('Google did not return an ID token');
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError('Google profile is missing required fields');
  }

  const profile: GoogleProfile = {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    avatarUrl: payload.picture ?? null,
  };

  const now = new Date();
  const existing = await authRepository.findByGoogleId(profile.googleId);

  return authRepository.upsert({
    id: existing?.id ?? uuidv4(),
    googleId: profile.googleId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Signs a JWT for the authenticated user.
 */
export function signSessionToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: userId }, env.JWT_SECRET, options);
}

/**
 * Verifies a session JWT and returns the user ID.
 */
export function verifySessionToken(token: string): string {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload.sub) {
      throw new UnauthorizedError('Invalid session token');
    }
    return payload.sub;
  } catch {
    throw new UnauthorizedError('Invalid or expired session');
  }
}

/**
 * Loads the current user from a session token.
 */
export async function getUserFromSession(token: string): Promise<User> {
  const userId = verifySessionToken(token);
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  return user;
}
