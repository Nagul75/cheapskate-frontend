import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSummary, useSummaryByCategory, useSummaryOverTime } from "@/api/dashboard";
import { Loader2 } from "lucide-react";
import { SummaryCards } from "@/components/SummaryCards";
import { CategorySpending } from "@/components/CategorySpending";
import { TimeChart } from "@/components/TimeChart";
import { BiggestExpenseCard } from "@/components/BiggestExpenseCard";
import { useAccounts } from "@/api/accounts";
import { formatCurrency } from "@/lib/formatCurrency";

export function Dashboard() {
  // Default to current month/year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

  const {
    data: accountsData,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccounts();

  const accounts = accountsData?.accounts || [];
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
  const selectedCurrency = selectedAccount?.currency || "USD";

  // Auto-select first account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const noAccounts =
    !accountsLoading && !accountsError && (accountsData?.accounts.length ?? 0) === 0;
  const showAccountsWarning = accountsError || noAccounts;

  const { data: summary, isLoading: loading, error } = useSummary(selectedMonth, selectedYear, selectedAccountId);
  const { data: categoryData, isLoading: categoryLoading } = useSummaryByCategory(selectedMonth, selectedYear, selectedAccountId);
  const { data: timeData, isLoading: timeLoading } = useSummaryOverTime(startDate, endDate, selectedAccountId, granularity);

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

  const formatCurrencyWithSelected = (amount: number) => {
    return formatCurrency(amount, selectedCurrency);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            disabled={accountsLoading || accounts.length === 0}
          >
            <SelectTrigger className="w-full sm:w-40 bg-card">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
            disabled={!selectedAccountId}
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
            disabled={!selectedAccountId}
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
            disabled={!selectedAccountId}
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
          <a href="/app/accounts" className="underline underline-offset-4">
            Create an account
          </a>
          .
        </div>
      )}
      
      {!selectedAccountId && accounts.length > 0 && (
        <div className="mt-3 rounded-lg border border-blue-300/60 bg-blue-50 text-blue-900 px-3 py-2 text-sm dark:bg-blue-950/20 dark:text-blue-100 dark:border-blue-500/50">
          Please select an account to view dashboard insights.
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
        <SummaryCards summary={summary} formatCurrency={formatCurrencyWithSelected} />
      ) : null}

      {/* Spending by Category */}
      {categoryLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : categoryData ? (
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="md:flex-[0.7]">
            <CategorySpending categoryData={categoryData} fmt={(n) => formatCurrencyWithSelected(n)} />
          </div>
          <div className="md:flex-[0.3]">
            <BiggestExpenseCard categoryData={categoryData} fmt={(n) => formatCurrencyWithSelected(n)} />
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
          formatCurrency={formatCurrencyWithSelected}
        />
      ) : null}
    </div>
  );
}