import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import type { Transaction, TransactionType } from "@/api/transactions";
import { useCategories } from "@/api/categories";
import { useAccounts } from "@/api/accounts";

export type TransactionFormValues = {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date;
};

const transactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z
    .number()
    .positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  date: z.date(),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Transaction | null;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
  loading: boolean;
};

export function TransactionFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading,
}: Props) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: "",
      categoryId: "",
      amount: 0,
      type: "EXPENSE",
      description: "",
      date: new Date(),
    },
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      form.reset({
        accountId: initial.accountId,
        categoryId: initial.categoryId,
        amount: Number(initial.amount),
        type: initial.type as TransactionType,
        description: initial.description ?? "",
        date: new Date(initial.date),
      });
    } else if (mode === "create") {
      form.reset({
        accountId: "",
        categoryId: "",
        amount: 0,
        type: "EXPENSE",
        description: "",
        date: new Date(),
      });
    }
  }, [open, mode, initial, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const dateValue = form.watch("date");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add transaction" : "Edit transaction"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new income or expense transaction."
              : "Update the selected transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field>
            <FieldLabel>
              Account
            </FieldLabel>
            <Select
              value={form.watch("accountId")}
              onValueChange={(value) => form.setValue("accountId", value)}
              disabled={accountsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
              </SelectTrigger>
              <SelectContent>
                {accountsData &&
                  accountsData.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>
              Category
            </FieldLabel>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categoriesData &&
                  [...categoriesData.default, ...categoriesData.custom].map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>
              Type
            </FieldLabel>
            <Select
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as TransactionType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>
              Amount
            </FieldLabel>
            <Input
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </Field>

          <Field>
            <FieldLabel>
              Date
            </FieldLabel>
            <Input
              type="date"
              value={dateValue ? dateValue.toISOString().slice(0, 10) : ""}
              onChange={(e) =>
                form.setValue("date", new Date(e.target.value || new Date()))
              }
            />
          </Field>

          <Field>
            <FieldLabel>
              Description
            </FieldLabel>
            <Input placeholder="Optional" {...form.register("description")} />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Add transaction"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

