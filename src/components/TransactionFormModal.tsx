import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, Pencil } from "lucide-react";
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
  amount: z.number().positive("Amount must be greater than 0"),
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

const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD_ERROR = "text-xs text-destructive mt-1";

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
  const Icon = mode === "create" ? ArrowLeftRight : Pencil;
  const title = mode === "create" ? "Add Transaction" : "Edit Transaction";
  const subtitle =
    mode === "create"
      ? "Record a new income or expense transaction."
      : "Update the details of this transaction.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-0 p-0 overflow-hidden">
        {/* Tinted header */}
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground ml-11">{subtitle}</p>
        </div>

        {/* Form body */}
        <form
          id="transaction-form"
          onSubmit={handleSubmit}
          className="px-6 pt-5 pb-4 space-y-4"
        >
          {/* Account + Category */}
          <Field>
            <FieldLabel className={FIELD_LABEL}>Account</FieldLabel>
            <Select
              value={form.watch("accountId")}
              onValueChange={(value) => form.setValue("accountId", value)}
              disabled={accountsLoading}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={accountsLoading ? "Loading…" : "Select account"} />
              </SelectTrigger>
              <SelectContent>
                {accountsData?.accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId && (
              <p className={FIELD_ERROR}>{form.formState.errors.accountId.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className={FIELD_LABEL}>Category</FieldLabel>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
              disabled={categoriesLoading}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={categoriesLoading ? "Loading…" : "Select category"} />
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
            {form.formState.errors.categoryId && (
              <p className={FIELD_ERROR}>{form.formState.errors.categoryId.message}</p>
            )}
          </Field>

          <Separator />

          {/* Type + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel className={FIELD_LABEL}>Type</FieldLabel>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value as TransactionType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className={FIELD_ERROR}>{form.formState.errors.type.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className={FIELD_LABEL}>Amount</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="mt-1.5"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className={FIELD_ERROR}>{form.formState.errors.amount.message}</p>
              )}
            </Field>
          </div>

          {/* Date + Description */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel className={FIELD_LABEL}>Date</FieldLabel>
              <Input
                type="date"
                className="mt-1.5"
                value={dateValue ? dateValue.toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  form.setValue("date", new Date(e.target.value || new Date()))
                }
              />
              {form.formState.errors.date && (
                <p className={FIELD_ERROR}>{form.formState.errors.date.message as string}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className={FIELD_LABEL}>Description</FieldLabel>
              <Input
                className="mt-1.5"
                placeholder="Optional"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className={FIELD_ERROR}>{form.formState.errors.description.message}</p>
              )}
            </Field>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="transaction-form"
            size="sm"
            className="cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Saving…
              </span>
            ) : mode === "create" ? (
              "Add Transaction"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}