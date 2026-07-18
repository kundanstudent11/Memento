import { google, type gmail_v1 } from 'googleapis';
import { env } from '../../config/env';
import { GmailSyncError } from '../../lib/AppError';
import { logger } from '../../lib/logger';

export type GmailOAuthClient = InstanceType<typeof google.auth.OAuth2>;

export type RawGmailMessage = {
  gmailMessageId: string;
  gmailThreadId: string;
  subject: string;
  fromName: string | null;
  fromEmail: string;
  receivedAt: string;
  bodyText: string;
};

const MAX_BODY_CHARS = 4000;

function headerValue(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  const found = headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return found?.value ?? '';
}

function parseFrom(raw: string): { name: string | null; email: string } {
  const match = raw.match(/^(?:"?([^"]*)"?\s)?<?([^>]+@[^>]+)>?$/);
  if (match) {
    const name = match[1]?.trim() || null;
    const email = (match[2] ?? raw).trim();
    return { name, email };
  }
  return { name: null, email: raw.trim() || 'unknown@unknown' };
}

function decodeBodyData(data: string | undefined | null): string {
  if (!data) return '';
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function extractPlainText(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBodyData(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBodyData(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const nested = extractPlainText(part);
      if (nested) return nested;
    }
  }

  if (payload.body?.data) {
    return decodeBodyData(payload.body.data);
  }

  return '';
}

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

/**
 * Lists and fetches recent Gmail messages within the sync window.
 */
export async function fetchRecentEmails(
  auth: GmailOAuthClient,
  windowDays: number
): Promise<RawGmailMessage[]> {
  // googleapis nests its own google-auth-library; cast avoids duplicate-type clash
  const gmail = google.gmail({ version: 'v1', auth: auth as never });
  const afterEpoch = Math.floor(
    (Date.now() - windowDays * 24 * 60 * 60 * 1000) / 1000
  );
  const query = `after:${afterEpoch}`;
  const max = env.GMAIL_MAX_MESSAGES;

  try {
    const messageIds: string[] = [];
    let pageToken: string | undefined;

    while (messageIds.length < max) {
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: Math.min(50, max - messageIds.length),
        pageToken,
      });

      const batch = listRes.data.messages ?? [];
      for (const msg of batch) {
        if (msg.id) messageIds.push(msg.id);
      }

      pageToken = listRes.data.nextPageToken ?? undefined;
      if (!pageToken || batch.length === 0) break;
    }

    const results: RawGmailMessage[] = [];

    for (const id of messageIds) {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'full',
      });

      const msg = msgRes.data;
      const headers = msg.payload?.headers;
      const subject = headerValue(headers, 'Subject') || '(no subject)';
      const fromRaw = headerValue(headers, 'From');
      const { name, email } = parseFrom(fromRaw);
      const internalDate = msg.internalDate
        ? new Date(Number(msg.internalDate)).toISOString()
        : new Date().toISOString();
      const bodyText = truncate(extractPlainText(msg.payload), MAX_BODY_CHARS);

      results.push({
        gmailMessageId: msg.id ?? id,
        gmailThreadId: msg.threadId ?? id,
        subject,
        fromName: name,
        fromEmail: email,
        receivedAt: internalDate,
        bodyText,
      });
    }

    logger.info('Fetched Gmail messages', { count: results.length, windowDays });
    return results;
  } catch (err) {
    logger.error('Gmail fetch failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw new GmailSyncError(
      err instanceof Error ? err.message : 'Failed to fetch Gmail messages'
    );
  }
}
