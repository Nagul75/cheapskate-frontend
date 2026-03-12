import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSummary, useSummaryByCategory, useSummaryOverTime } from "@/api/dashboard";
import { Loader2 } from "lucide-react";
import { SummaryCards } from "@/components/SummaryCards";
import { CategorySpending } from "@/components/CategorySpending";
import { TimeChart } from "@/components/TimeChart";
import { BiggestExpenseCard } from "@/components/BiggestExpenseCard";
import { useAccounts } from "@/api/accounts";

export function Dashboard() {
  // Default to current month/year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

  const {
    data: accountsData,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccounts();

  const noAccounts =
    !accountsLoading && !accountsError && (accountsData?.accounts.length ?? 0) === 0;
  const showAccountsWarning = accountsError || noAccounts;

  const { data: summary, isLoading: loading, error } = useSummary(selectedMonth, selectedYear);
  const { data: categoryData, isLoading: categoryLoading } = useSummaryByCategory(selectedMonth, selectedYear);
  const { data: timeData, isLoading: timeLoading } = useSummaryOverTime(startDate, endDate, granularity);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-full bg-card sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={granularity}
            onValueChange={(value) => setGranularity(value as 'daily' | 'weekly')}
          >
            <SelectTrigger className="w-full sm:w-28 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {showAccountsWarning && (
        <div className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50 text-amber-900 px-3 py-2 text-sm dark:bg-amber-950/20 dark:text-amber-100 dark:border-amber-500/50">
          {accountsError
            ? "Could not load accounts. You need at least one account before viewing dashboard insights."
            : "No accounts found. You need at least one account before viewing dashboard insights."}{" "}
          <a href="#" className="underline underline-offset-4">
            Create an account
          </a>
          .
        </div>
      )}
      
        {/* Summary Cards */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
          {error.message || "Failed to load summary"}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : summary ? (
        <SummaryCards summary={summary} formatCurrency={formatCurrency} />
      ) : null}

      {/* Spending by Category */}
      {categoryLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : categoryData ? (
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="md:flex-[0.7]">
            <CategorySpending categoryData={categoryData} fmt={(n) => formatCurrency(n)} />
          </div>
          <div className="md:flex-[0.3]">
            <BiggestExpenseCard categoryData={categoryData} fmt={(n) => formatCurrency(n)} />
          </div>
        </div>
      ) : null}

      {/* Income vs Expenses Over Time */}
      {timeLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : timeData ? (
        <TimeChart
          timeData={timeData}
          formatCurrency={formatCurrency}
        />
      ) : null}
    </div>
  );
}