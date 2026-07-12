"use client";

import React from "react";
import { Sparkles, Play, TrendingUp, HelpCircle, X, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useGetDecksQuery, useCreateDeckMutation, useBulkAddCardsMutation } from "@/store/api/flashcardsApi";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";
import { useGenerateFlashcardsMutation } from "@/store/api/aiApi";

const retentionData = [
  { name: "Day 1", retention: 100 },
  { name: "Day 3", retention: 78 },
  { name: "Day 5", retention: 62 },
  { name: "Day 7", retention: 55 },
  { name: "Day 10", retention: 49 },
];

export default function FlashcardLibrary() {
  const { data: decks = [] } = useGetDecksQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createDeck] = useCreateDeckMutation();
  const [bulkAddCards] = useBulkAddCardsMutation();
  const [generateFlashcards] = useGenerateFlashcardsMutation();

  const [activePracticeDeckId, setActivePracticeDeckId] = React.useState<string | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [sessionScore, setSessionScore] = React.useState(0);
  const [aiTopic, setAiTopic] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showAddDeck, setShowAddDeck] = React.useState(false);
  const [newDeckName, setNewDeckName] = React.useState("");
  const [newDeckDesc, setNewDeckDesc] = React.useState("");
  const [newDeckSubjectId, setNewDeckSubjectId] = React.useState("");

  const activeDeck = decks.find((d) => d.id === activePracticeDeckId);

  const handleStartPractice = (deckId: string) => {
    setActivePracticeDeckId(deckId);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setSessionScore(0);
  };

  const handleGradeCard = (rating: "again" | "hard" | "good" | "easy") => {
    const isGood = rating === "good" || rating === "easy";
    if (isGood) setSessionScore((prev) => prev + 1);
    if (activeDeck && currentCardIdx < activeDeck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIdx((prev) => prev + 1), 200);
    } else {
      alert(`🎉 Practice Complete! You got ${sessionScore + (isGood ? 1 : 0)} / ${activeDeck?.cards.length} cards correct!`);
      setActivePracticeDeckId(null);
    }
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateFlashcards({ topic: aiTopic.trim(), quantity: 4 }).unwrap();
      if (result.cards && result.cards.length > 0) {
        const deck = await createDeck({
          name: aiTopic.trim().substring(0, 30),
          subjectId: subjects[0]?.id,
          description: `AI-Synthesized deck focusing on ${aiTopic.trim()}`,
          category: "AI Laboratory",
        }).unwrap();
        await bulkAddCards({ deckId: deck.id, cards: result.cards });
        setAiTopic("");
        alert(`✨ Success! Created a new deck with ${result.cards.length} cards.`);
      }
    } catch {
      alert("Failed to generate flashcards. Ensure GEMINI_API_KEY is configured in the backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const deck = await createDeck({
      name: newDeckName.trim(),
      subjectId: newDeckSubjectId || subjects[0]?.id,
      description: newDeckDesc.trim() || "Manual custom study deck.",
      category: "Personal Study",
    }).unwrap();
    await bulkAddCards({ deckId: deck.id, cards: [{ question: "Click edit to add custom questions here.", answer: "Use deck settings to populate more card components." }] });
    setShowAddDeck(false); setNewDeckName(""); setNewDeckDesc("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left relative">
      <div className="xl:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Flashcard Library</h1>
            <p className="text-xs text-slate-400">Active recall review loops to cement learning and retain definitions</p>
          </div>
          <button onClick={() => setShowAddDeck(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer">
            <Plus size={14} /><span>New Deck</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {decks.map((deck) => {
            const subject = subjects.find((s) => s.id === deck.subjectId);
            return (
              <div key={deck.id} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow transition-all flex flex-col justify-between h-48 text-left">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{deck.category}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{deck.cards.length} Cards</span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 mt-1 line-clamp-1">{deck.name}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{deck.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-zinc-800/40 pt-3 mt-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-zinc-800 flex items-center justify-center font-mono text-[11px] font-black text-indigo-600">{deck.progress}%</div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-medium">Mastery rating</span>
                      {subject && <span className="text-[10px] font-bold text-slate-500">{subject.name}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleStartPractice(deck.id)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/70 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg cursor-pointer transition-all">
                    <Play size={12} className="fill-indigo-600" /><span>Practice Recall</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Generator */}
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles size={12} />AI Laboratory Workspace
            </div>
            <h3 className="text-lg font-black tracking-tight">AI Flashcard Generator</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Synthesize custom decks with dynamic, highly educational questions. Simply input any lecture note theme or subject keyword.</p>
          </div>
          <form onSubmit={handleAiGenerate} className="flex-1 flex gap-2 w-full max-w-sm">
            <input type="text" required placeholder="e.g. Mitochondria synthesis, binary search..." value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            <button type="submit" disabled={isGenerating || !aiTopic.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer">
              {isGenerating ? "Synthesizing..." : "Generate"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mb-4">Memory Recall Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/40">
              <div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Recall Accuracy</span><span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-200">78.2%</span></div>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/40">
              <div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Recall Speed</span><span className="text-xl font-mono font-black text-slate-800 dark:text-zinc-200">2.4s</span></div>
              <HelpCircle size={18} className="text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mb-2">Ebbinghaus Curve</h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-normal">Your retention curves compared against standard human intervals.</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Bar dataKey="retention" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Practice Overlay */}
      {activePracticeDeckId && activeDeck && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6">
            <button onClick={() => setActivePracticeDeckId(null)} className="absolute right-6 top-6 p-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer"><X size={16} /></button>
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Practice Recall Session</span>
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">{activeDeck.name}</h3>
              <p className="text-[11px] text-slate-400">Card {currentCardIdx + 1} of {activeDeck.cards.length}</p>
            </div>
            <div onClick={() => setIsFlipped(!isFlipped)} className={`h-64 border-2 rounded-2xl flex flex-col justify-between p-6 cursor-pointer transition-all duration-300 relative select-none ${isFlipped ? "bg-slate-50 dark:bg-zinc-950 border-indigo-400 shadow-md" : "bg-white dark:bg-zinc-900 hover:border-slate-300 border-slate-200 dark:border-zinc-800"}`}>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>{isFlipped ? "Answer" : "Question"}</span>
                <HelpCircle size={14} className="text-slate-300" />
              </div>
              <div className="my-auto text-center px-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {isFlipped ? activeDeck.cards[currentCardIdx]?.answer : activeDeck.cards[currentCardIdx]?.question}
                </p>
              </div>
              <div className="text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {isFlipped ? "Click card to view question again" : "Click anywhere to reveal answer"}
              </div>
            </div>
            {isFlipped ? (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "again" as const, label: "Again", cls: "bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 border border-rose-200 text-rose-600 dark:text-rose-400" },
                  { id: "hard" as const, label: "Hard", cls: "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 border border-amber-200 text-amber-600 dark:text-amber-400" },
                  { id: "good" as const, label: "Good", cls: "bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 dark:text-indigo-400" },
                  { id: "easy" as const, label: "Easy", cls: "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 dark:text-emerald-400" },
                ].map((btn) => (
                  <button key={btn.id} onClick={() => handleGradeCard(btn.id)} className={`py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${btn.cls}`}>{btn.label}</button>
                ))}
              </div>
            ) : (
              <div className="h-12 flex items-center justify-center">
                <span className="text-xs text-slate-400 italic">Tap the card to check your answer and rate your memory.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Deck Dialog */}
      {showAddDeck && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">Create Study Flashcard Deck</h3>
              <button onClick={() => setShowAddDeck(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-semibold">Cancel</button>
            </div>
            <form onSubmit={handleCreateManualDeck} className="space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Deck Name</label>
                <input type="text" required value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none" placeholder="e.g. World Capitals, Biology Stems..." />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Deck Description</label>
                <textarea value={newDeckDesc} onChange={(e) => setNewDeckDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none resize-none" rows={2} placeholder="Briefly state target topics..." />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Associated Subject</label>
                <select value={newDeckSubjectId} onChange={(e) => setNewDeckSubjectId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none">
                  {subjects.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button type="button" onClick={() => setShowAddDeck(false)} className="px-4 py-2 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-slate-500 rounded-lg font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer">Create Deck</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
