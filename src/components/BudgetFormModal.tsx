import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
    console.log("Form values being submitted:", values);
    console.log("Mode:", mode);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Budget" : "Edit Budget"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Input
              placeholder="Enter budget description"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description?.message as string}</p>
            )}
          </Field>

          <Field>
            <FieldLabel>Account</FieldLabel>
            <Select
              value={form.watch("accountId") || ""}
              onValueChange={(value) => form.setValue("accountId", value)}
            >
              <SelectTrigger>
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
              <p className="text-sm text-red-600">{form.formState.errors.accountId?.message as string}</p>
            )}
          </Field>

          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={form.watch("categoryId") || ""}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData && [
                  ...categoriesData.default,
                  ...categoriesData.custom
                ].map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-600">{form.formState.errors.categoryId?.message as string}</p>
            )}
          </Field>

          <Field>
            <FieldLabel>Budget Amount</FieldLabel>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount?.message as string}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Month</FieldLabel>
              <Select
                value={form.watch("month")?.toString()}
                onValueChange={(value) => form.setValue("month", parseInt(value))}
              >
                <SelectTrigger>
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
                <p className="text-sm text-red-600">{form.formState.errors.month?.message as string}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Year</FieldLabel>
              <Select
                value={form.watch("year")?.toString()}
                onValueChange={(value) => form.setValue("year", parseInt(value))}
              >
                <SelectTrigger>
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
                <p className="text-sm text-red-600">{form.formState.errors.year?.message as string}</p>
              )}
            </Field>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
