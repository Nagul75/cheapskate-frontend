import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";

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

  const noAccounts =
    !accountsLoading && !accountsError && (accountsData?.accounts.length ?? 0) === 0;
  const showAccountsWarning = accountsError || noAccounts;

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = useCreateTransaction(filters);
  const updateMutation = useUpdateTransaction(filters);
  const deleteMutation = useDeleteTransaction(filters);

  const sorted = useMemo(() => {
    const copy = [...transactions];
    copy.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortKey === "date") {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else {
        aVal = Number(a.amount);
        bVal = Number(b.amount);
      }

      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return copy;
  }, [transactions, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setFormMode("create");
    setSelected(null);
    setFormOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setFormMode("edit");
    setSelected(tx);
    setFormOpen(true);
  };

  const askDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmitForm = async (values: TransactionFormValues) => {
    if (formMode === "create") {
      await createMutation.mutateAsync(values);
    } else if (selected) {
      await updateMutation.mutateAsync({
        ...values,
        id: selected.id,
      });
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

    const csv =
      header.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            disabled={accountsLoading || showAccountsWarning}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {showAccountsWarning && (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 text-amber-900 px-3 py-2 text-sm dark:bg-amber-950/20 dark:text-amber-100 dark:border-amber-500/50">
          {accountsError
            ? "Could not load accounts. You need at least one account before adding transactions."
            : "No accounts found. You need at least one account before adding transactions."}{" "}
          <a href="#" className="underline underline-offset-4">
            Create an account
          </a>
          .
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-between flex-wrap items-end gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Type</span>
          <Select
            value={filters.type ?? "all"}
            onValueChange={(value) => {
              const typedValue =
                value === "all"
                  ? undefined
                  : (value as Extract<TransactionType, "INCOME" | "EXPENSE">);
              setFilters((prev) => ({
                ...prev,
                type: typedValue,
              }));
            }}
          >
            <SelectTrigger className="w-32">
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
          <span className="text-xs text-muted-foreground">Start date</span>
          <Input
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">End date</span>
          <Input
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value || undefined,
              }))
            }
          />
        </div>
        </div>


        <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Sort by</span>
        <Select
          value={sortKey}
          onValueChange={(value) => setSortKey(value as SortKey)}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortDir}
          onValueChange={(value) => setSortDir(value as SortDir)}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>

      {/* Table */}
      <div className="border border-border/60 rounded-xl bg-card/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-22.5">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-16 hidden sm:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No transactions found.</TableCell>
              </TableRow>
            ) : (
              pageItems.map((t, index) => (
                <TableRow
                  key={t.id}
                  className={`hover:bg-muted/60 ${
                    index % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                  }`}
                >
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {format(new Date(t.date), "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell max-w-xs truncate text-muted-foreground">
                    {t.description}
                  </TableCell>
                  <TableCell className="max-w-35 truncate">
                    {t.category?.name}
                  </TableCell>
                  <TableCell className="max-w-35 truncate">
                    {t.account?.name}
                  </TableCell>
                  <TableCell
                    className={`${
                      t.type == "EXPENSE"
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    } font-medium`}
                  >
                    {t.type}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {t.type === "EXPENSE" ? "-" : "+"}
                    {Number(t.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex justify-end gap-1">
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
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

