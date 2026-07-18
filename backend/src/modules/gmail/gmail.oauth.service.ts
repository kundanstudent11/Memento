import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { encrypt, decrypt } from '../../lib/crypto';
import { GmailAuthError } from '../../lib/AppError';
import { gmailConnectionRepository } from './gmail-connection.repository';
import { gmailInsightRepository } from './gmail-insight.repository';
import type { GmailConnection } from '@shared/types';

const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

type GmailOAuthState = {
  userId: string;
  purpose: 'gmail_connect';
};

function createOAuthClient(redirectUri = env.GOOGLE_GMAIL_CALLBACK_URL) {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

/**
 * Signs a short-lived JWT that binds the Gmail OAuth callback to a user.
 */
export function signGmailOAuthState(userId: string): string {
  const payload: GmailOAuthState = { userId, purpose: 'gmail_connect' };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '10m' });
}

/**
 * Verifies the Gmail OAuth state JWT and returns the bound userId.
 */
export function verifyGmailOAuthState(state: string): string {
  try {
    const payload = jwt.verify(state, env.JWT_SECRET) as GmailOAuthState;
    if (payload.purpose !== 'gmail_connect' || !payload.userId) {
      throw new GmailAuthError('Invalid Gmail OAuth state');
    }
    return payload.userId;
  } catch {
    throw new GmailAuthError('Invalid or expired Gmail OAuth state');
  }
}

/**
 * Builds the Google consent URL for Gmail readonly offline access.
 */
export function buildGmailAuthUrl(state: string): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: GMAIL_SCOPES,
    state,
  });
}

/**
 * Exchanges the authorization code and stores the encrypted refresh token.
 */
export async function completeGmailConnect(
  userId: string,
  code: string
): Promise<GmailConnection> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new GmailAuthError(
      'Google did not return a refresh token. Disconnect the app in Google Account settings and try again.'
    );
  }

  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const profile = await oauth2.userinfo.get();
  const googleEmail = profile.data.email;
  if (!googleEmail) {
    throw new GmailAuthError('Could not determine the Gmail address');
  }

  const now = new Date();
  const row = await gmailConnectionRepository.upsert({
    id: uuidv4(),
    userId,
    googleEmail,
    refreshTokenEncrypted: encrypt(tokens.refresh_token),
    scopes: GMAIL_SCOPES.join(' '),
    status: 'connected',
    connectedAt: now,
    lastSyncedAt: null,
    updatedAt: now,
  });

  return {
    connected: true,
    status: row.status,
    googleEmail: row.googleEmail,
    connectedAt: row.connectedAt.toISOString(),
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
  };
}

/**
 * Returns an authorized OAuth2 client for the user's stored Gmail connection.
 */
export async function getAuthorizedGmailClient(userId: string) {
  const connection = await gmailConnectionRepository.findByUserId(userId);
  if (!connection || connection.status !== 'connected') {
    return null;
  }

  const client = createOAuthClient();
  client.setCredentials({
    refresh_token: decrypt(connection.refreshTokenEncrypted),
  });
  return { client, connection };
}

/**
 * Loads connection status for the frontend (never exposes tokens).
 */
export async function getGmailConnectionStatus(userId: string): Promise<GmailConnection> {
  const row = await gmailConnectionRepository.findByUserId(userId);
  if (!row) {
    return {
      connected: false,
      status: null,
      googleEmail: null,
      connectedAt: null,
      lastSyncedAt: null,
    };
  }

  return {
    connected: row.status === 'connected',
    status: row.status,
    googleEmail: row.googleEmail,
    connectedAt: row.connectedAt.toISOString(),
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
  };
}

/**
 * Revokes the Google token (best-effort) and deletes local connection data.
 */
export async function disconnectGmail(userId: string): Promise<void> {
  const authorized = await getAuthorizedGmailClient(userId);
  if (authorized) {
    try {
      await authorized.client.revokeCredentials();
    } catch {
      // Best-effort revoke — still delete local data
    }
  }

  await gmailInsightRepository.deleteByUserId(userId);
  await gmailConnectionRepository.deleteByUserId(userId);
}
