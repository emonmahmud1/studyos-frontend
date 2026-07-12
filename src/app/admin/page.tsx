"use client";

import React from "react";
import { useGetAdminOverviewQuery } from "@/store/api/adminApi";
import {
  Users, FileText, CheckSquare, Clock, Trophy, BookOpen,
  TrendingUp, Zap, Calendar, FolderOpen, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"];

function KpiCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-black text-white font-mono">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useGetAdminOverviewQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) return null;
  const { kpis, userGrowth, recentUsers, topUsers, featureUsage } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Platform Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time stats across all Study OS users and features.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Users" value={kpis.totalUsers} sub="All registered accounts" icon={<Users size={16} />} color="bg-indigo-600/20 text-indigo-400" />
        <KpiCard label="Total Notes" value={kpis.totalNotes} sub="Across all users" icon={<FileText size={16} />} color="bg-cyan-600/20 text-cyan-400" />
        <KpiCard label="Tasks Created" value={kpis.totalTasks} sub={`${kpis.taskCompletionRate}% completion rate`} icon={<CheckSquare size={16} />} color="bg-emerald-600/20 text-emerald-400" />
        <KpiCard label="Focus Minutes" value={kpis.totalFocusMinutes.toLocaleString()} sub={`${kpis.completedPomodoro} completed sessions`} icon={<Clock size={16} />} color="bg-amber-600/20 text-amber-400" />
        <KpiCard label="Subjects" value={kpis.totalSubjects} icon={<BookOpen size={16} />} color="bg-violet-600/20 text-violet-400" />
        <KpiCard label="Flashcard Decks" value={kpis.totalDecks} icon={<Zap size={16} />} color="bg-pink-600/20 text-pink-400" />
        <KpiCard label="Calendar Events" value={kpis.totalEvents} icon={<Calendar size={16} />} color="bg-rose-600/20 text-rose-400" />
        <KpiCard label="Resources" value={kpis.totalResources} icon={<FolderOpen size={16} />} color="bg-teal-600/20 text-teal-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User Growth */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-400" />
            <h2 className="font-bold text-white text-sm">User Growth (Last 30 Days)</h2>
          </div>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#growthGrad)" strokeWidth={2} name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No growth data yet</div>
          )}
        </div>

        {/* Feature Usage Pie */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="font-bold text-white text-sm">Feature Usage</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={featureUsage} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                {featureUsage.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 11 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Users */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-400" />
            <h2 className="font-bold text-white text-sm">Top Users by XP</h2>
          </div>
          <div className="space-y-2.5">
            {topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="w-5 text-[11px] font-black text-slate-500 text-right">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-black text-indigo-300 shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-indigo-400 font-mono">{u.xp.toLocaleString()} XP</p>
                  <p className="text-[10px] text-slate-500">Lvl {u.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-cyan-400" />
            <h2 className="font-bold text-white text-sm">Recent Signups</h2>
          </div>
          <div className="space-y-2.5">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-600/20 flex items-center justify-center text-xs font-black text-cyan-300 shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No new users in last 7 days</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
