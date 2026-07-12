"use client";

import React from "react";
import { BookOpen, Calendar, FileText, CheckSquare, Plus, X, GraduationCap, Trophy } from "lucide-react";
import { useGetSubjectsQuery, useCreateSubjectMutation, useDeleteSubjectMutation } from "@/store/api/subjectsApi";

const colorsList = [
  { id: "indigo", label: "Indigo", bg: "bg-indigo-500" },
  { id: "rose", label: "Rose", bg: "bg-rose-500" },
  { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500" },
  { id: "violet", label: "Violet", bg: "bg-violet-500" },
];

function getAccentBg(color: string) {
  const map: Record<string, string> = { emerald: "bg-emerald-500", rose: "bg-rose-500", amber: "bg-amber-500", violet: "bg-violet-500" };
  return map[color] || "bg-indigo-500";
}

function getAccentText(color: string) {
  const map: Record<string, string> = { emerald: "text-emerald-600 dark:text-emerald-400", rose: "text-rose-600 dark:text-rose-400", amber: "text-amber-600 dark:text-amber-400", violet: "text-violet-600 dark:text-violet-400" };
  return map[color] || "text-indigo-600 dark:text-indigo-400";
}

function getAccentLightBg(color: string) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/40",
    rose: "bg-rose-50 dark:bg-rose-950/20 border-rose-100/40",
    amber: "bg-amber-50 dark:bg-amber-950/20 border-amber-100/40",
    violet: "bg-violet-50 dark:bg-violet-950/20 border-violet-100/40",
  };
  return map[color] || "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100/40";
}

export default function SubjectsOverview() {
  const { data: subjects = [], isLoading } = useGetSubjectsQuery();
  const [createSubject] = useCreateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("");
  const [newColor, setNewColor] = React.useState("indigo");
  const [newExamDate, setNewExamDate] = React.useState("2026-07-28");
  const [newMastery, setNewMastery] = React.useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCategory.trim()) return;
    await createSubject({
      name: newName.trim(),
      category: newCategory.trim(),
      mastery: Number(newMastery),
      color: newColor,
      examDate: newExamDate,
    });
    setNewName(""); setNewCategory(""); setNewColor("indigo"); setNewExamDate("2026-07-28"); setNewMastery(50);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Subjects & Masteries</h1>
          <p className="text-xs text-slate-400">Track curriculum completion, lecture libraries, and upcoming exam timelines</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer">
          <Plus size={14} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subjects.map((sub) => (
          <div key={sub.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-5 shadow-sm hover:shadow transition-all relative overflow-hidden text-left">
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${getAccentBg(sub.color)}`} />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{sub.category}</span>
                <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 mt-0.5">{sub.name}</h3>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full font-mono border ${getAccentLightBg(sub.color)} ${getAccentText(sub.color)}`}>
                {sub.mastery}% Mastered
              </span>
            </div>
            <div className="mt-5 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Subject Mastery Level</span>
                <span>{sub.mastery}/100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${getAccentBg(sub.color)}`} style={{ width: `${sub.mastery}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-slate-50 dark:border-zinc-800/80 pt-4 mt-5 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5"><FileText size={14} className="text-slate-400" /><span><strong>{sub._count?.notes ?? 0}</strong> Notes</span></div>
              <div className="flex items-center gap-1.5"><CheckSquare size={14} className="text-slate-400" /><span><strong>{sub._count?.tasks ?? 0}</strong> Tasks</span></div>
              <div className="flex items-center gap-1.5 justify-end text-right"><Calendar size={14} className="text-slate-400" /><span className="font-semibold text-slate-600 dark:text-zinc-300">{sub.examDate ? sub.examDate.substring(5) : "—"}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-indigo-600" size={18} />
                <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">Add Academic Subject</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Subject Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500" placeholder="e.g. Inorganic Chemistry" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Category / Faculty</label>
                <input type="text" required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500" placeholder="e.g. Molecular Synthesis" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-zinc-400">Target Mastery (%)</label>
                  <input type="number" min="0" max="100" value={newMastery} onChange={(e) => setNewMastery(Number(e.target.value))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-zinc-400">Exam Target Date</label>
                  <input type="date" value={newExamDate} onChange={(e) => setNewExamDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Visual Theme Color</label>
                <div className="grid grid-cols-5 gap-2.5">
                  {colorsList.map((col) => (
                    <button key={col.id} type="button" onClick={() => setNewColor(col.id)} className={`h-9 rounded-lg flex items-center justify-center cursor-pointer border ${col.bg} text-white transition-all ${newColor === col.id ? "ring-2 ring-indigo-500 ring-offset-2 scale-105" : "opacity-80"}`} title={col.label}>
                      {newColor === col.id && <Trophy size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-slate-500 rounded-lg font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer">Confirm Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
