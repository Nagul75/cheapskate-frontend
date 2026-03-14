import { useState } from "react";
import { Shield, Key } from "lucide-react";
import { useChangePassword } from "@/api/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/api/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function SettingsPage() {
  const changePasswordMutation = useChangePassword();

  // Password form
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handlePasswordSubmit = async (values: ChangePasswordInput) => {
    await changePasswordMutation.mutateAsync(values);
    setShowPasswordDialog(false);
    passwordForm.reset();
  };

  const openPasswordDialog = () => {
    setShowPasswordDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Password Section */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">Change your account password</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={openPasswordDialog}
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <Field>
              <FieldLabel>Current Password</FieldLabel>
              <Input
                type="password"
                placeholder="Enter current password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message as string}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>New Password</FieldLabel>
              <Input
                type="password"
                placeholder="Enter new password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message as string}</p>
              )}
            </Field>

            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success/Error Messages for Password */}
      {changePasswordMutation.error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {changePasswordMutation.error.message || "Failed to change password"}
        </div>
      )}

      {changePasswordMutation.isSuccess && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
          Password changed successfully! You may need to log in again.
        </div>
      )}
    </div>
  );
}
