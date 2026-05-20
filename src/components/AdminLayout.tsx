import { Outlet, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutGrid, FileText, Users, ClipboardList, CheckSquare, CalendarDays, Wallet, LogOut, MessageCircle, RotateCcw, History, Globe, Settings, Phone, Sparkles, Mail, Palette, Mailbox, Search, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminCommandPalette } from "@/components/AdminCommandPalette";
import { useAdminBadges } from "@/hooks/use-admin-badges";
import { useEffect } from "react";

const mainNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutGrid, end: true },
  { title: "Bewerbungen", url: "/admin/applications", icon: FileText, badgeKey: "newApplications" as const },
  { title: "Mitarbeiter", url: "/admin/employees", icon: Users },
  { title: "KYC", url: "/admin/kyc", icon: ShieldCheck, badgeKey: "pendingKyc" as const },
  { title: "Aufgaben", url: "/admin/tasks", icon: ClipboardList },
];

const reviewNav = [
  { title: "Prüfungen", url: "/admin/reviews", icon: CheckSquare },
  { title: "Nachbesserungen", url: "/admin/revisions", icon: RotateCcw },
];

const opsNav = [
  { title: "Termine", url: "/admin/appointments", icon: CalendarDays },
  { title: "Chat", url: "/admin/chat", icon: MessageCircle, badgeKey: "unreadChat" as const },
  { title: "SMS", url: "/admin/sms", icon: Phone },
  { title: "Post", url: "/admin/post", icon: Mailbox },
  { title: "Transaktionen", url: "/admin/transactions", icon: Wallet },
];

const sysNav = [
  { title: "E-Mail Templates", url: "/admin/email-templates", icon: Palette },
  { title: "E-Mail Monitoring", url: "/admin/email-logs", icon: Mail },
  { title: "Protokoll", url: "/admin/activity", icon: History },
  { title: "Verträge", url: "/admin/contracts", icon: FileText },
  { title: "Domains", url: "/admin/tenants", icon: Globe },
  { title: "KI-Antworten", url: "/admin/ai-settings", icon: Sparkles },
  { title: "Einstellungen", url: "/admin/settings", icon: Settings },
];

type BadgeKey = "unreadChat" | "pendingKyc" | "newApplications";
type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutGrid;
  end?: boolean;
  badgeKey?: BadgeKey;
};

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const badges = useAdminBadges();

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup className="py-1">
      {!collapsed && (
        <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3 mb-0.5">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const count = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.end}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span className="text-sm flex-1">{item.title}</span>}
                    {count > 0 && (
                      <span className={`${collapsed ? "absolute top-1 right-1 h-4 min-w-[16px]" : "h-5 min-w-[20px]"} px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center`}>
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="flex flex-col h-full">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <LayoutGrid className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <div>
                <span className="text-sm font-heading font-bold text-sidebar-primary-foreground">Admin</span>
                <p className="text-[10px] text-sidebar-foreground/50 leading-none">Management</p>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
              <LayoutGrid className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation groups */}
        <div className="flex-1 overflow-y-auto py-2">
          {renderGroup("Übersicht", mainNav)}
          {!collapsed && <div className="mx-3 my-1 h-px bg-sidebar-border" />}
          {renderGroup("Qualität", reviewNav)}
          {!collapsed && <div className="mx-3 my-1 h-px bg-sidebar-border" />}
          {renderGroup("Betrieb", opsNav)}
          {!collapsed && <div className="mx-3 my-1 h-px bg-sidebar-border" />}
          {renderGroup("System", sysNav)}
        </div>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={signOut}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="text-sm">Abmelden</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (!loading && user && !isAdmin) navigate("/dashboard");
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 animate-pulse" />
          <p className="text-sm text-muted-foreground">Laden…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full admin-layout">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <header className="h-12 flex items-center border-b border-border bg-card px-5 gap-3 shrink-0">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</span>
            <button
              onClick={() => {
                // Synthetic Cmd+K
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
              }}
              className="ml-4 hidden sm:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1 transition-colors"
              title="Schnellsuche"
            >
              <Search className="h-3.5 w-3.5" /> Suchen…
              <kbd className="ml-2 text-[10px] bg-muted px-1 py-0.5 rounded">⌘K</kbd>
            </button>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <AdminCommandPalette />
        </div>
      </div>
    </SidebarProvider>
  );
}
