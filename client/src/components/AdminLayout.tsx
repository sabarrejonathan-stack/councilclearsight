import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Building2, Users, CreditCard, FileText, Settings, LogOut,
  Menu, X, BarChart3, Globe, Shield, BookOpen, Database, Activity
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Councils", href: "/admin/councils", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Blog & Resources", href: "/admin/blog", icon: BookOpen },
  { label: "Survey Templates", href: "/admin/templates", icon: FileText },
  { label: "Analytics", href: "/admin/analytics", icon: Activity },
  { label: "Audit Log", href: "/admin/audit", icon: Shield },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => window.location.href = "/" });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-sm">
        <Shield className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Admin access required</h1>
        <p className="text-muted-foreground text-sm mb-6">You need admin privileges to access this area.</p>
        <Button asChild><a href={getLoginUrl()}>Sign in</a></Button>
      </div>
    </div>;
  }

  const isActive = (href: string) => href === "/admin" ? location === "/admin" : location.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">CC</span>
          </div>
          <div>
            <span className="font-semibold text-xs text-foreground block">Council ClearSight</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-border/60">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{user?.name?.charAt(0)?.toUpperCase() ?? "A"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => logout.mutate()}>
          <LogOut className="h-4 w-4 mr-2" />Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex flex-col w-56 border-r border-border/60 bg-white flex-shrink-0">
        <SidebarContent />
      </aside>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-white shadow-xl">
            <button className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/60 bg-white flex items-center px-4 gap-4 flex-shrink-0">
          <button className="lg:hidden p-1.5 rounded-md text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          {title && <h1 className="font-semibold text-foreground text-sm">{title}</h1>}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal"><Globe className="h-4 w-4 mr-1.5" />Portal</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
