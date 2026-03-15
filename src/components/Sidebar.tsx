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

import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PiggyBank,
  Settings,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",    to: "/app",              icon: LayoutDashboard, exact: true },
  { label: "Transactions", to: "/app/transactions", icon: ArrowLeftRight },
  { label: "Accounts",     to: "/app/accounts",     icon: Landmark },
  { label: "Budgets",      to: "/app/budgets",      icon: PiggyBank },
  { label: "Settings",     to: "/app/settings",     icon: Settings },
];

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <Sidebar {...props}>
      {/* ── Logo ── */}
      <SidebarHeader className="px-4 pb-5 pt-2">
        <Link to="/app" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 transition-colors group-hover:bg-primary/15">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono font-semibold tracking-tighter text-lg leading-none">
            Cheapskate
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="px-3">
        <SidebarGroup className="p-0">
          <div className="mb-2 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
              Menu
            </p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_ITEMS.map(({ label, to, icon: Icon, exact }) => {
                const active = isActive(to, exact);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "relative h-9 rounded-md px-3 text-sm font-medium transition-all duration-150",
                        "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        active && [
                          "text-sidebar-primary-foreground bg-primary",
                          "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                          "shadow-sm",
                        ]
                      )}
                    >
                      <Link to={to} className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-60")} />
                        {label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
            <span className="text-[11px] font-bold text-primary leading-none">
              {initials}
            </span>
          </div>

          {/* Name + email */}
          <div className="min-w-0 flex-1">
            {user?.name && (
              <p className="truncate text-xs font-semibold leading-tight">
                {user.name}
              </p>
            )}
            <p className="truncate text-[11px] text-sidebar-foreground/50 leading-tight mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;