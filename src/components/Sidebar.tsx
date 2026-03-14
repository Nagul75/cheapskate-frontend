import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Wallet, UserCircle } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Link } from "react-router-dom";

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link to="/app">
          <div className="flex items-center gap-2">
              <Wallet size={24} className="text-foreground" />
            <h1 className="text-xl font-mono font-medium tracking-tighter first:mt-0">
              Cheapskate
            </h1>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/app">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/app/transactions">Transactions</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/app/accounts">Accounts</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/app/budgets">Budgets</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/app/settings">Settings</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2 py-4">
        <div className="flex items-center gap-2">
          <div>
            <UserCircle size={28}/>
          </div>
          <div>
            {user?.name && <p className="text-sm font-medium">{user.name}</p>}
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
