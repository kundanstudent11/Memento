import type { GmailInsight, GmailStats } from '@shared/types';

export const ASK_SYSTEM_PROMPT = `You are Memento, a personal finance & admin assistant.
Answer the user's question using ONLY the DATA CONTEXT provided (extracted from their email).

Rules:
- Never invent amounts, dates, merchants, or facts that are not in the context.
- If the data does not contain the answer, say so plainly and suggest syncing Gmail.
- Be concise and conversational. Use the user's currency and ISO dates exactly as given.
- For "when/next/upcoming" questions, reason relative to TODAY'S DATE below.
- When totalling money, sum accurately from the items and state the currency.
- Prefer specifics (names, amounts, dates) over vague generalities.`;

const MAX_INSIGHTS = 250;

/**
 * Serializes the user's insights + aggregate stats into a compact,
 * token-bounded grounding block for the model.
 */
export function buildAskContext(insights: GmailInsight[], stats: GmailStats): string {
  const trimmed = insights.slice(0, MAX_INSIGHTS).map((i) => ({
    type: i.type,
    category: i.category,
    title: i.title,
    merchant: i.merchant?.name ?? null,
    amount: i.amount,
    billingCycle: i.billingCycle,
    status: i.status,
    dates: i.dates,
    summary: i.summary,
  }));

  const summary = {
    totalItems: stats.totalItems,
    monthlyRecurringTotal: stats.monthlyRecurringTotal,
    currency: stats.currency,
    totalsByType: stats.totalsByType,
    spendByCategory: stats.spendByCategory,
    topMerchants: stats.topMerchants,
    upcomingReminders: stats.upcomingReminders,
    lastSyncedAt: stats.lastSyncedAt,
  };

  return [
    `TODAY'S DATE: ${new Date().toISOString().slice(0, 10)}`,
    `SUMMARY: ${JSON.stringify(summary)}`,
    `ITEMS (${trimmed.length} of ${insights.length}): ${JSON.stringify(trimmed)}`,
  ].join('\n\n');
}
