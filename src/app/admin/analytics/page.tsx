"use client";

import React from "react";
import { useGetAdminAnalyticsQuery } from "@/store/api/adminApi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Legend, AreaChart, Area,
} from "recharts";
import { BarChart3, Clock, CheckSquare, FileText } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#14b8a6"];

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="font-bold text-white text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useGetAdminAnalyticsQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>;
  }
  if (!data) return null;

  const statusColors: Record<string, string> = {
    TODO: "#64748b", PROGRESS: "#6366f1", REVIEW: "#f59e0b", COMPLETED: "#10b981",
  };
  const priorityColors: Record<string, string> = { LOW: "#94a3b8", MEDIUM: "#6366f1", HIGH: "#f43f5e" };
  const modeColors: Record<string, string> = { FOCUS: "#6366f1", SHORT_BREAK: "#10b981", LONG_BREAK: "#06b6d4" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Platform-wide usage breakdown and engagement trends.</p>
      </div>

      {/* Daily Pomodoro Chart */}
      <ChartCard title="Daily Pomodoro Sessions (Last 14 Days)" icon={<Clock size={16} className="text-indigo-400" />}>
        {data.dailyPomodoroChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.dailyPomodoroChart}>
              <defs>
                <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#pGrad)" strokeWidth={2} name="Sessions" />
              <Area type="monotone" dataKey="minutes" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Minutes" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No session data yet</div>
        )}
      </ChartCard>

      {/* 2-col charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tasks by Status */}
        <ChartCard title="Tasks by Status" icon={<CheckSquare size={16} className="text-emerald-400" />}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.tasksByStatus} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis dataKey="status" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Tasks">
                {data.tasksByStatus.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] || "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tasks by Priority */}
        <ChartCard title="Tasks by Priority" icon={<BarChart3 size={16} className="text-rose-400" />}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.tasksByPriority} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={65} strokeWidth={0}>
                {data.tasksByPriority.map((entry) => (
                  <Cell key={entry.priority} fill={priorityColors[entry.priority] || "#6366f1"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pomodoro by Mode */}
        <ChartCard title="Pomodoro Sessions by Mode" icon={<Clock size={16} className="text-violet-400" />}>
          <div className="space-y-3">
            {data.pomodoroByMode.map((p) => {
              const max = Math.max(...data.pomodoroByMode.map((x) => x.count));
              return (
                <div key={p.mode}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-300 font-semibold">{p.mode.replace("_", " ")}</span>
                    <span className="text-xs text-slate-400 font-mono">{p.count} sessions · {p.totalMinutes}m</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${max > 0 ? (p.count / max) * 100 : 0}%`, backgroundColor: modeColors[p.mode] || "#6366f1" }}
                    />
                  </div>
                </div>
              );
            })}
            {data.pomodoroByMode.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No sessions yet</p>}
          </div>
        </ChartCard>

        {/* Notes by Folder */}
        <ChartCard title="Notes by Folder" icon={<FileText size={16} className="text-cyan-400" />}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.notesByFolder} barSize={14}>
              <XAxis dataKey="folder" tick={{ fill: "#64748b", fontSize: 9 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Notes">
                {data.notesByFolder.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Events + Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Calendar Events by Type" icon={<BarChart3 size={16} className="text-amber-400" />}>
          <div className="space-y-3 pt-1">
            {data.eventsByType.map((e, i) => {
              const max = Math.max(...data.eventsByType.map((x) => x.count), 1);
              return (
                <div key={e.type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-300 font-semibold">{e.type}</span>
                    <span className="text-xs text-slate-400 font-mono">{e.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(e.count / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
            {data.eventsByType.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No events yet</p>}
          </div>
        </ChartCard>

        <ChartCard title="Resources by Type" icon={<BarChart3 size={16} className="text-teal-400" />}>
          <div className="space-y-3 pt-1">
            {data.resourcesByType.map((r, i) => {
              const max = Math.max(...data.resourcesByType.map((x) => x.count), 1);
              return (
                <div key={r.type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-300 font-semibold">{r.type}</span>
                    <span className="text-xs text-slate-400 font-mono">{r.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
            {data.resourcesByType.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No resources yet</p>}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
