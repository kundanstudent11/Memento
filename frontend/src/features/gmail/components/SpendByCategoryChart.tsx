import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import type { GmailSpendByCategory } from '@shared/types';

type SpendByCategoryChartProps = {
  data: GmailSpendByCategory[];
  currency: string;
};

export function SpendByCategoryChart({ data, currency }: SpendByCategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card padding="md">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Spend by category</h3>
        <p className="text-sm text-slate-500">No spending data yet. Run a sync.</p>
      </Card>
    );
  }

  const chartData = data.map((row) => ({
    category: row.category,
    total: row.total,
  }));

  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Spend by category</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${currency} ${value.toFixed(2)}`, 'Total']}
            />
            <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
