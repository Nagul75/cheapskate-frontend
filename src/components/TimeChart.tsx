import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import type { TimeSummaryData } from "@/api/dashboard";

interface TimeChartProps {
  timeData: TimeSummaryData;
  formatCurrency: (amount: number) => string;
}

export function TimeChart({ timeData, formatCurrency }: TimeChartProps) {
  if (!timeData.data.length) { return null; }

  const chartData = timeData.data.map(d => ({
    ...d,
    net: d.income - d.expense,
  }));

  const formatCompactNumber = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (abs >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return value.toString();
  };

  return (
    <div className="mt-4 flex gap-4 flex-col md:flex-row">
      <Card className="flex-1 rounded-none">
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Income vs Expenses Over Time</CardTitle>
        </CardHeader>
        <CardContent className="mt-3">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                tickFormatter={(value: number) => formatCompactNumber(value)}
                width={50}
                tickMargin={10}
                tick={{ fontFamily: 'var(--font-mono)' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value?: number) => formatCurrency(value ?? 0)} 
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="flex-1 rounded-none">
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Net Savings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                tickFormatter={(value: number) => formatCompactNumber(value)}
                width={50}
                tickMargin={10}
                tick={{ fontFamily: 'var(--font-mono)' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value?: number) => formatCurrency(value ?? 0)} 
              />
              <Bar dataKey="net">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}