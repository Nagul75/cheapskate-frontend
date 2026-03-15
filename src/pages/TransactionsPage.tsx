import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Pencil, Plus, Trash2, ArrowLeftRight } from "lucide-react";

import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
  type Transaction,
  type TransactionsFilters,
  type TransactionType,
} from "@/api/transactions";
import { useAccounts } from "@/api/accounts";
import { TransactionFormModal, type TransactionFormValues } from "@/components/TransactionFormModal";
import { DeleteTransactionDialog } from "@/components/DeleteTransactionDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionsFilters>({});
  const { data: transactions = [], isLoading } = useTransactions(filters);
  const {
    data: accountsData,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccounts();

  const noAccounts = !accountsLoading && !accountsError && (accountsData?.accounts.length ?? 0) === 0;
  const showAccountsWarning = accountsError || noAccounts;

  const [page, setPage]       = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const createMutation = useCreateTransaction(filters);
  const updateMutation = useUpdateTransaction(filters);
  const deleteMutation = useDeleteTransaction(filters);

  const sorted = useMemo(() => {
    const copy = [...transactions];
    copy.sort((a, b) => {
      const aVal = sortKey === "date" ? new Date(a.date).getTime() : Number(a.amount);
      const bVal = sortKey === "date" ? new Date(b.date).getTime() : Number(b.amount);
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return copy;
  }, [transactions, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setFormMode("create"); setSelected(null); setFormOpen(true); };
  const openEdit   = (tx: Transaction) => { setFormMode("edit"); setSelected(tx); setFormOpen(true); };
  const askDelete  = (id: string) => { setDeleteId(id); setDeleteOpen(true); };

  const handleSubmitForm = async (values: TransactionFormValues) => {
    if (formMode === "create") {
      await createMutation.mutateAsync(values);
    } else if (selected) {
      await updateMutation.mutateAsync({ ...values, id: selected.id });
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteOpen(false);
  };

  const handleExportCsv = () => {
    const header = ["Date", "Description", "Category", "Account", "Type", "Amount"];
    const rows = transactions.map((t) => [
      format(new Date(t.date), "yyyy-MM-dd"),
      (t.description ?? "").replace(/"/g, '""'),
      t.category?.name ?? "",
      t.account?.name ?? "",
      t.type,
      t.amount,
    ]);
    const csv = header.join(",") + "\n" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Finance
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            disabled={accountsLoading || showAccountsWarning}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── Accounts warning ── */}
      {showAccountsWarning && (
        <div className="flex items-start gap-3 rounded-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <ArrowLeftRight className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {accountsError
              ? "Could not load accounts. You need at least one account before adding transactions."
              : "No accounts found. Please "}
            {!accountsError && (
              <a href="/app/accounts" className="underline underline-offset-4 font-medium">
                create an account
              </a>
            )}
            {!accountsError && " first."}
          </span>
        </div>
      )}

      {/* ── Filters + sort ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Type</span>
            <Select
              value={filters.type ?? "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  type: value === "all" ? undefined : (value as TransactionType),
                }))
              }
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">From</span>
            <Input
              type="date"
              className="h-8 text-xs w-36"
              value={filters.startDate ?? ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">To</span>
            <Input
              type="date"
              className="h-8 text-xs w-36"
              value={filters.endDate ?? ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined }))}
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sort by</span>
            <div className="flex gap-1.5">
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as SortDir)}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-28">Date</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Description</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Category</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Account</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Type</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">Amount</TableHead>
              <TableHead className="w-14 hidden sm:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell colSpan={7}>
                    <div className="h-4 rounded bg-muted animate-pulse w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : pageItems.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowLeftRight className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((t) => (
                <TableRow key={t.id} className="group hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(t.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell max-w-xs">
                    <span className="truncate block text-sm text-muted-foreground">
                      {t.description || <span className="italic text-muted-foreground/50">—</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    {t.category?.name ? (
                      <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-4 rounded-sm">
                        {t.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {t.account?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      t.type === "EXPENSE" ? "text-destructive" : "text-green-600 dark:text-green-400"
                    )}>
                      {t.type === "EXPENSE" ? "Exp" : "Inc"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono text-sm font-medium",
                      t.type === "EXPENSE" ? "text-destructive" : "text-green-600 dark:text-green-400"
                    )}>
                      {t.type === "EXPENSE" ? "−" : "+"}
                      {Number(t.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="sm:table-cell">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(t)}
                        aria-label="Edit transaction"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => askDelete(t.id)}
                        aria-label="Delete transaction"
                        className="hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {sorted.length > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sorted.length)} of ${sorted.length}`
            : "No results"}
        </p>
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <TransactionFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initial={selected}
        onSubmit={handleSubmitForm}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}