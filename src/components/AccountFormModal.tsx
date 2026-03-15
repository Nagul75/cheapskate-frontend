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
import { Landmark, Pencil } from "lucide-react";
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

const FIELD_LABEL = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const FIELD_ERROR = "text-xs text-destructive mt-1";

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

  const Icon = mode === "create" ? Landmark : Pencil;
  const title = mode === "create" ? "Create Account" : "Edit Account";
  const subtitle =
    mode === "create"
      ? "Add a new account to track your finances."
      : "Update the details of this account.";

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
          id="account-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="px-6 pt-5 pb-4 space-y-4"
        >
          <Field>
            <FieldLabel className={FIELD_LABEL}>Account Name</FieldLabel>
            <Input
              className="mt-1.5"
              placeholder="e.g. Main Checking"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className={FIELD_ERROR}>{form.formState.errors.name?.message as string}</p>
            )}
          </Field>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel className={FIELD_LABEL}>Account Type</FieldLabel>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value as any)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHECKING">Checking</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className={FIELD_ERROR}>{form.formState.errors.type?.message as string}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className={FIELD_LABEL}>Currency</FieldLabel>
              <Select
                value={form.watch("currency")}
                onValueChange={(value) => form.setValue("currency", value)}
              >
                <SelectTrigger className="mt-1.5">
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
                <p className={FIELD_ERROR}>{form.formState.errors.currency?.message as string}</p>
              )}
            </Field>
          </div>

          {mode === "create" && (
            <>
              <Separator />
              <Field>
                <FieldLabel className={FIELD_LABEL}>Initial Balance</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1.5"
                  {...form.register("balance", { valueAsNumber: true })}
                />
                {form.formState.errors.balance && (
                  <p className={FIELD_ERROR}>{form.formState.errors.balance?.message as string}</p>
                )}
              </Field>
            </>
          )}
        </form>

        {/* Footer — flush, outside the form */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-3">
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
            form="account-form"
            size="sm"
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Saving…
              </span>
            ) : mode === "create" ? (
              "Create Account"
            ) : (
              "Update Account"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}