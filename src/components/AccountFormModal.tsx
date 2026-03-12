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
  type Account,
  type CreateAccountInput,
  type UpdateAccountInput,
  createAccountSchema,
  updateAccountSchema,
} from "@/api/accounts";

export type AccountFormValues = CreateAccountInput | UpdateAccountInput;

interface AccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Account | null;
  onSubmit: (values: AccountFormValues) => Promise<void>;
  loading?: boolean;
}

export function AccountFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  loading = false,
}: AccountFormModalProps) {
  const form = useForm<any>({
    resolver: zodResolver(mode === "create" ? createAccountSchema : updateAccountSchema),
    defaultValues: {
      name: "",
      type: "CHECKING",
      currency: "INR",
      ...(mode === "create" && { balance: 0 }),
    },
  });

  useEffect(() => {
    if (!open) return;
    
    if (initial && mode === "edit") {
      form.reset({
        name: initial.name,
        type: initial.type,
        currency: initial.currency,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        type: "CHECKING",
        currency: "INR",
        balance: 0,
      });
    }
  }, [open, mode, initial, form]);

  const handleSubmit = async (values: any) => {
    await onSubmit(values);
    if (mode === "create") {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Account" : "Edit Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Account Name</FieldLabel>
            <Input
              placeholder="Enter account name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name?.message as string}</p>
            )}
          </Field>

          <Field>
            <FieldLabel>Account Type</FieldLabel>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKING">Checking</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-600">{form.formState.errors.type?.message as string}</p>
            )}
          </Field>

          {mode === "create" && (
            <Field>
              <FieldLabel>Initial Balance</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("balance", { valueAsNumber: true })}
              />
              {form.formState.errors.balance && (
                <p className="text-sm text-red-600">{form.formState.errors.balance?.message as string}</p>
              )}
            </Field>
          )}

          <Field>
            <FieldLabel>Currency</FieldLabel>
            <Select
              value={form.watch("currency")}
              onValueChange={(value) => form.setValue("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.currency && (
              <p className="text-sm text-red-600">{form.formState.errors.currency?.message as string}</p>
            )}
          </Field>

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
