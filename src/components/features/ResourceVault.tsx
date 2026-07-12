"use client";

import React from "react";
import { Folder, FileText, Video, Archive, Download, Trash2, ArrowRight, Database, Cloud, CheckCircle2 } from "lucide-react";
import { useGetResourcesQuery, useCreateResourceMutation, useDeleteResourceMutation, ResourceType } from "@/store/api/resourcesApi";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";

const driveFiles = [
  { id: "dr-1", name: "Full Semester Syllabus.pdf", type: "PDF" as ResourceType, size: "1.2 MB", folder: "Lectures" },
  { id: "dr-2", name: "Calculus Formula Reference Sheet.pdf", type: "PDF" as ResourceType, size: "840 KB", folder: "Assignments" },
  { id: "dr-3", name: "CS Midterm Prep Video.mp4", type: "VIDEO" as ResourceType, size: "110 MB", folder: "Lectures" },
];

const FOLDERS = ["All Folders", "Lectures", "Lab Notes", "Assignments", "Archive"];

export default function ResourceVault() {
  const { data: resources = [] } = useGetResourcesQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createResource] = useCreateResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();

  const [activeFolder, setActiveFolder] = React.useState<string>("All Folders");
  const [showDriveSimulator, setShowDriveSimulator] = React.useState(false);
  const [isConnectedToDrive, setIsConnectedToDrive] = React.useState(false);
  const [importingFileId, setImportingFileId] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");
  const [newType, setNewType] = React.useState<ResourceType>("PDF");
  const [newFolder, setNewFolder] = React.useState("Lectures");
  const [newSize, setNewSize] = React.useState("2.4 MB");
  const [newSubjectId, setNewSubjectId] = React.useState("");

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createResource({
      name: newName.trim(),
      type: newType,
      folder: newFolder,
      url: "#",
      size: newSize,
      subjectId: newSubjectId || undefined,
    });
    setNewName(""); setNewSize("2.4 MB");
    alert("📂 Document added to Resource Vault successfully!");
  };

  const handleImportDriveFile = async (file: typeof driveFiles[0]) => {
    setImportingFileId(file.id);
    await createResource({
      name: file.name,
      type: file.type,
      folder: file.folder,
      url: "#",
      size: file.size,
      subjectId: subjects[0]?.id,
    });
    setImportingFileId(null);
    alert(`🎉 Successfully imported "${file.name}" from Google Drive!`);
  };

  const handleDeleteResource = async (resourceId: string) => {
    await deleteResource(resourceId);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video size={16} className="text-rose-500 shrink-0" />;
      case "ARCHIVE": return <Archive size={16} className="text-amber-500 shrink-0" />;
      default: return <FileText size={16} className="text-indigo-500 shrink-0" />;
    }
  };

  const filteredResources = resources.filter((res) => activeFolder === "All Folders" || res.folder === activeFolder);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Vault Folders</span>
        <div className="space-y-1.5">
          {FOLDERS.map((folder) => {
            const count = folder === "All Folders" ? resources.length : resources.filter((r) => r.folder === folder).length;
            return (
              <button key={folder} onClick={() => setActiveFolder(folder)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${activeFolder === folder ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/30"}`}>
                <div className="flex items-center gap-2"><Folder size={15} className="text-indigo-400 shrink-0" /><span>{folder}</span></div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-gradient-to-tr from-slate-50 to-white dark:from-zinc-900/50 dark:to-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 space-y-3">
          <Cloud className="text-indigo-500" size={18} />
          <div className="space-y-1">
            <h4 className="font-bold text-xs">Drive Synchronization</h4>
            <p className="text-[10px] text-slate-400 leading-normal">Sync slides, sheets, or PDF syllabus directly from your student Cloud Drive.</p>
          </div>
          <button onClick={() => setShowDriveSimulator(true)} className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors">
            <span>Open Syncer Panel</span><ArrowRight size={10} />
          </button>
        </div>
      </div>

      <div className="xl:col-span-3 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Documents Library ({filteredResources.length})</h3>
            <span className="text-[10px] bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded font-mono font-semibold text-slate-500 uppercase">{activeFolder}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
              <thead className="bg-slate-50 dark:bg-zinc-900/30 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-5 py-3">File Name</th>
                  <th className="px-5 py-3 hidden md:table-cell">Associate Subject</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Category Folder</th>
                  <th className="px-5 py-3 hidden lg:table-cell">File Size</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                {filteredResources.map((res) => {
                  const subject = subjects.find((s) => s.id === res.subjectId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-zinc-200">
                        <div className="flex items-center gap-2">{getFileIcon(res.type)}<span className="truncate max-w-[160px] md:max-w-xs">{res.name}</span></div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">{subject ? <span className="font-semibold text-indigo-600 dark:text-indigo-400">{subject.name}</span> : "Unlinked"}</td>
                      <td className="px-5 py-3.5 font-medium hidden lg:table-cell">{res.folder}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 hidden lg:table-cell">{res.size}</td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button onClick={() => alert(`Simulated downloading: ${res.name}`)} className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer" title="Download"><Download size={13} /></button>
                        <button onClick={() => handleDeleteResource(res.id)} className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer" title="Delete"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Upload Document References</h4>
          <form onSubmit={handleManualUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">File Name</label>
              <input type="text" required placeholder="e.g. Lab Syllabus.pdf" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">File Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value as ResourceType)} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none text-xs">
                  <option value="PDF">PDF File</option>
                  <option value="VIDEO">MP4 Video</option>
                  <option value="DOCUMENT">Doc Sheet</option>
                  <option value="ARCHIVE">Zip Archive</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Folder</label>
                <select value={newFolder} onChange={(e) => setNewFolder(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none text-xs">
                  <option value="Lectures">Lectures</option>
                  <option value="Lab Notes">Lab Notes</option>
                  <option value="Assignments">Assignments</option>
                  <option value="Archive">Archive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Size</label>
                <input type="text" required placeholder="e.g. 1.8 MB" value={newSize} onChange={(e) => setNewSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none text-xs" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Associate Subject</label>
                <select value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none text-xs">
                  <option value="">None</option>
                  {subjects.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer h-[38px] transition-colors text-xs">Add Reference</button>
          </form>
        </div>
      </div>

      {showDriveSimulator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Database className="text-indigo-600 animate-pulse" size={18} />
                <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">Google Drive Integrator</h3>
              </div>
              <button onClick={() => setShowDriveSimulator(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-semibold">Cancel</button>
            </div>
            {!isConnectedToDrive ? (
              <div className="text-center py-4 space-y-4 text-xs">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-full flex items-center justify-center mx-auto"><Cloud size={24} /></div>
                <div className="space-y-1.5">
                  <h4 className="font-black text-slate-800 dark:text-zinc-200 text-sm">Simulated Google Workspace OAuth Flow</h4>
                  <p className="text-slate-400 leading-normal max-w-xs mx-auto">Connect your real Google Drive to fetch and parse lecture sheets and notes directly into Study OS in real time!</p>
                </div>
                <button onClick={() => setIsConnectedToDrive(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer">Confirm Integration & Connect</button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg font-semibold">
                  <div className="flex items-center gap-1"><CheckCircle2 size={14} /><span>Connected as alex@university.edu</span></div>
                  <button onClick={() => setIsConnectedToDrive(false)} className="text-slate-400 hover:text-rose-500 font-bold">Disconnect</button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto divide-y divide-slate-50 dark:divide-zinc-800/60">
                  {driveFiles.map((file) => (
                    <div key={file.id} className="py-2.5 flex items-center justify-between text-xs text-left">
                      <div className="flex items-center gap-2 truncate">
                        {file.type === "VIDEO" ? <Video size={16} className="text-rose-500 shrink-0" /> : <FileText size={16} className="text-indigo-500 shrink-0" />}
                        <div>
                          <span className="font-semibold block truncate text-slate-700 dark:text-zinc-200">{file.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{file.size}</span>
                        </div>
                      </div>
                      <button onClick={() => handleImportDriveFile(file)} disabled={importingFileId !== null} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold rounded cursor-pointer disabled:opacity-40">
                        {importingFileId === file.id ? "Pulling..." : "Import"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
