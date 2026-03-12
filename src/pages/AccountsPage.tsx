import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet, TrendingUp, CreditCard, PiggyBank } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { convertToBaseCurrency, formatBaseCurrency } from "@/lib/exchangeRates";
import { formatCurrency } from "@/lib/formatCurrency";

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case "CHECKING":
      return Wallet;
    case "SAVINGS":
      return PiggyBank;
    case "CREDIT":
      return CreditCard;
    default:
      return Wallet;
  }
};

const getAccountTypeColor = (type: AccountType) => {
  switch (type) {
    case "CHECKING":
      return "text-blue-600 bg-blue-50 dark:bg-blue-900/10";
    case "SAVINGS":
      return "text-green-600 bg-green-50 dark:bg-green-900/10";
    case "CREDIT":
      return "text-purple-600 bg-purple-50 dark:bg-purple-900/10";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-900/10";
  }
};

export function AccountsPage() {
  const { data: accountsData, isLoading } = useAccounts();
  const accounts = accountsData?.accounts || [];

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Account | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const netWorth = accounts.reduce(
    (total, account) => {
      const balance = parseFloat(account.balance);
      const convertedBalance = convertToBaseCurrency(balance, account.currency);
      return total + convertedBalance;
    },
    0
  );

  const openCreate = () => {
    setFormMode("create");
    setSelected(null);
    setFormOpen(true);
  };

  const openEdit = (account: Account) => {
    setFormMode("edit");
    setSelected(account);
    setFormOpen(true);
  };

  const askDelete = (account: Account) => {
    setDeleteId(account.id);
    setDeleteOpen(true);
  };

  const handleSubmitForm = async (values: AccountFormValues) => {
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

  const selectedAccount = accounts.find(acc => acc.id === deleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button type="button" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Add Account
        </Button>
      </div>

      {/* Net Worth Card */}
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Net Worth
          </CardTitle>
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono text-blue-900 dark:text-blue-100">
            {formatBaseCurrency(netWorth)}
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Total across {accounts.length} account{accounts.length !== 1 ? "s" : ""} (converted to USD)
          </p>
        </CardContent>
      </Card>

      {/* Account Cards */}
      {isLoading ? (
        <div className="text-center py-8">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <Card className="text-center py-8 rounded-none">
          <CardContent>
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No accounts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first account to start tracking your finances
            </p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const colorClass = getAccountTypeColor(account.type);
            const balance = parseFloat(account.balance);
            
            return (
              <Card key={account.id} className="hover:shadow-md duration-200 hover:rounded-l-md rounded-none hover:border-l-4 hover:border-l-chart-1 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
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
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-mono ${balance >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                    {formatCurrency(balance, account.currency)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {account.currency}
                  </p>
                </CardContent>
              </Card>
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
