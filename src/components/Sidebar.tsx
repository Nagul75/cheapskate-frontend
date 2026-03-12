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

import { Wallet, Settings } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Link } from "react-router-dom";

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-600 rounded-md flex items-center justify-center">
                <Wallet size={20} className="text-white" />
            </div>
          <h1 className="text-xl font-mono font-medium tracking-tighter first:mt-0">
            Cheapskate
          </h1>
        </div>
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
                <SidebarMenuButton>Accounts</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Categories</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            {user?.name && <p className="text-sm font-medium">{user.name}</p>}
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button className="p-1 hover:bg-accent rounded">
            <Settings size={16} />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
