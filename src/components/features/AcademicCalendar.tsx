"use client";

import React from "react";
import { Clock, Plus, Info, X } from "lucide-react";
import { useGetEventsQuery, useCreateEventMutation, EventType } from "@/store/api/eventsApi";
import { useGetSubjectsQuery } from "@/store/api/subjectsApi";

export default function AcademicCalendar() {
  const { data: events = [] } = useGetEventsQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createEvent] = useCreateEventMutation();

  const [selectedDate, setSelectedDate] = React.useState<string>("2026-07-12");
  const [showAddEvent, setShowAddEvent] = React.useState(false);
  const [newEventTitle, setNewEventTitle] = React.useState("");
  const [newEventType, setNewEventType] = React.useState<EventType>("STUDY");
  const [newEventDate, setNewEventDate] = React.useState("2026-07-12");
  const [newEventTime, setNewEventTime] = React.useState("14:00 - 15:30");
  const [newEventDesc, setNewEventDesc] = React.useState("");
  const [newEventSubjectId, setNewEventSubjectId] = React.useState("");

  const paddingDays = 2;
  const totalDays = 31;
  const daysArray: { dayNumber: number | null; dateString: string }[] = [];
  for (let i = 0; i < paddingDays; i++) daysArray.push({ dayNumber: null, dateString: "" });
  for (let i = 1; i <= totalDays; i++) {
    const dayStr = i.toString().padStart(2, "0");
    daysArray.push({ dayNumber: i, dateString: `2026-07-${dayStr}` });
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    await createEvent({
      title: newEventTitle.trim(),
      type: newEventType,
      date: newEventDate,
      time: newEventTime,
      description: newEventDesc.trim() || "Scheduled study session",
      subjectId: newEventSubjectId || undefined,
    });
    setNewEventTitle(""); setNewEventDesc(""); setNewEventTime("14:00 - 15:30");
    setShowAddEvent(false);
  };

  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "EXAM": return "bg-rose-500 text-white";
      case "ASSIGNMENT": return "bg-amber-500 text-white";
      case "STUDY": return "bg-indigo-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const getEventTypePillColor = (type: string) => {
    switch (type) {
      case "EXAM": return "bg-rose-50 text-rose-600 border-rose-100";
      case "ASSIGNMENT": return "bg-amber-50 text-amber-600 border-amber-100";
      case "STUDY": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
      <div className="xl:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Academic Calendar</h1>
            <p className="text-xs text-slate-400">Coordinated semester schedule. Click days to load schedules and milestones.</p>
          </div>
          <button onClick={() => setShowAddEvent(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer">
            <Plus size={14} /><span>Add Event</span>
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-zinc-800/40">
            <h3 className="font-extrabold text-slate-800 dark:text-zinc-200 text-base">July 2026</h3>
            <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono font-semibold">Summer Sem</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, idx) => {
              const isSelected = day.dateString === selectedDate;
              const isToday = day.dateString === "2026-07-12";
              const dayEvents = events.filter((e) => e.date === day.dateString);
              return (
                <div key={idx} onClick={() => day.dateString && setSelectedDate(day.dateString)} className={`min-h-[76px] p-2 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${!day.dayNumber ? "bg-slate-50/20 dark:bg-zinc-900/10 border-transparent cursor-default pointer-events-none" : isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 shadow-sm" : isToday ? "bg-white dark:bg-zinc-900 border-indigo-300 ring-2 ring-indigo-500/10" : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800/80 hover:border-slate-300"}`}>
                  {day.dayNumber ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black font-mono ${isToday ? "bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold" : "text-slate-700 dark:text-zinc-300"}`}>{day.dayNumber}</span>
                        {dayEvents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </div>
                      <div className="space-y-1 mt-1.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div key={ev.id} className={`text-[8px] font-bold px-1 py-0.5 rounded truncate leading-tight ${getEventTypeColor(ev.type)}`} title={ev.title}>{ev.title}</div>
                        ))}
                        {dayEvents.length > 2 && <span className="text-[7px] text-slate-400 font-mono pl-1">+{dayEvents.length - 2} more</span>}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-50 dark:border-zinc-800/40 pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Daily Agenda</span>
            <h3 className="font-extrabold text-slate-800 dark:text-zinc-200 text-sm mt-0.5">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </h3>
          </div>
          <div className="space-y-3.5">
            {selectedDateEvents.length > 0 ? selectedDateEvents.map((ev) => {
              const subject = subjects.find((s) => s.id === ev.subjectId);
              return (
                <div key={ev.id} className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/40 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-zinc-300">{ev.title}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1"><Clock size={11} /><span>{ev.time}</span></div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded ${getEventTypePillColor(ev.type)}`}>{ev.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-100/40 pt-1.5">{ev.description}</p>
                  {subject && <span className="inline-block text-[9px] font-semibold text-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 px-2 py-0.5 rounded">• {subject.name}</span>}
                </div>
              );
            }) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Info size={24} className="mx-auto text-slate-300" />
                <p className="text-xs max-w-[180px] mx-auto">No lectures, homework deadlines, or study blocks logged for this day.</p>
              </div>
            )}
          </div>
        </div>

        {selectedDate === "2026-07-12" && (
          <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs text-left space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">Office Hour Reminders</h4>
            <div className="p-2.5 bg-white dark:bg-zinc-900 rounded border border-slate-100">
              <span className="font-semibold block text-[11px]">Prof. Miller OH</span>
              <span className="text-[10px] text-slate-400 block font-mono">15:00 - 16:30 @ CS Bldg R402</span>
            </div>
          </div>
        )}
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">Schedule Academic Event</h3>
              <button onClick={() => setShowAddEvent(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-semibold">Cancel</button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Event Title</label>
                <input type="text" required value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none" placeholder="e.g. History Final Midterm..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-zinc-400">Event Type</label>
                  <select value={newEventType} onChange={(e) => setNewEventType(e.target.value as EventType)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none">
                    <option value="EXAM">Exam / Quiz</option>
                    <option value="ASSIGNMENT">Assignment Deadline</option>
                    <option value="STUDY">Study Block / Focus</option>
                    <option value="OTHER">General / Lab</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-zinc-400">Associated Subject</label>
                  <select value={newEventSubjectId} onChange={(e) => setNewEventSubjectId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none">
                    <option value="">None / General</option>
                    {subjects.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-zinc-400">Date</label>
                  <input type="date" required value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-zinc-400">Time Interval</label>
                  <input type="text" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none" placeholder="e.g. 10:00 - 12:00" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-zinc-400">Event Description</label>
                <textarea value={newEventDesc} onChange={(e) => setNewEventDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none resize-none" rows={2} placeholder="Additional details..." />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button type="button" onClick={() => setShowAddEvent(false)} className="px-4 py-2 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-slate-500 rounded-lg font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
