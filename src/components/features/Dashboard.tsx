"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Flame, Trophy, Clock, TrendingUp, Play, Pause, RotateCcw,
  Sparkles, Send, Circle, ChevronRight, BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { useAppSelector } from "@/store/hooks";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";
import { useGetTasksQuery } from "@/store/api/tasksApi";
import { useGetEventsQuery } from "@/store/api/eventsApi";
import { useChatWithAiMutation } from "@/store/api/aiApi";

const weeklyFocusData = [
  { name: "Mon", hours: 2.2 },
  { name: "Tue", hours: 4.5 },
  { name: "Wed", hours: 3.1 },
  { name: "Thu", hours: 5.6 },
  { name: "Fri", hours: 4.0 },
  { name: "Sat", hours: 1.5 },
  { name: "Sun", hours: 2.4 },
];

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function Dashboard() {
  const router = useRouter();
  const { pomodoroState, setPomodoroState } = useApp();
  const user = useAppSelector((s) => s.auth.user);
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: events = [] } = useGetEventsQuery();
  const [chatWithAi] = useChatWithAiMutation();

  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "coach"; content: string }[]>([
    { role: "coach", content: "Hi Alex! Ready to crush your goals today? You have a Computer Science midterm in 4 days. Would you like a quick study strategy or flashcard review?" },
  ]);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);
    try {
      const result = await chatWithAi({ message: userMsg, history: chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content })) }).unwrap();
      setChatMessages((prev) => [...prev, { role: "coach", content: result.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "coach", content: "I'm having trouble connecting. Please ensure the backend is running and GEMINI_API_KEY is configured." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePomodoroToggle = () => {
    setPomodoroState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handlePomodoroReset = () => {
    setPomodoroState((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === "focus" ? 25 * 60 : prev.mode === "shortBreak" ? 5 * 60 : 15 * 60,
    }));
  };

  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED");

  const upcomingExams = events
    .filter((e) => e.type === "EXAM")
    .map((exam) => {
      const examDate = new Date(exam.date);
      const today = new Date("2026-07-11");
      const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...exam, daysLeft: diffDays };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const totalTime = pomodoroState.mode === "focus" ? 25 * 60 : pomodoroState.mode === "shortBreak" ? 5 * 60 : 15 * 60;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative bento-gradient-primary rounded-[32px] p-6 md:p-8 text-white overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-[-20deg] translate-x-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles size={12} />
              Session Plan: Active & Synced
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Good Morning, {(user?.name ?? "Student").split(" ")[0]} ☕
            </h1>
            <p className="text-blue-100 text-sm max-w-xl font-medium">
              You&apos;ve completed <span className="text-white font-bold">{tasks.filter(t => t.status === "COMPLETED").length} tasks</span> this semester.
              Today&apos;s goal is to wrap up your Database Report and start high-recall flashcards.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/pomodoro")}
            className="shrink-0 bg-white hover:bg-blue-50 text-blue-600 font-bold text-sm px-6 py-4 rounded-2xl transition-all hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Play size={16} className="fill-blue-600 text-blue-600" />
            <span>Resume Focus Session</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Daily Streak", value: `${user?.streak ?? 0} Days`, icon: <Flame size={18} className="fill-orange-500 stroke-none" />, iconBg: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/10", sub: "▲ Keep it going!", subColor: "text-emerald-600 dark:text-emerald-400" },
          { label: "Level Status", value: `Level ${user?.level ?? 1}`, icon: <Trophy size={18} />, iconBg: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/10", sub: `${((user?.level ?? 1) * 2000) - (user?.xp ?? 0)} XP to next milestone`, subColor: "text-slate-400 dark:text-slate-500", hasProgress: true },
          { label: "Focused Today", value: `${subjects.length} Subjects`, icon: <Clock size={18} />, iconBg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/10", sub: `${pendingTasks.length} tasks pending`, subColor: "text-slate-400 dark:text-slate-500" },
          { label: "Study Progress", value: `${tasks.length} Tasks`, icon: <TrendingUp size={18} />, iconBg: "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-100/50 dark:border-violet-900/10", sub: "▲ Keep pushing forward!", subColor: "text-emerald-600 dark:text-emerald-400" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden bento-radial-glow">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>{card.icon}</div>
            </div>
            <div className="mt-4 md:mt-6 relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">{card.value}</h2>
              {card.hasProgress && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, ((user?.xp ?? 0) / ((user?.level ?? 1) * 2000)) * 100)}%` }} />
                </div>
              )}
              <p className={`text-[10px] font-medium mt-1 ${card.subColor}`}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column (2 span) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Weekly Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Weekly Focus Breakdown</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Total study hours distributed by day of week</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-xl">This Week: 24.8 hrs</span>
            </div>
            <div className="h-56 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyFocusData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #1e293b", color: "#fff", fontSize: "12px" }} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                  <defs>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="hours" fill="url(#indigoGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Today&apos;s Study Checklist</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Checking items boosts your Level and logs active progress</p>
              </div>
              <button onClick={() => router.push("/dashboard/mission-control")} className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                <span>Mission Control</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pendingTasks.length > 0 ? pendingTasks.slice(0, 3).map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId);
                return (
                  <div key={task.id} className="py-3.5 flex items-start gap-3 group hover:bg-slate-50/40 dark:hover:bg-slate-800/10 px-2 rounded-2xl transition-colors">
                    <button
                      onClick={() => {}}
                      className="mt-0.5 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      <Circle size={18} />
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{task.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${task.priority === "HIGH" ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{task.description}</p>
                      {subject && <span className="inline-block text-[10px] font-semibold text-blue-600 dark:text-blue-400">• {subject.name}</span>}
                    </div>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5 shrink-0 hidden sm:block">Due: {task.dueDate}</span>
                  </div>
                );
              }) : (
                <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                  🎉 All tasks finished! Give yourself a break or draft new ones in Mission Control.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column (1 span) */}
        <div className="space-y-6">
          {/* Pomodoro Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden bento-radial-glow">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Pomodoro Focus</h3>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-xl font-mono font-bold uppercase">
                {pomodoroState.mode === "focus" ? "Study Mode" : "Break Mode"}
              </span>
            </div>
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-3 relative z-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="64" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle cx="72" cy="72" r="64" className="stroke-blue-500 transition-all duration-1000" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 * (1 - pomodoroState.timeLeft / totalTime)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{formatTime(pomodoroState.timeLeft)}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Remaining</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3.5 mt-4 relative z-10">
              <button onClick={handlePomodoroReset} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors">
                <RotateCcw size={16} />
              </button>
              <button onClick={handlePomodoroToggle} className={`p-3 rounded-xl text-white shadow-md cursor-pointer transition-all ${pomodoroState.isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}>
                {pomodoroState.isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <button onClick={() => router.push("/dashboard/pomodoro")} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* AI Study Coach */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[350px] relative overflow-hidden bento-radial-glow">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">AI Study Coach</h3>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <Sparkles size={10} className="text-blue-500" />
                Gemini AI
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 scrollbar-thin text-xs text-left relative z-10">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none font-medium" : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-200/40 dark:border-zinc-800/30"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-bl-none px-3.5 py-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChat} className="mt-2 flex gap-1.5 shrink-0 relative z-10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your Coach a question..."
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-all"
              />
              <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0">
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">Upcoming Exams Countdown</h3>
            <div className="space-y-3.5">
              {upcomingExams.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subjectId);
                return (
                  <div key={exam.id} className="flex items-center justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{exam.title}</h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{subject ? subject.name : "Academic"}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-lg shrink-0 ${exam.daysLeft <= 4 ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 animate-pulse" : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"}`}>
                      {exam.daysLeft === 0 ? "Today" : exam.daysLeft === 1 ? "1 Day Left" : `${exam.daysLeft} Days`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
