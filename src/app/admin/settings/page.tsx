"use client";

import React from "react";
import { useGetAdminSystemQuery } from "@/store/api/adminApi";
import {
  Server, Database, Cpu, CheckCircle2, XCircle, Clock,
  Zap, Shield, RefreshCw, Info,
} from "lucide-react";

function StatusDot({ ok }: { ok: boolean }) {
  return ok
    ? <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} />Online</span>
    : <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold"><XCircle size={13} />Offline</span>;
}

function InfoRow({ label, value, mono = false }: { label: string; value: string | number | boolean; mono?: boolean }) {
  const display = typeof value === "boolean"
    ? (value ? <span className="text-emerald-400 font-bold">Enabled</span> : <span className="text-slate-500">Disabled</span>)
    : <span className={mono ? "font-mono text-slate-200" : "text-slate-200"}>{String(value)}</span>;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs">{display}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        {icon}
        <h2 className="font-bold text-white text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function AdminSettingsPage() {
  const { data, isLoading, refetch } = useGetAdminSystemQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">System Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Server info, database status, and platform feature configuration.</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl border p-4 flex items-center gap-4 ${data.database.status === "connected" ? "bg-emerald-950/20 border-emerald-800/40" : "bg-rose-950/20 border-rose-800/40"}`}>
        <div className={`w-3 h-3 rounded-full animate-pulse ${data.database.status === "connected" ? "bg-emerald-500" : "bg-rose-500"}`} />
        <div>
          <p className="text-sm font-bold text-white">
            Platform is {data.database.status === "connected" ? "fully operational" : "experiencing issues"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            All services running · Uptime {formatUptime(data.app.uptime)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* App Info */}
        <SectionCard title="Application" icon={<Server size={15} className="text-indigo-400" />}>
          <InfoRow label="App Name" value={data.app.name} />
          <InfoRow label="Version" value={data.app.version} mono />
          <InfoRow label="Environment" value={data.app.environment} />
          <InfoRow label="Port" value={data.app.port} mono />
          <InfoRow label="Node.js" value={data.app.nodeVersion} mono />
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-slate-400">Uptime</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
              <Clock size={12} />{formatUptime(data.app.uptime)}
            </span>
          </div>
        </SectionCard>

        {/* Database */}
        <SectionCard title="Database" icon={<Database size={15} className="text-cyan-400" />}>
          <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60">
            <span className="text-xs text-slate-400">Connection Status</span>
            <StatusDot ok={data.database.status === "connected"} />
          </div>
          <InfoRow label="Provider" value={data.database.provider} />
          <InfoRow label="Total Users" value={data.database.users.toLocaleString()} mono />
          <InfoRow label="Total Notes" value={data.database.notes.toLocaleString()} mono />
          <InfoRow label="Pomodoro Sessions" value={data.database.pomodoroSessions.toLocaleString()} mono />
        </SectionCard>

        {/* AI */}
        <SectionCard title="AI Integration" icon={<Zap size={15} className="text-violet-400" />}>
          <InfoRow label="AI Provider" value={data.ai.provider} />
          <InfoRow label="Model" value={data.ai.model} mono />
          <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60">
            <span className="text-xs text-slate-400">API Key Status</span>
            <StatusDot ok={data.ai.configured} />
          </div>
          {!data.ai.configured && (
            <div className="mt-3 bg-amber-950/20 border border-amber-800/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info size={13} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-300 leading-relaxed">
                  Add <code className="bg-slate-800 px-1 rounded font-mono">GEMINI_API_KEY</code> to your <code className="bg-slate-800 px-1 rounded font-mono">.env</code> file to enable AI features (chat, summarization, flashcard generation).
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Feature Flags */}
        <SectionCard title="Feature Flags" icon={<Shield size={15} className="text-emerald-400" />}>
          <div className="space-y-3 pt-1">
            {[
              { label: "User Registration", desc: "Allow new accounts to be created", value: data.features.registration },
              { label: "AI Features", desc: "Chat, summarize, flashcard generation", value: data.features.aiFeatures },
              { label: "Maintenance Mode", desc: "Block new logins system-wide", value: data.features.maintenanceMode },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{f.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${f.value ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                  {f.value ? "ON" : "OFF"}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-4">Feature flags are configured via environment variables. Restart the server to apply changes.</p>
        </SectionCard>
      </div>

      {/* Quick Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info size={15} className="text-slate-400" />
          <h2 className="font-bold text-white text-sm">Admin Quick Reference</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Make a User Admin", steps: ["Go to User Management", "Click Manage on any user", 'Click "Make Admin"', "User can now access /admin"] },
            { title: "Enable AI Features", steps: ["Get a Gemini API key from Google AI Studio", "Add GEMINI_API_KEY= to .env", "Restart the backend server", "AI status will show Online"] },
            { title: "Reset User Password", steps: ["Go to User Management", "Click Manage on target user", 'Click "Force Reset Password"', "Share the generated token with user"] },
          ].map((guide) => (
            <div key={guide.title} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <p className="text-xs font-bold text-indigo-400 mb-3">{guide.title}</p>
              <ol className="space-y-1.5">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-300 shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
