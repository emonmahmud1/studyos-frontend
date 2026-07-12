"use client";

import React from "react";
import { useGetAdminGamificationQuery } from "@/store/api/adminApi";
import { Trophy, Flame, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c3a", "#6366f1", "#8b5cf6"];
const LEVEL_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#14b8a6"];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-amber-400 text-base font-black">🥇</span>;
  if (rank === 2) return <span className="text-slate-400 text-base font-black">🥈</span>;
  if (rank === 3) return <span className="text-amber-700 text-base font-black">🥉</span>;
  return <span className="w-6 text-center text-xs font-black text-slate-500">{rank}</span>;
}

export default function AdminGamificationPage() {
  const { data, isLoading } = useGetAdminGamificationQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>;
  }
  if (!data) return null;

  const maxXp = data.xpLeaderboard[0]?.xp || 1;
  const maxStreak = data.streakLeaderboard[0]?.streak || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Gamification</h1>
        <p className="text-sm text-slate-400 mt-1">XP leaderboard, streak leaders, and level distribution across the platform.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* XP Leaderboard */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 p-5 border-b border-slate-800">
            <Trophy size={16} className="text-amber-400" />
            <h2 className="font-bold text-white text-sm">XP Leaderboard</h2>
            <span className="ml-auto text-[11px] text-slate-500 font-mono">Top {data.xpLeaderboard.length}</span>
          </div>
          <div className="divide-y divide-slate-800/60 max-h-[520px] overflow-y-auto">
            {data.xpLeaderboard.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="w-6 flex items-center justify-center shrink-0">
                  <RankBadge rank={i + 1} />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: `${RANK_COLORS[Math.min(i, 4)]}22`, color: RANK_COLORS[Math.min(i, 4)] }}>
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-400 font-mono">{u.xp.toLocaleString()} XP</p>
                    <p className="text-[10px] text-slate-500">Level {u.level}</p>
                  </div>
                  <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400/70 transition-all" style={{ width: `${(u.xp / maxXp) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {data.xpLeaderboard.length === 0 && (
              <div className="flex items-center justify-center py-16 text-slate-500 text-sm">No users yet</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Level Distribution Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-indigo-400" />
              <h2 className="font-bold text-white text-sm">Level Distribution</h2>
            </div>
            {data.levelDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.levelDistribution} barSize={16}>
                  <XAxis dataKey="level" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => `L${v}`} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 12 }}
                    formatter={(v) => [`${v} users`, "Count"]}
                    labelFormatter={(l) => `Level ${l}`}
                  />
                  <Bar dataKey="users" radius={[4, 4, 0, 0]} name="Users">
                    {data.levelDistribution.map((_, i) => <Cell key={i} fill={LEVEL_COLORS[i % LEVEL_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-36 text-slate-500 text-sm">No data</div>
            )}
          </div>

          {/* Streak Leaders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} className="text-orange-400 fill-orange-500" />
              <h2 className="font-bold text-white text-sm">Streak Leaders</h2>
            </div>
            <div className="space-y-2.5">
              {data.streakLeaderboard.map((u, i) => (
                <div key={u.id} className="flex items-center gap-2.5">
                  <span className="w-4 text-[10px] font-black text-slate-500 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{u.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500/70" style={{ width: `${(u.streak / maxStreak) * 100}%` }} />
                    </div>
                    <span className="text-xs font-black text-orange-400 font-mono w-10 text-right">{u.streak}🔥</span>
                  </div>
                </div>
              ))}
              {data.streakLeaderboard.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No active streaks</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
