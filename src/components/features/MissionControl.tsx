"use client";

import React from "react";
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Award, Sparkles } from "lucide-react";
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, Task, TaskStatus } from "@/store/api/tasksApi";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";
import { useGetEventsQuery } from "@/store/api/eventsApi";

export default function MissionControl() {
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: events = [] } = useGetEventsQuery();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [showAddTask, setShowAddTask] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newSubjectId, setNewSubjectId] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newDueDate, setNewDueDate] = React.useState("2026-07-15");
  const [newPriority, setNewPriority] = React.useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const columns: { id: TaskStatus; label: string; bg: string; text: string }[] = [
    { id: "TODO", label: "To Do", bg: "bg-slate-50 dark:bg-zinc-900/40", text: "text-slate-700 dark:text-zinc-300" },
    { id: "PROGRESS", label: "In Progress", bg: "bg-indigo-50/20 dark:bg-indigo-950/10", text: "text-indigo-700 dark:text-indigo-400" },
    { id: "REVIEW", label: "Review", bg: "bg-amber-50/20 dark:bg-amber-950/10", text: "text-amber-700 dark:text-amber-400" },
    { id: "COMPLETED", label: "Completed", bg: "bg-emerald-50/20 dark:bg-emerald-950/10", text: "text-emerald-700 dark:text-emerald-400" },
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    await createTask({
      title: newTitle.trim(),
      subjectId: newSubjectId || subjects[0]?.id,
      description: newDescription.trim(),
      status: "TODO",
      dueDate: newDueDate,
      priority: newPriority,
    });
    setNewTitle(""); setNewDescription(""); setNewDueDate("2026-07-15"); setNewPriority("MEDIUM");
    setShowAddTask(false);
  };

  const handleMoveStatus = async (task: Task, direction: "prev" | "next") => {
    const statuses: TaskStatus[] = ["TODO", "PROGRESS", "REVIEW", "COMPLETED"];
    const currIdx = statuses.indexOf(task.status);
    const nextIdx = direction === "next" ? currIdx + 1 : currIdx - 1;
    if (nextIdx >= 0 && nextIdx < statuses.length) {
      await updateTask({ id: task.id, status: statuses[nextIdx] });
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "HIGH") return "bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30";
    if (priority === "MEDIUM") return "bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30";
    return "bg-slate-100 dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-zinc-700/60";
  };

  const exams = events.filter((e) => e.type === "EXAM").map((exam) => {
    const diffDays = Math.ceil((new Date(exam.date).getTime() - new Date("2026-07-11").getTime()) / (1000 * 60 * 60 * 24));
    return { ...exam, daysLeft: diffDays };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
      <div className="xl:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Mission Control</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Your centralized assignments workflow. Move cards to track completion.</p>
          </div>
          <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold shadow-md cursor-pointer transition-all hover:scale-105">
            <Plus size={14} />
            <span>Add Assignment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-start">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className={`rounded-[32px] p-4 md:p-5 ${col.bg} border border-slate-100 dark:border-slate-800/80 flex flex-col min-h-[360px] md:min-h-[480px]`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                  <span className={`font-bold text-xs uppercase tracking-wider ${col.text}`}>{col.label}</span>
                  <span className="text-[10px] font-bold font-mono bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-full shadow-sm">{columnTasks.length}</span>
                </div>
                <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[450px] scrollbar-none">
                  {columnTasks.map((task) => {
                    const subject = subjects.find((s) => s.id === task.subjectId);
                    return (
                      <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative group">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                            <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug">{task.title}</h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                          {subject && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{subject.name}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 dark:border-slate-800/40 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1 font-mono"><Calendar size={11} /><span>{task.dueDate}</span></div>
                            <div className="flex items-center gap-1">
                              {col.id !== "TODO" && <button onClick={() => handleMoveStatus(task, "prev")} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"><ChevronLeft size={10} /></button>}
                              {col.id !== "COMPLETED" && <button onClick={() => handleMoveStatus(task, "next")} className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 cursor-pointer"><ChevronRight size={10} /></button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {columnTasks.length === 0 && (
                    <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 font-mono">Empty Column</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">Exam Countdown Clocks</h3>
          <div className="space-y-4">
            {exams.map((ex) => (
              <div key={ex.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300">{ex.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{ex.time}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg font-mono ${ex.daysLeft <= 4 ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 animate-pulse" : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"}`}>{ex.daysLeft}d left</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.max(10, 100 - ex.daysLeft * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-tr from-[#1e3a8a]/20 to-[#020617] text-white p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Weekly Study Goal</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Reach 20 total Pomodoro sessions this week to unlock the <span className="text-blue-500 dark:text-blue-400 font-bold">&ldquo;Zen Master&rdquo;</span> milestone badge.
          </p>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">
                <span>Completed Focus Loops</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">14/20 Sessions</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: "70%" }} />
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              <Sparkles size={14} className="shrink-0 text-blue-500" />
              <span>Current pace is excellent! You will easily complete your target by Sunday.</span>
            </div>
          </div>
        </div>
      </div>

      {showAddTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 md:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Add Homework or Assignment</h3>
              <button onClick={() => setShowAddTask(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-semibold">Cancel</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Assignment Title</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Normalization Lab Report" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Associate Subject</label>
                <select value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors">
                  {subjects.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400">Short Instruction Description</label>
                <textarea required value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none" placeholder="Explain brief deliverables..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400">Target Due Date</label>
                  <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400">Task Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button type="button" onClick={() => setShowAddTask(false)} className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-500 dark:text-slate-400 rounded-xl font-semibold cursor-pointer transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer transition-all hover:scale-105">Create Card</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
