import { useState } from "react";
import type { AxiosError } from "axios";
import {
  Shield,
  Key,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useChangePassword } from "@/api/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/api/settings";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const changePasswordMutation = useChangePassword();

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const getErrorMessage = (error: Error | null): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<{ error: string }>;
    return (
      axiosError.response?.data?.error ??
      error.message ??
      "Failed to change password"
    );
  };

  const handlePasswordSubmit = async (values: ChangePasswordInput) => {
    try {
      await changePasswordMutation.mutateAsync(values);
      setShowPasswordDialog(false);
      passwordForm.reset();
    } catch {
      // Keep dialog open so user can correct their input
    }
  };

  return (
    <div className="max-w-2xl space-y-10">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Account
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Security Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Security
          </span>
        </div>

        {/* Password Row */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowPasswordDialog(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowPasswordDialog(true)}
          className="group relative flex items-center justify-between rounded-sm border border-border bg-card px-5 py-4 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Left: Icon + Text */}
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
              <Lock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Password</p>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium px-1.5 py-0 h-4 rounded-sm"
                >
                  Protected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last changed · Update anytime to keep your account secure
              </p>
            </div>
          </div>

          {/* Right: Action hint */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <span className="hidden sm:block font-medium">Change</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Feedback banners — shown outside dialog, below the row */}
      {changePasswordMutation.error && (
        <div className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{getErrorMessage(changePasswordMutation.error)}</span>
        </div>
      )}

      {changePasswordMutation.isSuccess && (
        <div className="flex items-start gap-3 rounded-sm border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Password updated successfully. You may need to sign in again.
          </span>
        </div>
      )}

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-100 gap-0 p-0 overflow-hidden">
          {/* Dialog Header */}
          <div className="bg-primary/5 border-b border-border p-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
                <Key className="h-3.5 w-3.5 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Change Password
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground ml-11">
              Choose a strong, unique password you don't use elsewhere.
            </p>
          </div>

          {/* Form Body */}
          <form
            id="change-password-form"
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="px-6 pt-5 pb-4 space-y-4"
          >
            <Field>
              <FieldLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current Password
              </FieldLabel>
              <Input
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive mt-1">
                  {
                    passwordForm.formState.errors.currentPassword
                      .message as string
                  }
                </p>
              )}
            </Field>

            <Separator />

            <Field>
              <FieldLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                New Password
              </FieldLabel>
              <Input
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive mt-1">
                  {passwordForm.formState.errors.newPassword.message as string}
                </p>
              )}
            </Field>

            {changePasswordMutation.error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{getErrorMessage(changePasswordMutation.error)}</span>
              </div>
            )}
          </form>

          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              size="sm"
              onClick={() => setShowPasswordDialog(false)}
              disabled={changePasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              size="sm"
              className="cursor-pointer"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Updating…
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
