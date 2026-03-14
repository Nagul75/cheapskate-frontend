import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, Target } from "lucide-react";

import {
  type Budget,
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/api/budgets";
import { BudgetFormModal, type BudgetFormValues } from "@/components/BudgetFormModal";
import { DeleteBudgetDialog } from "@/components/DeleteBudgetDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatCurrency";

export function BudgetsPage() {
  // Default to current month/year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: budgetsData, isLoading } = useBudgets({ month: selectedMonth, year: selectedYear });
  const budgets = budgetsData?.budgets || [];

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Budget | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

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

  const openCreate = () => {
    setFormMode("create");
    setSelected(null);
    setFormOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setFormMode("edit");
    setSelected(budget);
    setFormOpen(true);
  };

  const askDelete = (budget: Budget) => {
    setDeleteId(budget.id);
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

  const selectedBudget = budgets.find(budget => budget.id === deleteId);

  // Debug: Log account data to see what's coming from backend
  console.log("Budgets with account data:", budgets.map(b => ({
    id: b.id,
    description: b.description,
    accountId: b.accountId,
    account: b.account,
    currency: b.account?.currency
  })));

  const budgetsWithProgress = budgets.map(budget => {
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

  const totalBudgeted = budgetsWithProgress.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
  const totalSpent = budgetsWithProgress.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        
        <div className="flex gap-2">
          {/* Month/Year Filters */}
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
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
            <SelectTrigger className="w-24">
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

          <Button type="button" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Add Budget
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budgeted</CardTitle>
            <Target className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-blue-600">
              {formatCurrency(totalBudgeted)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-green-600">
              {formatCurrency(totalSpent)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
            <Target className="h-5 w-5 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-mono ${totalRemaining >= 0 ? 'text-foreground' : 'text-red-600'}`}>
              {formatCurrency(totalRemaining)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      {isLoading ? (
        <div className="text-center py-8">Loading budgets...</div>
      ) : budgetsWithProgress.length === 0 ? (
        <Card className="text-center py-8 rounded-none">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No budgets yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgetsWithProgress.map((budget) => (
            <Card key={budget.id} className="rounded-none hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-3">
                  <div>
                    <CardTitle className="text-base">
                      {budget.description || budget.category?.name || "Untitled Budget"}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {budget.category && (
                        <Badge variant="outline" className="text-xs">
                          {budget.category.name}
                        </Badge>
                      )}
                      {budget.account && (
                        <Badge variant="secondary" className="text-xs">
                          {budget.account.name} ({budget.account.currency})
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {months.find(m => m.value === budget.month)?.label} {budget.year}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {budget.isOverBudget && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
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
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className={`text-sm font-medium ${
                      budget.isOverBudget ? 'text-red-600' : 'text-foreground'
                    }`}>
                      {formatCurrency(budget.spent, budget.account?.currency || 'USD')} / {formatCurrency(parseFloat(budget.amount), budget.account?.currency || 'USD')}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(budget.percentage, 100)} 
                    className="h-2"
                    indicatorClassName={budget.isOverBudget ? "bg-red-500" : budget.percentage >= 80 ? "bg-amber-500" : "bg-green-500"}
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className={budget.isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>
                      {budget.percentage.toFixed(1)}% used
                    </span>
                    <span className={budget.isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>
                      {budget.isOverBudget 
                        ? `${formatCurrency(Math.abs(budget.remaining), budget.account?.currency || 'USD')} over` 
                        : `${formatCurrency(budget.remaining, budget.account?.currency || 'USD')} remaining`
                      }
                    </span>
                  </div>
                  {budget.isOverBudget && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      Over budget!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
        budgetDescription={selectedBudget?.description || selectedBudget?.category?.name || "Untitled Budget"}
      />
    </div>
  );
}
