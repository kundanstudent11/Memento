import { Card } from '@/components/ui/Card';
import type { GmailUpcomingReminder } from '@shared/types';

type UpcomingRemindersListProps = {
  items: GmailUpcomingReminder[];
};

export function UpcomingRemindersList({ items }: UpcomingRemindersListProps) {
  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Upcoming reminders</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming deadlines found.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={`${item.insightId}-${item.date}-${item.kind}`}
              className="rounded-lg border border-slate-100 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                <span className="text-xs uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {item.kind}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
