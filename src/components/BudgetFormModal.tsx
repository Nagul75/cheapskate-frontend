import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PiggyBank, Pencil } from "lucide-react";
import {
  type Budget,
  type CreateBudgetInput,
  type UpdateBudgetInput,
  createBudgetSchema,
  updateBudgetSchema,
} from "@/api/budgets";
import { useCategories } from "@/api/categories";
import { useAccounts } from "@/api/accounts";

export type BudgetFormValues = CreateBudgetInput | UpdateBudgetInput;

interface BudgetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Budget | null;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  loading?: boolean;
}

const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD_ERROR = "text-xs text-destructive mt-1";

export function BudgetFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading = false,
}: BudgetFormModalProps) {
  const form = useForm<any>({
    resolver: zodResolver(mode === "create" ? createBudgetSchema : updateBudgetSchema),
    defaultValues: {
      description: "",
      categoryId: "",
      accountId: "",
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  const { data: categoriesData } = useCategories();
  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.accounts || [];

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      form.reset({
        description: initial.description || "",
        categoryId: initial.categoryId || "",
        accountId: initial.accountId,
        amount: parseFloat(initial.amount),
        month: initial.month,
        year: initial.year,
      });
    } else if (mode === "create") {
      form.reset({
        description: "",
        categoryId: "",
        accountId: "",
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  }, [open, mode, initial, form]);

  const handleSubmit = async (values: any) => {
    await onSubmit(values);
    if (mode === "create") {
      form.reset();
    }
  };

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

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  const Icon = mode === "create" ? PiggyBank : Pencil;
  const title = mode === "create" ? "Create Budget" : "Edit Budget";
  const subtitle =
    mode === "create"
      ? "Set a spending limit for a category and period."
      : "Update the details of this budget entry.";

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
          id="budget-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="px-6 pt-5 pb-4 space-y-4"
        >
          <Field>
            <FieldLabel className={FIELD_LABEL}>Description</FieldLabel>
            <Input
              className="mt-1.5"
              placeholder="e.g. Monthly groceries"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className={FIELD_ERROR}>{form.formState.errors.description?.message as string}</p>
            )}
          </Field>

          <Separator />

          <Field>
            <FieldLabel className={FIELD_LABEL}>Account</FieldLabel>
            <Select
              value={form.watch("accountId") || ""}
              onValueChange={(value) => form.setValue("accountId", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId && (
              <p className={FIELD_ERROR}>{form.formState.errors.accountId?.message as string}</p>
            )}
          </Field>

          <Field>
            <FieldLabel className={FIELD_LABEL}>Category</FieldLabel>
            <Select
              value={form.watch("categoryId") || ""}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData &&
                  [...categoriesData.default, ...categoriesData.custom].map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className={FIELD_ERROR}>{form.formState.errors.categoryId?.message as string}</p>
            )}
          </Field>

          <Separator />

          <Field>
            <FieldLabel className={FIELD_LABEL}>Budget Amount</FieldLabel>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="mt-1.5"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className={FIELD_ERROR}>{form.formState.errors.amount?.message as string}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel className={FIELD_LABEL}>Month</FieldLabel>
              <Select
                value={form.watch("month")?.toString()}
                onValueChange={(value) => form.setValue("month", parseInt(value))}
              >
                <SelectTrigger className="mt-1.5">
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
              {form.formState.errors.month && (
                <p className={FIELD_ERROR}>{form.formState.errors.month?.message as string}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className={FIELD_LABEL}>Year</FieldLabel>
              <Select
                value={form.watch("year")?.toString()}
                onValueChange={(value) => form.setValue("year", parseInt(value))}
              >
                <SelectTrigger className="mt-1.5">
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
              {form.formState.errors.year && (
                <p className={FIELD_ERROR}>{form.formState.errors.year?.message as string}</p>
              )}
            </Field>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="budget-form"
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
              "Create Budget"
            ) : (
              "Update Budget"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
