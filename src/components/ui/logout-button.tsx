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
      className="hover:bg-red-100 hover:border-red-200 hover:dark:bg-red-900/20 hover:dark:border-red-900/40 hover:cursor-pointer"
    >
      <LogOut size={20} />
    </Button>
  );
}
