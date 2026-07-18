import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import { gmailInsightsTable } from '../../lib/db/schema';
import type {
  GmailExtractionItem,
  GmailInsight,
  GmailItemType,
  SpendingCategory,
} from '@shared/types';

export type GmailInsightRow = typeof gmailInsightsTable.$inferSelect;
export type NewGmailInsight = typeof gmailInsightsTable.$inferInsert;

export type ListInsightsFilter = {
  page: number;
  perPage: number;
  type?: GmailItemType;
  category?: SpendingCategory;
};

function toInsight(row: GmailInsightRow): GmailInsight {
  const raw = row.raw;
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    title: row.title,
    merchant:
      row.merchantName != null
        ? { name: row.merchantName, domain: row.merchantDomain }
        : raw.merchant,
    amount:
      row.amountValue != null && row.currency != null
        ? { value: Number(row.amountValue), currency: row.currency }
        : raw.amount,
    billingCycle: row.billingCycle,
    dates: {
      issuedAt: row.issuedAt,
      paidAt: row.paidAt,
      dueDate: row.dueDate,
      renewalDate: row.renewalDate,
      serviceDate: row.serviceDate,
    },
    status: row.status,
    summary: row.summary,
    keyTerms: raw.keyTerms ?? [],
    reminders: raw.reminders ?? [],
    details: raw.details ?? {},
    metadata: raw.metadata ?? {},
    source: raw.source,
    confidence: row.confidence,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function itemToInsert(
  userId: string,
  id: string,
  fingerprint: string,
  item: GmailExtractionItem,
  now: Date
): NewGmailInsight {
  return {
    id,
    userId,
    gmailMessageId: item.source.gmailMessageId,
    gmailThreadId: item.source.gmailThreadId,
    fingerprint,
    type: item.type,
    category: item.category,
    title: item.title,
    merchantName: item.merchant?.name ?? null,
    merchantDomain: item.merchant?.domain ?? null,
    amountValue: item.amount != null ? String(item.amount.value) : null,
    currency: item.amount?.currency ?? null,
    billingCycle: item.billingCycle,
    issuedAt: item.dates.issuedAt,
    paidAt: item.dates.paidAt,
    dueDate: item.dates.dueDate,
    renewalDate: item.dates.renewalDate,
    serviceDate: item.dates.serviceDate,
    status: item.status,
    summary: item.summary,
    confidence: item.confidence,
    raw: item,
    createdAt: now,
    updatedAt: now,
  };
}

export const gmailInsightRepository = {
  async upsertMany(rows: NewGmailInsight[]): Promise<number> {
    if (rows.length === 0) return 0;

    let stored = 0;
    for (const row of rows) {
      const result = await db
        .insert(gmailInsightsTable)
        .values(row)
        .onConflictDoUpdate({
          target: [
            gmailInsightsTable.userId,
            gmailInsightsTable.gmailMessageId,
            gmailInsightsTable.fingerprint,
          ],
          set: {
            gmailThreadId: row.gmailThreadId,
            type: row.type,
            category: row.category,
            title: row.title,
            merchantName: row.merchantName,
            merchantDomain: row.merchantDomain,
            amountValue: row.amountValue,
            currency: row.currency,
            billingCycle: row.billingCycle,
            issuedAt: row.issuedAt,
            paidAt: row.paidAt,
            dueDate: row.dueDate,
            renewalDate: row.renewalDate,
            serviceDate: row.serviceDate,
            status: row.status,
            summary: row.summary,
            confidence: row.confidence,
            raw: row.raw,
            updatedAt: row.updatedAt,
          },
        })
        .returning({ id: gmailInsightsTable.id });
      stored += result.length;
    }
    return stored;
  },

  async findAll(
    userId: string,
    filter: ListInsightsFilter
  ): Promise<{ items: GmailInsight[]; total: number }> {
    const conditions = [eq(gmailInsightsTable.userId, userId)];
    if (filter.type) conditions.push(eq(gmailInsightsTable.type, filter.type));
    if (filter.category) conditions.push(eq(gmailInsightsTable.category, filter.category));
    const where = and(...conditions);

    const offset = (filter.page - 1) * filter.perPage;
    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(gmailInsightsTable)
        .where(where)
        .orderBy(desc(gmailInsightsTable.createdAt))
        .limit(filter.perPage)
        .offset(offset),
      db.select({ value: count() }).from(gmailInsightsTable).where(where),
    ]);

    return {
      items: rows.map(toInsight),
      total: Number(totals[0]?.value ?? 0),
    };
  },

  async findAllForStats(userId: string): Promise<GmailInsight[]> {
    const rows = await db
      .select()
      .from(gmailInsightsTable)
      .where(eq(gmailInsightsTable.userId, userId))
      .orderBy(desc(gmailInsightsTable.createdAt));
    return rows.map(toInsight);
  },

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(gmailInsightsTable).where(eq(gmailInsightsTable.userId, userId));
  },

  async countByUser(userId: string): Promise<number> {
    const totals = await db
      .select({ value: count() })
      .from(gmailInsightsTable)
      .where(eq(gmailInsightsTable.userId, userId));
    return Number(totals[0]?.value ?? 0);
  },

  async sumMonthlyRecurring(userId: string): Promise<number> {
    const rows = await db
      .select({
        amount: gmailInsightsTable.amountValue,
        cycle: gmailInsightsTable.billingCycle,
      })
      .from(gmailInsightsTable)
      .where(
        and(
          eq(gmailInsightsTable.userId, userId),
          eq(gmailInsightsTable.type, 'subscription'),
          sql`${gmailInsightsTable.amountValue} IS NOT NULL`
        )
      );

    let total = 0;
    for (const row of rows) {
      const amount = Number(row.amount ?? 0);
      if (!Number.isFinite(amount)) continue;
      switch (row.cycle) {
        case 'monthly':
          total += amount;
          break;
        case 'yearly':
          total += amount / 12;
          break;
        case 'weekly':
          total += amount * (52 / 12);
          break;
        case 'quarterly':
          total += amount / 3;
          break;
        default:
          break;
      }
    }
    return Math.round(total * 100) / 100;
  },
};
