import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock, Layers, Repeat, Wallet } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import {
  ConnectGmailCard,
  SpendByCategoryChart,
  StatCard,
  SubscriptionsList,
  SyncControls,
  UpcomingRemindersList,
  useGmailStats,
  useGmailStatus,
} from '@/features/gmail';

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const statusQuery = useGmailStatus();
  const connected = statusQuery.data?.connected === true;
  const statsQuery = useGmailStats(connected);

  useEffect(() => {
    if (params.get('gmail') === 'connected') {
      toast.success('Gmail connected');
      const next = new URLSearchParams(params);
      next.delete('gmail');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  if (statusQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-sm text-red-600">
          {statusQuery.error instanceof Error
            ? statusQuery.error.message
            : 'Failed to load Gmail status'}
        </p>
      </div>
    );
  }

  if (!connected || !statusQuery.data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-sm text-slate-500 mb-8">
          Connect Gmail to see bills, subscriptions, and upcoming deadlines.
        </p>
        <ConnectGmailCard />
      </div>
    );
  }

  const stats = statsQuery.data;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Insights extracted from your connected Gmail inbox.
        </p>
      </div>

      <SyncControls connection={statusQuery.data} />

      {statsQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : statsQuery.isError ? (
        <p className="text-sm text-red-600">
          {statsQuery.error instanceof Error
            ? statsQuery.error.message
            : 'Failed to load stats'}
        </p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Items extracted"
              value={String(stats.totalItems)}
              hint="Across all email insights"
              icon={Layers}
            />
            <StatCard
              label="Monthly recurring"
              value={formatMoney(stats.monthlyRecurringTotal, stats.currency)}
              hint="Normalized subscriptions"
              icon={Repeat}
            />
            <StatCard
              label="Categories"
              value={String(stats.spendByCategory.length)}
              hint="With spend detected"
              icon={Wallet}
            />
            <StatCard
              label="Upcoming"
              value={String(stats.upcomingReminders.length)}
              hint="Due / renewal / expiry"
              icon={CalendarClock}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpendByCategoryChart
              data={stats.spendByCategory}
              currency={stats.currency}
            />
            <UpcomingRemindersList items={stats.upcomingReminders} />
          </div>

          <SubscriptionsList items={stats.subscriptions} />
        </>
      ) : null}
    </div>
  );
}
