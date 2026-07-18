import { generateJsonContent } from '../../lib/llm';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import {
  GMAIL_EXTRACTION_RESPONSE_SCHEMA,
  GMAIL_EXTRACTION_SYSTEM_PROMPT,
} from './gmail.prompt';
import { gmailExtractionResultSchema } from './gmail.schema';
import type { RawGmailMessage } from './gmail.fetch.service';
import type { GmailExtractionItem } from '@shared/types';

function chunkEmails(emails: RawGmailMessage[], size: number): RawGmailMessage[][] {
  const chunks: RawGmailMessage[][] = [];
  for (let i = 0; i < emails.length; i += size) {
    chunks.push(emails.slice(i, i + size));
  }
  return chunks;
}

function buildUserPrompt(batch: RawGmailMessage[]): string {
  const payload = batch.map((email) => ({
    gmailMessageId: email.gmailMessageId,
    gmailThreadId: email.gmailThreadId,
    subject: email.subject,
    from: { name: email.fromName, email: email.fromEmail },
    receivedAt: email.receivedAt,
    body: email.bodyText,
  }));

  return `Analyze the following emails and extract relevant financial/admin items.

Emails JSON:
${JSON.stringify(payload)}`;
}

/**
 * Sends email batches to Gemini and returns validated extraction items.
 */
export async function analyzeEmails(
  emails: RawGmailMessage[]
): Promise<GmailExtractionItem[]> {
  if (emails.length === 0) return [];

  const batches = chunkEmails(emails, env.GMAIL_LLM_BATCH_SIZE);
  const items: GmailExtractionItem[] = [];

  for (const [index, batch] of batches.entries()) {
    logger.info('Analyzing Gmail batch', {
      batch: index + 1,
      totalBatches: batches.length,
      size: batch.length,
    });

    const rawText = await generateJsonContent({
      systemInstruction: GMAIL_EXTRACTION_SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(batch),
      responseSchema: GMAIL_EXTRACTION_RESPONSE_SCHEMA,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      logger.warn('Gemini returned non-JSON; skipping batch', { batch: index + 1 });
      continue;
    }

    const validated = gmailExtractionResultSchema.safeParse(parsed);
    if (!validated.success) {
      logger.warn('Gemini response failed Zod validation; skipping batch', {
        batch: index + 1,
        issues: validated.error.flatten(),
      });
      continue;
    }

    for (const item of validated.data.items) {
      if (item.confidence < env.GMAIL_MIN_CONFIDENCE) continue;
      items.push({
        source: item.source,
        type: item.type,
        category: item.category,
        title: item.title,
        merchant: item.merchant,
        amount: item.amount,
        billingCycle: item.billingCycle,
        dates: item.dates,
        status: item.status,
        reminders: item.reminders,
        summary: item.summary,
        keyTerms: item.keyTerms,
        confidence: item.confidence,
        details: item.details ?? {},
        metadata: item.metadata ?? {},
      });
    }
  }

  return items;
}
