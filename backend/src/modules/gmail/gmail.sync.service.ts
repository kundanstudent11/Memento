import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { fingerprint } from '../../lib/crypto';
import { GmailNotConnectedError, GmailSyncError } from '../../lib/AppError';
import { logger } from '../../lib/logger';
import { getAuthorizedGmailClient } from './gmail.oauth.service';
import { fetchRecentEmails } from './gmail.fetch.service';
import { analyzeEmails } from './gmail.analyze.service';
import { gmailConnectionRepository } from './gmail-connection.repository';
import {
  gmailInsightRepository,
  itemToInsert,
} from './gmail-insight.repository';
import type { GmailSyncResult } from '@shared/types';

/**
 * Orchestrates a blocking Gmail sync: fetch → analyze → upsert insights.
 */
export async function syncGmail(
  userId: string,
  windowDays?: number
): Promise<GmailSyncResult> {
  const started = Date.now();
  const days = windowDays ?? env.GMAIL_SYNC_WINDOW_DAYS;

  const authorized = await getAuthorizedGmailClient(userId);
  if (!authorized) {
    throw new GmailNotConnectedError();
  }

  try {
    const emails = await fetchRecentEmails(authorized.client, days);
    const items = await analyzeEmails(emails);
    const now = new Date();

    const rows = items.map((item) => {
      const fp = fingerprint([
        item.type,
        item.title,
        item.amount != null ? String(item.amount.value) : '',
      ]);
      return itemToInsert(userId, uuidv4(), fp, item, now);
    });

    const itemsStored = await gmailInsightRepository.upsertMany(rows);
    await gmailConnectionRepository.updateLastSyncedAt(userId, now);

    const result: GmailSyncResult = {
      emailsScanned: emails.length,
      itemsExtracted: items.length,
      itemsStored,
      durationMs: Date.now() - started,
    };

    logger.info('Gmail sync completed', { userId, ...result });
    return result;
  } catch (err) {
    if (err instanceof GmailNotConnectedError) throw err;
    if (err instanceof GmailSyncError) throw err;
    logger.error('Gmail sync failed', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw new GmailSyncError(
      err instanceof Error ? err.message : 'Gmail sync failed'
    );
  }
}
