"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role === "ADMIN") {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 py-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
