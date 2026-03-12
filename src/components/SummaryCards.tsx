import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SummaryData } from "@/api/dashboard";
import { MoveDown, Diff, Percent, TrendingUp} from "lucide-react";

interface SummaryCardsProps {
  summary: SummaryData;
  formatCurrency: (amount: number) => string;
}

export function SummaryCards({ summary, formatCurrency }: SummaryCardsProps) {
  if(!summary) { return null; }
  return (
    <div className="grid gap-4 md:grid-cols-4 mt-4">
      <Card className="rounded-none bg-green-50 dark:bg-green-900/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600"/>
        </CardHeader>
        <CardContent>
          <div className="text-3xl text-green-600 font-mono">
            {summary.income === 0 ? '━━' : formatCurrency(summary.income)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none bg-red-50 dark:bg-red-900/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <MoveDown className="h-5 w-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl text-red-600 dark:text-red-500/90 font-mono">
            {summary.expenses === 0 ? '━━' : formatCurrency(summary.expenses)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none bg-gray-50 dark:bg-gray-800/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net</CardTitle>
            <Diff className="h-5 w-5 text-gray-700" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono text-gray-600">
            {summary.net === 0 ? '━━' : formatCurrency(summary.net)}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings rate</CardTitle>
            <Percent className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono text-gray-600">
            {summary.net === 0 || summary.income === 0 ? '━━' : ((summary.net / summary.income) * 100).toFixed(1) + '%'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}