"use client";

import React from "react";
import { Folder, Tag, Pin, Plus, Search, BookOpen, Trash2, FileText, Sparkles, ArrowLeft, Save } from "lucide-react";
import { useGetNotesQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation, useTogglePinNoteMutation, Note } from "@/store/api/notesApi";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";
import { useSummarizeNoteMutation } from "@/store/api/aiApi";

const allTags = ["EXAM", "PRIORITY", "DRAFT"];

export default function NotesWorkspace() {
  const { data: notes = [] } = useGetNotesQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [togglePin] = useTogglePinNoteMutation();
  const [summarize] = useSummarizeNoteMutation();

  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);
  const [activeFolder, setActiveFolder] = React.useState("All Notes");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editTitle, setEditTitle] = React.useState("");
  const [editContent, setEditContent] = React.useState("");
  const [editSubjectId, setEditSubjectId] = React.useState("");
  const [editFolder, setEditFolder] = React.useState("");
  const [editTags, setEditTags] = React.useState<string[]>([]);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [folders, setFolders] = React.useState(["Computer Science", "Advanced Calculus", "History of Art", "Organic Chemistry"]);
  const [newFolderName, setNewFolderName] = React.useState("");

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubjectId(note.subjectId || "");
    setEditFolder(note.folder);
    setEditTags(note.tags);
    setAiSummary(null);
  };

  const handleAddNewNote = async (folderName?: string) => {
    const selectedFolder = folderName || (activeFolder !== "All Notes" ? activeFolder : "General");
    const result = await createNote({
      title: "Untitled Study Note",
      subjectId: subjects[0]?.id,
      folder: selectedFolder,
      content: "# New Study Document\n\nStart jotting down lecture notes here.",
      pinned: false,
      tags: ["DRAFT"],
    }).unwrap();
    handleSelectNote(result);
  };

  const handleSaveNote = async () => {
    if (!selectedNoteId) return;
    await updateNote({ id: selectedNoteId, title: editTitle, content: editContent, subjectId: editSubjectId || undefined, folder: editFolder, tags: editTags });
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(noteId);
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePin(note.id);
  };

  const handleGenerateSummary = async () => {
    if (!editContent.trim()) return;
    setIsSummarizing(true);
    setAiSummary(null);
    try {
      const result = await summarize({ title: editTitle, content: editContent }).unwrap();
      setAiSummary(result.summary);
    } catch {
      setAiSummary("### ⚠️ AI summarization unavailable. Please check backend connection.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || folders.includes(newFolderName.trim())) return;
    setFolders([...folders, newFolderName.trim()]);
    setNewFolderName("");
  };

  const filteredNotes = notes.filter((note) => {
    const matchesFolder = activeFolder === "All Notes" || note.folder === activeFolder;
    const matchesTag = !activeTag || note.tags.includes(activeTag);
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesTag && matchesSearch;
  });

  const pinnedNotes = notes.filter((n) => n.pinned);

  return (
    <div className="flex gap-4 md:gap-6 h-[calc(100vh-100px)] text-left">
      {/* Sidebar */}
      <div className="w-48 md:w-60 shrink-0 flex flex-col justify-between border-r border-slate-100 dark:border-zinc-800 pr-4 md:pr-5 overflow-y-auto">
        <div className="space-y-6">
          <button onClick={() => handleAddNewNote()} className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer">
            <Plus size={14} /><span>New Note</span>
          </button>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Folders</span>
            <button onClick={() => { setActiveFolder("All Notes"); setActiveTag(null); }} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${activeFolder === "All Notes" ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/30"}`}>
              <div className="flex items-center gap-2"><Folder size={14} className="text-slate-400" /><span>All Notes</span></div>
              <span className="text-[10px] font-mono text-slate-400">{notes.length}</span>
            </button>
            {folders.map((folder) => {
              const count = notes.filter((n) => n.folder === folder).length;
              return (
                <button key={folder} onClick={() => { setActiveFolder(folder); setActiveTag(null); }} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${activeFolder === folder ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/30"}`}>
                  <div className="flex items-center gap-2 truncate"><Folder size={14} className="text-indigo-400 shrink-0" /><span className="truncate">{folder}</span></div>
                  <span className="text-[10px] font-mono text-slate-400">{count}</span>
                </button>
              );
            })}
            <form onSubmit={handleAddFolder} className="pt-2 px-1">
              <input type="text" placeholder="+ Add Folder" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500" />
            </form>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Tags</span>
            <div className="flex flex-wrap gap-1.5 p-1">
              {allTags.map((tag) => {
                const isSelected = activeTag === tag;
                return (
                  <button key={tag} onClick={() => setActiveTag(isSelected ? null : tag)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide cursor-pointer ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-zinc-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800"}`}>
                    <Tag size={10} /><span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between"><span>Storage Engine</span><span className="text-emerald-500 font-bold">LOCAL</span></div>
          <div className="flex items-center justify-between"><span>Synced to cloud</span><span>Never lost</span></div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        {!selectedNoteId ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80">
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input type="text" placeholder="Search inside study materials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Active filter:</span>
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">{activeFolder}</span>
                {activeTag && <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded font-bold uppercase">{activeTag}</span>}
              </div>
            </div>

            {pinnedNotes.length > 0 && activeFolder === "All Notes" && !activeTag && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                  <Pin size={14} className="text-indigo-500 rotate-45" /><span>Pinned Masteries</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => {
                    const subject = subjects.find((s) => s.id === note.subjectId);
                    return (
                      <div key={note.id} onClick={() => handleSelectNote(note)} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 hover:border-indigo-400 cursor-pointer shadow-sm hover:shadow transition-all relative flex flex-col justify-between h-36 text-left">
                        <button onClick={(e) => handleTogglePin(note, e)} className="absolute right-3 top-3 text-indigo-500 hover:text-slate-400 cursor-pointer"><Pin size={14} className="fill-indigo-500 rotate-45" /></button>
                        <div>
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{note.folder}</span>
                          <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs line-clamp-1 mt-0.5">{note.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">{note.content.replace(/[#*`]/g, "")}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                          <span>{note.lastModified}</span>
                          {subject && <span className="bg-slate-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-semibold text-slate-500">{subject.name.substring(0, 10)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-50 dark:border-zinc-800/80 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Document Index ({filteredNotes.length})</h3>
                <button onClick={() => handleAddNewNote()} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"><Plus size={14} /><span>Add Document</span></button>
              </div>
              {filteredNotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
                    <thead className="bg-slate-50 dark:bg-zinc-900/40 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Document Title</th>
                        <th className="px-6 py-3 hidden md:table-cell">Subject</th>
                        <th className="px-6 py-3 hidden lg:table-cell">Folder</th>
                        <th className="px-6 py-3 hidden lg:table-cell">Last Synced</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                      {filteredNotes.map((note) => {
                        const subject = subjects.find((s) => s.id === note.subjectId);
                        return (
                          <tr key={note.id} onClick={() => handleSelectNote(note)} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 cursor-pointer transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-zinc-200">
                              <div className="flex items-center gap-2">
                                <FileText size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px] md:max-w-xs">{note.title}</span>
                                {note.pinned && <Pin size={10} className="text-indigo-500 fill-indigo-500 rotate-45" />}
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">{subject ? <span className="font-semibold text-indigo-600 dark:text-indigo-400">{subject.name}</span> : "General"}</td>
                            <td className="px-6 py-4 font-medium hidden lg:table-cell">{note.folder}</td>
                            <td className="px-6 py-4 text-slate-400 hidden lg:table-cell">{note.lastModified}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={(e) => handleTogglePin(note, e)} className="text-slate-400 hover:text-indigo-600 cursor-pointer" title="Pin Note"><Pin size={12} className={note.pinned ? "fill-indigo-500 text-indigo-500" : ""} /></button>
                              <button onClick={(e) => handleDelete(note.id, e)} className="text-slate-400 hover:text-rose-500 cursor-pointer" title="Delete"><Trash2 size={12} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 rounded-full flex items-center justify-center mx-auto text-indigo-500"><BookOpen size={20} /></div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-300 text-sm">No notes in this folder yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Folders are a great way to group study guides, reading summaries, and class homework.</p>
                  </div>
                  <button onClick={() => handleAddNewNote(activeFolder)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Create First Note</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 shrink-0 flex-wrap gap-2">
              <button onClick={() => { handleSaveNote(); setSelectedNoteId(null); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 cursor-pointer font-semibold">
                <ArrowLeft size={14} /><span>All Documents</span>
              </button>
              <div className="flex items-center gap-2">
                <button onClick={handleGenerateSummary} disabled={isSummarizing || !editContent.trim()} className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
                  <Sparkles size={13} className={isSummarizing ? "animate-spin" : ""} />
                  <span>{isSummarizing ? "Summarizing..." : "Summarize with AI"}</span>
                </button>
                <button onClick={handleSaveNote} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer">
                  <Save size={13} /><span>Save Notes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex flex-col overflow-hidden">
                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject</label>
                      <select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none">
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Folder</label>
                      <select value={editFolder} onChange={(e) => setEditFolder(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none">
                        {folders.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Note Title" className="w-full text-lg font-bold text-slate-800 dark:text-zinc-100 border-none outline-none focus:ring-0 p-0 bg-transparent" />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Structure your thoughts with Markdown..." className="w-full flex-1 bg-transparent border-none outline-none resize-none text-xs font-mono text-slate-700 dark:text-zinc-300 leading-relaxed overflow-y-auto focus:ring-0 p-0 min-h-[200px]" />
                </div>
                <div className="pt-3 border-t border-slate-50 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                  <span className="font-mono">Characters: {editContent.length}</span>
                  <div className="flex gap-1">
                    {editTags.map((tag) => <span key={tag} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">{tag}</span>)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900/30 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex flex-col overflow-hidden">
                <div className="flex border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">
                  <span className="px-5 py-3 text-xs font-bold text-slate-800 dark:text-zinc-200 border-b-2 border-indigo-500">HTML Preview</span>
                  <span className="px-5 py-3 text-xs font-medium text-slate-400">AI Insights & Summaries</span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {aiSummary && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-left text-xs text-slate-700 dark:text-zinc-300 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-indigo-100/40 text-indigo-700 dark:text-indigo-400">
                        <Sparkles size={14} className="animate-pulse" />
                        <span className="font-bold tracking-wide uppercase">AI Summary Generated</span>
                      </div>
                      <div className="prose prose-sm max-w-none font-sans whitespace-pre-wrap">{aiSummary}</div>
                    </div>
                  )}
                  {isSummarizing && (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mx-auto text-indigo-500"><Sparkles size={18} className="animate-spin" /></div>
                      <p className="text-xs text-slate-400 font-medium">Gemini is organizing highlights and definitions...</p>
                    </div>
                  )}
                  <div className="prose prose-sm prose-slate dark:prose-invert text-left text-xs max-w-none">
                    <h2 className="text-base font-black text-slate-800 dark:text-zinc-100">{editTitle}</h2>
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-600 dark:text-zinc-300">{editContent.replace(/##\s/g, "#### ").replace(/#\s/g, "### ")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
