import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet, CircleCheck, CreditCard, PiggyBank, Landmark } from "lucide-react";

import {
  type Account,
  type AccountType,
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/api/accounts";
import { AccountFormModal, type AccountFormValues } from "@/components/AccountFormModal";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { convertToBaseCurrency, formatBaseCurrency } from "@/lib/exchangeRates";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

const getAccountMeta = (type: AccountType) => {
  switch (type) {
    case "CHECKING":
      return { icon: Wallet,     label: "Checking", color: "text-blue-500",  tile: "bg-blue-500/10  border-blue-500/20"  };
    case "SAVINGS":
      return { icon: PiggyBank,  label: "Savings",  color: "text-green-500", tile: "bg-green-500/10 border-green-500/20" };
    case "CREDIT":
      return { icon: CreditCard, label: "Credit",   color: "text-amber-500", tile: "bg-amber-500/10 border-amber-500/20" };
    default:
      return { icon: Landmark,   label: type,       color: "text-muted-foreground", tile: "bg-muted border-border" };
  }
};

export function AccountsPage() {
  const { data: accountsData, isLoading } = useAccounts();
  const accounts = accountsData?.accounts || [];

  const [formOpen, setFormOpen]   = useState(false);
  const [formMode, setFormMode]   = useState<"create" | "edit">("create");
  const [selected, setSelected]   = useState<Account | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const netWorth = accounts.reduce((total, account) => {
    return total + convertToBaseCurrency(parseFloat(account.balance), account.currency);
  }, 0);

  const openCreate = () => { setFormMode("create"); setSelected(null); setFormOpen(true); };
  const openEdit   = (a: Account) => { setFormMode("edit"); setSelected(a); setFormOpen(true); };
  const askDelete  = (a: Account) => { setDeleteId(a.id); setDeleteOpen(true); };

  const handleSubmitForm = async (values: AccountFormValues) => {
    if (formMode === "create") {
      await createMutation.mutateAsync(values as any);
    } else if (selected) {
      await updateMutation.mutateAsync({ id: selected.id, data: values as any });
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteOpen(false);
  };

  const selectedAccount = accounts.find((a) => a.id === deleteId);

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Finance
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      {/* ── Net Worth banner ── */}
      {(() => {
        const byType = ["CHECKING", "SAVINGS", "CREDIT"].map((type) => {
          const accs = accounts.filter((a) => a.type === type);
          const total = accs.reduce((s, a) => s + convertToBaseCurrency(parseFloat(a.balance), a.currency), 0);
          return { type, total };
        });
        const maxAbs = Math.max(...byType.map((b) => Math.abs(b.total)), 1);
        const positiveCount = accounts.filter((a) => parseFloat(a.balance) >= 0).length;
 
        const typeConfig: Record<string, { label: string; barColor: string; negColor: string }> = {
          CHECKING: { label: "Checking", barColor: "bg-blue-500",  negColor: "bg-destructive" },
          SAVINGS:  { label: "Savings",  barColor: "bg-green-500", negColor: "bg-destructive" },
          CREDIT:   { label: "Credit",   barColor: "bg-amber-500", negColor: "bg-destructive" },
        };
 
        return (
          <div className="overflow-hidden rounded-sm border border-border bg-card">
            {/* Main row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
              {/* Left — headline figures */}
              <div className="px-6 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Net Worth
                </p>
                <p className="font-mono text-4xl font-semibold tracking-tight leading-none mb-5">
                  {formatBaseCurrency(netWorth)}
                </p>
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Accounts</p>
                    <p className="text-sm font-semibold">{accounts.length}</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Base currency</p>
                    <p className="text-sm font-semibold">USD</p>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">Positive</p>
                    <p className={cn("text-sm font-semibold", positiveCount === accounts.length ? "text-green-600 dark:text-green-400" : "text-foreground")}>
                      {positiveCount} of {accounts.length}
                    </p>
                  </div>
                </div>
              </div>
 
              {/* Right — breakdown panel */}
              <div className="border-t sm:border-t-0 sm:border-l border-border bg-muted/40 px-5 py-5 min-w-[180px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                  By type
                </p>
                <div className="space-y-3">
                  {byType.map(({ type, total }) => {
                    const cfg = typeConfig[type];
                    const pct = Math.round((Math.abs(total) / maxAbs) * 100);
                    const isNeg = total < 0;
                    return (
                      <div key={type}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{cfg.label}</span>
                          <span className={cn("text-xs font-mono font-medium", isNeg ? "text-destructive" : "text-foreground")}>
                            {isNeg ? "−" : ""}{formatBaseCurrency(Math.abs(total))}
                          </span>
                        </div>
                        <div className="h-0.75 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", isNeg ? cfg.negColor : cfg.barColor)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
 
            {/* Footer strip */}
            <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-2">
              <CircleCheck className="h-3 w-3 text-green-500 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Balances converted to USD using live exchange rates
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Account grid / states ── */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-sm border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted mb-4">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No accounts yet</h3>
          <p className="text-xs text-muted-foreground mb-5 max-w-[220px]">
            Add your first account to start tracking your finances.
          </p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Account
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const { icon: Icon, label, color, tile } = getAccountMeta(account.type);
            const balance = parseFloat(account.balance);
            const isNegative = balance < 0;

            return (
              <div
                key={account.id}
                className="group relative flex flex-col justify-between rounded-sm border border-border bg-card px-5 py-4 transition-all duration-200 hover:border-border/80 hover:shadow-sm"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", tile)}>
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{account.name}</p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] font-medium px-1.5 py-0 h-4 rounded-sm"
                      >
                        {label}
                      </Badge>
                    </div>
                  </div>

                  {/* Action buttons — visible on hover */}
                  <div className="flex gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(account)}
                      aria-label="Edit account"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => askDelete(account)}
                      aria-label="Delete account"
                      className="hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Bottom row — balance */}
                <div>
                  <p className={cn("text-2xl font-mono font-semibold tracking-tight", isNegative ? "text-destructive" : "text-foreground")}>
                    {formatCurrency(balance, account.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{account.currency}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AccountFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initial={selected}
        onSubmit={handleSubmitForm}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        accountName={selectedAccount?.name}
      />
    </div>
  );
}