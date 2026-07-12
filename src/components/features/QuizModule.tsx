"use client";

import React from "react";
import { Award, Sparkles, ChevronRight, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";

interface Question { id: number; text: string; options: string[]; answerIdx: number; }

const quizzes: Record<string, Question[]> = {
  "Computer Science": [
    { id: 1, text: "What is the worst-case time complexity of inserting into a balanced Red-Black tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answerIdx: 1 },
    { id: 2, text: "Which data structure uses LIFO (Last-In-First-Out) ordering?", options: ["Queue", "Hash Table", "Stack", "Binary Tree"], answerIdx: 2 },
    { id: 3, text: "Which traversal technique visits the root node first, then the left and right subtrees?", options: ["In-order", "Pre-order", "Post-order", "Level-order"], answerIdx: 1 },
  ],
  "Advanced Mathematics": [
    { id: 1, text: "Which substitution is best for integrating an expression containing sqrt(a^2 - x^2)?", options: ["x = a tan θ", "x = a sin θ", "x = a sec θ", "x = a cos θ"], answerIdx: 1 },
    { id: 2, text: "What is the derivative of e^(2x) with respect to x?", options: ["e^(2x)", "2e^(2x)", "0.5e^(2x)", "2x e^(2x-1)"], answerIdx: 1 },
  ],
};

const leaderboard = [
  { rank: 1, name: "Elena Rostova", score: 12400, avatar: "👩‍💻" },
  { rank: 2, name: "Marcus Johnson", score: 10200, avatar: "👨‍🔬" },
  { rank: 3, name: "Sarah Lindqvist", score: 9800, avatar: "👩‍🎨" },
  { rank: 4, name: "Alex Rivera (You)", score: 8420, avatar: "☕" },
];

const scoreTrends = [
  { name: "Quiz 1", score: 80 },
  { name: "Quiz 2", score: 90 },
  { name: "Quiz 3", score: 85 },
  { name: "Quiz 4", score: 100 },
];

export default function QuizModule() {
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [activeQuizSubject, setActiveQuizSubject] = React.useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = React.useState<number | null>(null);
  const [quizScore, setQuizScore] = React.useState(0);
  const [isQuizComplete, setIsQuizComplete] = React.useState(false);

  const activeQuestions = activeQuizSubject ? quizzes[activeQuizSubject] || [] : [];

  const handleStartQuiz = (subjectName: string) => {
    setActiveQuizSubject(subjectName);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setQuizScore(0);
    setIsQuizComplete(false);
  };

  const handleNextQuestion = () => {
    if (selectedOptionIdx === null) return;
    if (selectedOptionIdx === activeQuestions[currentQuestionIdx]?.answerIdx) setQuizScore((prev) => prev + 1);
    if (currentQuestionIdx < activeQuestions.length - 1) {
      setSelectedOptionIdx(null);
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
      <div className="xl:col-span-3 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Quiz Laboratory</h1>
          <p className="text-xs text-slate-400">Simulate mock midterm questions, measure subject masteries, and challenge peers.</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-900 to-violet-950 text-white p-6 rounded-2xl border border-indigo-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded-full">Practice Mode</span>
              <h2 className="text-lg font-black">Master Your Knowledge</h2>
              <p className="text-xs text-slate-300 max-w-sm">Each completed mock test updates your overall curriculum mastery index. Try Computer Science!</p>
            </div>
            <button onClick={() => handleStartQuiz("Computer Science")} className="bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-sm">Simulate CS Test</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const hasQuiz = !!quizzes[sub.name];
            return (
              <div key={sub.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{sub.category}</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200">{sub.name}</h3>
                  <p className="text-[11px] text-slate-400">{hasQuiz ? `${quizzes[sub.name]?.length} questions ready` : "Waitlist preview"}</p>
                </div>
                {hasQuiz ? (
                  <button onClick={() => handleStartQuiz(sub.name)} className="p-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer font-bold text-xs">Start Test</button>
                ) : (
                  <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-1 rounded font-semibold">Waitlist</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-slate-100/50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-between text-left">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5"><Sparkles size={14} className="text-indigo-500" /><span>AI Quiz Lab Auto-Generator</span></h4>
            <p className="text-[11px] text-slate-400 max-w-sm">We are working on bringing instant PDF syllabus questions parser straight into quizzes.</p>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded font-bold uppercase shrink-0">COMING SOON</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mb-4">Study OS Leaderboard</h3>
          <div className="space-y-3.5">
            {leaderboard.map((peer) => (
              <div key={peer.rank} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-400 w-4 font-mono">{peer.rank}.</span>
                  <span className="text-base">{peer.avatar}</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{peer.name}</span>
                </div>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{peer.score} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mb-2">Average Score Trends</h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-normal">Your performance tracking over the last 4 mock trials.</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreTrends} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {activeQuizSubject && activeQuestions.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6">
            <button onClick={() => setActiveQuizSubject(null)} className="absolute right-6 top-6 p-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer"><X size={16} /></button>
            {!isQuizComplete ? (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Subject Mock Exam</span>
                  <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">{activeQuizSubject}</h3>
                  <p className="text-[11px] text-slate-400">Question {currentQuestionIdx + 1} of {activeQuestions.length}</p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%` }} />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed text-center">{activeQuestions[currentQuestionIdx]?.text}</p>
                </div>
                <div className="space-y-2.5">
                  {activeQuestions[currentQuestionIdx]?.options.map((option, idx) => {
                    const isSelected = selectedOptionIdx === idx;
                    return (
                      <button key={idx} onClick={() => setSelectedOptionIdx(idx)} className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${isSelected ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-400" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40"}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono font-bold ${isSelected ? "border-indigo-500 text-indigo-500" : "border-slate-300"}`}>{String.fromCharCode(65 + idx)}</span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <button onClick={handleNextQuestion} disabled={selectedOptionIdx === null} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold cursor-pointer transition-colors text-xs flex items-center gap-1">
                    <span>{currentQuestionIdx === activeQuestions.length - 1 ? "Submit Exam" : "Next Question"}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md"><Award size={32} /></div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">Mock Exam Completed!</h3>
                  <p className="text-sm text-slate-500">You scored <span className="font-bold text-slate-800 dark:text-zinc-200">{quizScore} / {activeQuestions.length}</span> correct answers.</p>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100/40">
                  <Sparkles size={14} /><span>Logged +150 study XP</span>
                </div>
                <div className="pt-4 flex justify-center gap-2">
                  <button onClick={() => handleStartQuiz(activeQuizSubject)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer text-slate-600">Retake Test</button>
                  <button onClick={() => setActiveQuizSubject(null)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer">Back to Lab</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
