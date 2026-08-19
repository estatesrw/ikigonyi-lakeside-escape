import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PartyPopper,
  Plug,
  Settings,
  Star,
  Tag,
  Users,
  Inbox,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/dashboard/ui";
import { useAccess, usePropertyId, useSession } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Manager Dashboard — EstatesRW" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Property management dashboard for EstatesRW." },
    ],
  }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/bookings", label: "Bookings", icon: BookOpen },
  { to: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/dashboard/guests", label: "Guests", icon: Users },
  { to: "/dashboard/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/dashboard/messages", label: "Communications", icon: MessageSquare },
  { to: "/dashboard/events", label: "Events", icon: PartyPopper },
  { to: "/dashboard/pricing", label: "Pricing", icon: Tag },
  { to: "/dashboard/channels", label: "Channels", icon: Plug },
  { to: "/dashboard/content", label: "Content", icon: Image },
  { to: "/dashboard/reviews", label: "Reviews", icon: Star },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

const OPS_ALLOWED = new Set([
  "/dashboard",
  "/dashboard/calendar",
  "/dashboard/guests",
  "/dashboard/messages",
]);

function DashboardLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: property } = usePropertyId();
  const access = useAccess();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function claimOwner() {
    const { data, error } = await supabase.rpc("claim_first_owner");
    const result = data as unknown as { error?: string } | null;
    if (error || result?.error) {
      toast.error(result?.error ?? "Could not claim ownership.");
      return;
    }
    toast.success("You are now the platform owner.");
    queryClient.invalidateQueries();
  }

  if (access.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!access.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">No dashboard access yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({user?.email}) has no role assigned. An owner can grant you access in
            Settings.
          </p>
          <div className="mt-6 space-y-2">
            <Button className="w-full" onClick={claimOwner}>
              Claim owner access (first user only)
            </Button>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nav = NAV.filter((n) => access.canManage || OPS_ALLOWED.has(n.to));

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:static lg:flex",
          open ? "flex" : "hidden",
        )}
      >
        <div className="border-b border-sidebar-border px-5 py-5">
          <p className="text-sm font-semibold">EstatesRW</p>
          <p className="mt-1 truncate text-xs text-sidebar-foreground/60">
            {property?.name ?? "Property platform"}
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent"
          >
            <Home className="size-4" /> View website
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="text-sm font-medium">{property?.name ?? "Dashboard"}</p>
              <p className="text-xs text-muted-foreground">
                {access.roles.map((r) => r.replace(/_/g, " ")).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
