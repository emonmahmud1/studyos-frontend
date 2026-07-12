"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CheckSquare,
  Timer,
  Layers,
  GraduationCap,
  Calendar,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout as reduxLogout } from "@/store/slices/authSlice";
import { UserStats } from "@/types";

const menuItems = [
  {
    group: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { id: "subjects", label: "Subjects", icon: BookOpen, href: "/dashboard/subjects" },
      { id: "notes", label: "Notes Workspace", icon: FileText, href: "/dashboard/notes" },
      { id: "mission-control", label: "Mission Control", icon: CheckSquare, href: "/dashboard/mission-control" },
    ],
  },
  {
    group: "Focus & Learn",
    items: [
      { id: "pomodoro", label: "Pomodoro Focus", icon: Timer, href: "/dashboard/pomodoro" },
      { id: "flashcards", label: "Flashcards", icon: Layers, href: "/dashboard/flashcards" },
      { id: "quiz", label: "Quiz Lab", icon: GraduationCap, href: "/dashboard/quiz" },
      { id: "calendar", label: "Academic Calendar", icon: Calendar, href: "/dashboard/calendar" },
    ],
  },
  {
    group: "Account & Caret",
    items: [
      { id: "resources", label: "Resource Vault", icon: FolderOpen, href: "/dashboard/resources" },
      { id: "profile", label: "Achievements", icon: User, href: "/dashboard/profile" },
      { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },
];

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { pomodoroState } = useApp();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const xpNext = (user?.level ?? 1) * 2000;

  const onLogout = () => {
    dispatch(reduxLogout());
    router.push("/login");
  };

  return (
    <aside
      className={`h-screen border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-[#020617] flex flex-col justify-between transition-all duration-300 ease-in-out relative shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 cursor-pointer text-slate-500 hover:text-blue-500 shadow-sm z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Brand Logo */}
      <div className="p-5 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                Study OS
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase">
                v1.2.0 (Synced)
              </span>
            </div>
          )}
        </div>

        {/* User XP Bar */}
        {!isCollapsed && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user?.name ?? "Student"}
              </span>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">
                Lvl {user?.level ?? 1}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user?.xp ?? 0) / xpNext) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <span>{user?.xp ?? 0} XP</span>
              <span>{xpNext} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
        {menuItems.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-3 block mb-1">
                {group.group}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
        {pomodoroState.isRunning && (
          <div className="mb-3 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl text-xs font-mono border border-emerald-100/60 dark:border-emerald-800/20 animate-pulse">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold uppercase tracking-wider">
                {pomodoroState.mode === "focus" ? "Focus" : "Break"}
              </span>
            </div>
            <span className="font-bold">{formatTime(pomodoroState.timeLeft)}</span>
          </div>
        )}

        {!isCollapsed && !pomodoroState.isRunning && (
          <div className="mb-3 flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 p-2.5 rounded-xl text-xs border border-orange-100/60 dark:border-orange-800/20">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="fill-orange-500 stroke-none" />
              <span>Daily Streak</span>
            </div>
            <span className="font-bold font-mono">{user?.streak ?? 0} Days</span>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
