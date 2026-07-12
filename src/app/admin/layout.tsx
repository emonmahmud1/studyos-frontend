"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, BarChart3, Trophy, Settings,
  Shield, ChevronLeft, ChevronRight, LogOut, BookOpen,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

const adminNavItems = [
  { id: "overview",      label: "Overview",        icon: LayoutDashboard, href: "/admin" },
  { id: "users",         label: "User Management", icon: Users,           href: "/admin/users" },
  { id: "analytics",     label: "Analytics",       icon: BarChart3,       href: "/admin/analytics" },
  { id: "gamification",  label: "Gamification",    icon: Trophy,          href: "/admin/gamification" },
  { id: "settings",      label: "System Settings", icon: Settings,        href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    // Wait for user to hydrate from localStorage before checking role
    if (user !== null && user.role !== "ADMIN") { router.replace("/dashboard"); }
  }, [isAuthenticated, user, router]);

  // Show spinner while: not authenticated OR user not yet hydrated OR user is not ADMIN
  if (!isAuthenticated || user === null || user.role !== "ADMIN") {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const onLogout = () => { dispatch(logout()); router.push("/login"); };

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`h-screen flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 shrink-0 ${collapsed ? "w-16" : "w-60"}`}>
        {/* Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-sm text-white leading-tight">Study OS</p>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + back to app */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all cursor-pointer"
          >
            <BookOpen size={15} className="shrink-0" />
            {!collapsed && <span>Back to App</span>}
          </Link>
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-indigo-400 font-mono">ADMIN</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-all cursor-pointer"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
