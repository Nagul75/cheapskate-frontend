import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Landmark,
  Target,
  CircleCheck,
} from "lucide-react";

import {
  type Budget,
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/api/budgets";
import {
  BudgetFormModal,
  type BudgetFormValues,
} from "@/components/BudgetFormModal";
import { DeleteBudgetDialog } from "@/components/DeleteBudgetDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/api/accounts";

const MONTHS = [
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

export function BudgetsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: budgetsData, isLoading } = useBudgets({
    month: selectedMonth,
    year: selectedYear,
  });
  const budgets = budgetsData?.budgets || [];

  const {data: accountsData, isLoading: accountsLoading, isError: accountsError} = useAccounts();
  const noAccounts = !accountsLoading && !accountsError && (accountsData?.accounts.length ?? 0) === 0;
  const showAccountsWarning = accountsError || noAccounts;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Budget | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const years = Array.from(
    { length: 10 },
    (_, i) => currentDate.getFullYear() - 2 + i,
  );

  const openCreate = () => {
    setFormMode("create");
    setSelected(null);
    setFormOpen(true);
  };
  const openEdit = (b: Budget) => {
    setFormMode("edit");
    setSelected(b);
    setFormOpen(true);
  };
  const askDelete = (b: Budget) => {
    setDeleteId(b.id);
    setDeleteOpen(true);
  };

  const handleSubmitForm = async (values: BudgetFormValues) => {
    if (formMode === "create") {
      await createMutation.mutateAsync(values as any);
    } else if (selected) {
      await updateMutation.mutateAsync({
        id: selected.id,
        data: values as any,
      });
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteOpen(false);
  };

  const selectedBudget = budgets.find((b) => b.id === deleteId);

  const budgetsWithProgress = budgets.map((budget) => {
    const budgetAmount = parseFloat(budget.amount);
    const spent = budget.spent || 0;
    const remaining = budget.remaining || 0;
    const percentage = budget.progress || 0;
    return {
      ...budget,
      spent,
      percentage,
      remaining,
      isOverBudget: spent > budgetAmount,
    };
  });

  const totalBudgeted = budgetsWithProgress.reduce(
    (s, b) => s + parseFloat(b.amount),
    0,
  );
  const totalSpent = budgetsWithProgress.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overBudgetCount = budgetsWithProgress.filter(
    (b) => b.isOverBudget,
  ).length;
  const overallPct =
    totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;

  const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label ?? "";

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Finance
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
            disabled={showAccountsWarning || accountsLoading}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
            disabled={showAccountsWarning || accountsLoading}
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={openCreate} disabled={accountsLoading || showAccountsWarning}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Budget
          </Button>
        </div>
      </div>

       {/* ── Accounts warning ── */}
      {showAccountsWarning && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <Landmark className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {accountsError
              ? "Could not load accounts. You need at least one account before adding budgets."
              : <>No accounts found. Please <a href="/app/accounts" className="underline underline-offset-4 font-medium">create an account</a> first.</>}
          </span>
        </div>
      )}

      {/* ── Summary banner ── */}
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
          {/* Left — headline */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              {monthLabel} {selectedYear} · Overview
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="font-mono text-4xl font-semibold tracking-tight leading-none">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-sm text-muted-foreground">
                of {formatCurrency(totalBudgeted)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              total spent this period
            </p>

            {/* Overall progress bar */}
            <div className="space-y-1.5">
              <Progress
                value={overallPct}
                className="h-1.5"
                indicatorClassName={
                  overallPct >= 100
                    ? "bg-destructive"
                    : overallPct >= 80
                      ? "bg-amber-500"
                      : "bg-green-500"
                }
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{overallPct.toFixed(1)}% of total budget used</span>
                <span
                  className={cn(totalRemaining < 0 ? "text-destructive" : "")}
                >
                  {totalRemaining >= 0
                    ? `${formatCurrency(totalRemaining)} remaining`
                    : `${formatCurrency(Math.abs(totalRemaining))} over`}
                </span>
              </div>
            </div>
          </div>

          {/* Right — stats panel */}
          <div className="border-t sm:border-t-0 sm:border-l border-border bg-muted/40 px-5 py-5 min-w-40">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
              Summary
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <p className="text-[11px] text-muted-foreground">
                  Budgets
                </p>
                <p className="text-sm font-semibold ml-1">
                    {budgetsWithProgress.length}
                </p>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center px-2">
                <p className="text-[11px] text-muted-foreground">
                  On track
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 ml-1">
                    {budgetsWithProgress.length - overBudgetCount}
                </p>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center px-2">
                <p className="text-[11px] text-muted-foreground flex items-center">
                  Over budget
                </p>
                <p
                    className={cn(
                      "text-sm font-semibold ml-1",
                      overBudgetCount > 0
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {overBudgetCount}
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-2">
          {overBudgetCount > 0 ? (
            <>
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                {overBudgetCount} budget
                {overBudgetCount !== 1 ? "s are" : " is"} over limit this period
              </p>
            </>
          ) : (
            <>
              <CircleCheck className="h-3 w-3 text-green-500 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                All budgets are within limit for {monthLabel} {selectedYear}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Budget list ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-sm border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : budgetsWithProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted mb-4">
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">
            No budgets for this period
          </h3>
          <p className="text-xs text-muted-foreground mb-5 max-w-55">
            Add a budget to start tracking your spending for {monthLabel}{" "}
            {selectedYear}.
          </p>
          <Button size="sm" onClick={openCreate} disabled={showAccountsWarning || accountsLoading}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Budget
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgetsWithProgress.map((budget) => {
            const currency = budget.account?.currency || "USD";
            const pct = budget.percentage;
            const barColor = budget.isOverBudget
              ? "bg-destructive"
              : pct >= 80
                ? "bg-amber-500"
                : "bg-green-500";

            return (
              <div
                key={budget.id}
                className="group relative rounded-sm border border-border bg-card px-5 py-4 transition-all duration-150 hover:border-border/80 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Left — title + badges */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold leading-tight">
                        {budget.description ||
                          budget.category?.name ||
                          "Untitled Budget"}
                      </p>
                      {budget.isOverBudget && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-destructive/10 border border-destructive/20 px-1.5 py-0 text-[10px] font-semibold text-destructive">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Over budget
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {budget.category && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium px-1.5 py-0 h-4 rounded-sm"
                        >
                          {budget.category.name}
                        </Badge>
                      )}
                      {budget.account && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium px-1.5 py-0 h-4 rounded-sm"
                        >
                          {budget.account.name} · {currency}
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {MONTHS.find((m) => m.value === budget.month)?.label}{" "}
                        {budget.year}
                      </span>
                    </div>
                  </div>

                  {/* Right — amounts + actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-mono font-semibold",
                          budget.isOverBudget
                            ? "text-destructive"
                            : "text-foreground",
                        )}
                      >
                        {formatCurrency(budget.spent, currency)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        of {formatCurrency(parseFloat(budget.amount), currency)}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(budget)}
                        aria-label="Edit budget"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => askDelete(budget)}
                        aria-label="Delete budget"
                        className="hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <Progress
                    value={Math.min(pct, 100)}
                    className="h-1.5"
                    indicatorClassName={barColor}
                  />
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      {pct.toFixed(1)}% used
                    </span>
                    <span
                      className={
                        budget.isOverBudget
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {budget.isOverBudget
                        ? `${formatCurrency(Math.abs(budget.remaining), currency)} over`
                        : `${formatCurrency(budget.remaining, currency)} remaining`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initial={selected}
        onSubmit={handleSubmitForm}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteBudgetDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        budgetDescription={
          selectedBudget?.description ||
          selectedBudget?.category?.name ||
          "Untitled Budget"
        }
      />
    </div>
  );
}
