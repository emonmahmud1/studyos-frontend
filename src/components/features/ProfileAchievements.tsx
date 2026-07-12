"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

const studyStreak = [
  { day: "Mon", active: true },
  { day: "Tue", active: true },
  { day: "Wed", active: true },
  { day: "Thu", active: true },
  { day: "Fri", active: true },
  { day: "Sat", active: true },
  { day: "Sun", active: false },
];

const badges = [
  { id: "b-1", title: "Zen Master", desc: "Complete 20 full Pomodoro focus blocks.", unlocked: true, icon: "🧘", rarity: "Epic Badge" },
  { id: "b-2", title: "Synthesizer", desc: "Generate an AI-powered flashcard study deck.", unlocked: true, icon: "⚡", rarity: "Rare Badge" },
  { id: "b-3", title: "Perfect Scholar", desc: "Simulate a mock quiz with 100% correct answers.", unlocked: false, icon: "🎓", rarity: "Legendary Badge" },
  { id: "b-4", title: "Archivist", desc: "Import a lesson document from Google Workspace.", unlocked: true, icon: "📂", rarity: "Common Badge" },
];

export default function ProfileAchievements() {
  const user = useAppSelector((s) => s.auth.user);
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const xpInCurrentLevel = xp % 2000;
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / 2000) * 100));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
      <div className="xl:col-span-3 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Academic Performance</h1>
          <p className="text-xs text-slate-400">Check your leveling rankings, study streaks, and unlockable achievement cabinets.</p>
        </div>

        <div className="bg-gradient-to-tr from-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-950/40 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-mono font-black text-2xl text-indigo-400 border border-white/10 shadow-sm">
              Lvl {level}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Workspace Character Rank</span>
              <h3 className="text-base font-black">Alex Smith (Honors student)</h3>
              <p className="text-xs text-slate-300">Level up every 2,000 XP to increase productivity milestones</p>
            </div>
          </div>
          <div className="flex-1 max-w-sm relative z-10 space-y-1.5">
            <div className="flex justify-between text-[11px] text-indigo-200">
              <span>XP Completed</span><span>{xpInCurrentLevel} / 2,000 XP</span>
            </div>
            <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base">Achievements Cabinet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className={`p-5 rounded-2xl border flex items-center gap-4 text-left relative overflow-hidden transition-all ${badge.unlocked ? "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow" : "bg-slate-50/50 dark:bg-zinc-950 border-slate-200/50 dark:border-zinc-900/60 opacity-60"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${badge.unlocked ? "bg-indigo-50 dark:bg-indigo-950/20" : "bg-slate-100 dark:bg-zinc-900"}`}>{badge.icon}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200 leading-none">{badge.title}</h4>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">{badge.rarity}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal max-w-xs">{badge.desc}</p>
                </div>
                {!badge.unlocked && <div className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">LOCKED</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-zinc-800/40">
            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Study Streak Goals</h3>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold">
              <Flame size={12} className="fill-amber-500" /><span>7 Days Active</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Perform focus blocks or study notes daily to defend your intellectual streak multiplier.</p>
          <div className="grid grid-cols-7 gap-2.5">
            {studyStreak.map((st, idx) => (
              <div key={idx} className="text-center space-y-1.5">
                <div className={`h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-all ${st.active ? "bg-gradient-to-tr from-amber-400 to-amber-500 border-amber-400 text-white shadow-sm scale-105" : "bg-slate-50 dark:bg-zinc-950 border-slate-100 dark:border-zinc-800 text-slate-400"}`}>
                  {st.active ? "🔥" : idx + 1}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{st.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Alex&apos;s Global Analytics</h3>
          <div className="space-y-3">
            {[
              ["Total study loops", "14 Pomodoros"],
              ["Weekly focus duration", "5.8 Hours"],
              ["Flashcards practiced", "120 Cards"],
              ["Quizzes Simulated", "3 Trials"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">{label}</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
