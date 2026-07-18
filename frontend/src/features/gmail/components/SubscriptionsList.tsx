import { Card } from '@/components/ui/Card';
import type { GmailSubscriptionSummary } from '@shared/types';

type SubscriptionsListProps = {
  items: GmailSubscriptionSummary[];
};

function formatAmount(item: GmailSubscriptionSummary): string {
  if (!item.amount) return '—';
  const cycle = item.billingCycle ? ` / ${item.billingCycle}` : '';
  return `${item.amount.currency} ${item.amount.value.toFixed(2)}${cycle}`;
}

export function SubscriptionsList({ items }: SubscriptionsListProps) {
  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Subscriptions</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No subscriptions extracted yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 truncate">
                  {item.merchant?.name ?? 'Unknown merchant'}
                  {item.renewalDate ? ` · renews ${item.renewalDate}` : ''}
                </p>
              </div>
              <p className="text-sm font-medium text-slate-700 whitespace-nowrap">
                {formatAmount(item)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
