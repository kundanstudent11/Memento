import { gmailInsightRepository } from './gmail-insight.repository';
import { getGmailConnectionStatus } from './gmail.oauth.service';
import type {
  GmailItemType,
  GmailSpendByCategory,
  GmailStats,
  GmailTopMerchant,
  SpendingCategory,
} from '@shared/types';

/**
 * Computes dashboard stats from stored Gmail insights.
 */
export async function getGmailStats(userId: string): Promise<GmailStats> {
  const [insights, connection, monthlyRecurringTotal] = await Promise.all([
    gmailInsightRepository.findAllForStats(userId),
    getGmailConnectionStatus(userId),
    gmailInsightRepository.sumMonthlyRecurring(userId),
  ]);

  const totalsByType: Partial<Record<GmailItemType, number>> = {};
  const spendMap = new Map<SpendingCategory, { total: number; count: number; currency: string }>();
  const merchantMap = new Map<
    string,
    { name: string; domain: string | null; total: number; count: number; currency: string }
  >();

  let defaultCurrency = 'USD';

  for (const insight of insights) {
    totalsByType[insight.type] = (totalsByType[insight.type] ?? 0) + 1;

    if (insight.amount) {
      defaultCurrency = insight.amount.currency || defaultCurrency;
      const cat = spendMap.get(insight.category) ?? {
        total: 0,
        count: 0,
        currency: insight.amount.currency,
      };
      cat.total += insight.amount.value;
      cat.count += 1;
      spendMap.set(insight.category, cat);

      if (insight.merchant) {
        const key = insight.merchant.domain ?? insight.merchant.name;
        const merchant = merchantMap.get(key) ?? {
          name: insight.merchant.name,
          domain: insight.merchant.domain,
          total: 0,
          count: 0,
          currency: insight.amount.currency,
        };
        merchant.total += insight.amount.value;
        merchant.count += 1;
        merchantMap.set(key, merchant);
      }
    }
  }

  const spendByCategory: GmailSpendByCategory[] = [...spendMap.entries()]
    .map(([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      currency: data.currency,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  const topMerchants: GmailTopMerchant[] = [...merchantMap.values()]
    .map((m) => ({
      name: m.name,
      domain: m.domain,
      total: Math.round(m.total * 100) / 100,
      currency: m.currency,
      count: m.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const subscriptions = insights
    .filter((i) => i.type === 'subscription')
    .map((i) => ({
      id: i.id,
      title: i.title,
      merchant: i.merchant,
      amount: i.amount,
      billingCycle: i.billingCycle,
      renewalDate: i.dates.renewalDate,
      status: i.status,
    }))
    .slice(0, 20);

  const now = Date.now();
  const upcomingReminders = insights
    .flatMap((insight) =>
      insight.reminders.map((reminder) => ({
        insightId: insight.id,
        kind: reminder.kind,
        date: reminder.date,
        label: reminder.label,
        title: insight.title,
      }))
    )
    .filter((r) => {
      const t = Date.parse(r.date);
      return Number.isFinite(t) && t >= now - 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, 20);

  return {
    totalsByType,
    totalItems: insights.length,
    monthlyRecurringTotal,
    currency: defaultCurrency,
    spendByCategory,
    topMerchants,
    subscriptions,
    upcomingReminders,
    lastSyncedAt: connection.lastSyncedAt,
  };
}
