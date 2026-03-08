import { Button } from "./button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/authProvider";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      aria-label="Logout"
    >
      <LogOut size={20} />
    </Button>
  );
}
