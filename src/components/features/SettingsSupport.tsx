"use client";

import React from "react";
import { Sun, Moon, Send } from "lucide-react";
import { useApp } from "@/context/AppContext";

const faqs = [
  { q: "How does the AI Coach work?", a: "Our Study OS AI Coach utilizes server-side Google Gemini models. When you trigger note summaries or chat inside the workspace, the AI synthesizes learning patterns and answers contextually." },
  { q: "How do I earn experience points (XP)?", a: "Experience is rewarded for active studying. Adding subjects gives +120 XP, completing Pomodoro loops yields +200 XP, practicing recall gives +40 XP per card, and finishing quizzes yields +150 XP." },
  { q: "Can I connect multiple Google Drive accounts?", a: "Currently, Study OS allows linking one primary student account (e.g., alex@university.edu) to synchronize lectures and syllabus reference files." },
];

export default function SettingsSupport() {
  const { isDarkMode, setIsDarkMode } = useApp();
  const [autoSave, setAutoSave] = React.useState(true);
  const [soundAlerts, setSoundAlerts] = React.useState(true);
  const [coachActive, setCoachActive] = React.useState(true);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  const [category, setCategory] = React.useState("feedback");
  const [message, setMessage] = React.useState("");

  const handleToggleTheme = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
    alert("✉️ Thank you! Your feedback has been logged to the Study OS technical desk. Enjoy +80 study XP!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
      <div className="xl:col-span-3 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Settings & Workspace</h1>
          <p className="text-xs text-slate-400">Customize visual themes, notification alerts, and auto-save options</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Workspace System Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => handleToggleTheme(false)} className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${!isDarkMode ? "bg-slate-50 dark:bg-zinc-800 border-indigo-500 shadow-md scale-[1.02]" : "bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 hover:bg-slate-50/50"}`}>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Sun size={20} /></div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200">Slate Light Theme</h4>
                <p className="text-[10px] text-slate-400 leading-normal">High contrast off-whites with dark text. Highly recommended for sunlight studies.</p>
              </div>
            </button>
            <button onClick={() => handleToggleTheme(true)} className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${isDarkMode ? "bg-slate-50 dark:bg-zinc-800 border-indigo-500 shadow-md scale-[1.02]" : "bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 hover:bg-slate-50/50"}`}>
              <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl shrink-0"><Moon size={20} /></div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200">Deep Space Dark Theme</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Midnight backdrops with dim elements. Minimizes eye fatigue during late night focus.</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Workspace Automation Flags</h3>
          <div className="space-y-3.5 divide-y divide-slate-50 dark:divide-zinc-800/60">
            {[
              { id: "autoSave", label: "Continuous Auto-Save", desc: "Save lecture notes automatically to browser cache", value: autoSave, onChange: () => setAutoSave(!autoSave) },
              { id: "soundAlerts", label: "Sound Machine Alerts", desc: "Auditory pings when study loops complete", value: soundAlerts, onChange: () => setSoundAlerts(!soundAlerts) },
              { id: "coachActive", label: "Persistent AI Coach Companion", desc: "Display assistant panel on side margins of Dashboard", value: coachActive, onChange: () => setCoachActive(!coachActive) },
            ].map((flag) => (
              <div key={flag.id} className="flex items-center justify-between pt-3 text-xs first:pt-1">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-700 dark:text-zinc-300">{flag.label}</h4>
                  <p className="text-[10px] text-slate-400">{flag.desc}</p>
                </div>
                <input type="checkbox" checked={flag.value} onChange={flag.onChange} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Help Center & FAQ</h3>
          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div key={idx} className="border-b border-slate-100 dark:border-zinc-800 pb-2 text-xs">
                  <button onClick={() => setExpandedFaq(isExpanded ? null : idx)} className="w-full flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300 py-1.5 hover:text-indigo-600 transition-colors cursor-pointer">
                    <span className="text-left">{faq.q}</span>
                    <span>{isExpanded ? "−" : "+"}</span>
                  </button>
                  {isExpanded && <p className="text-[11px] text-slate-400 leading-normal pt-1 text-left">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Direct Student Feedback</h3>
          <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs text-left">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 focus:outline-none bg-slate-50 dark:bg-zinc-950">
                <option value="feedback">General Feedback</option>
                <option value="bug">Report Bug / Glitch</option>
                <option value="feature">Request Feature</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Message</label>
              <textarea required rows={3} placeholder="Message details..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 focus:outline-none bg-slate-50 dark:bg-zinc-950 resize-none" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition-colors">
              <Send size={12} /><span>Submit Form</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
