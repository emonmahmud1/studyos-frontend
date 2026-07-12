"use client";

import React from "react";
import { Play, Pause, RotateCcw, FastForward, Volume2, Clock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

const ambientSounds = [
  { id: "rain", label: "Rainfall", icon: "🌧️", desc: "Soothing white noise" },
  { id: "cafe", label: "Cafe Vibes", icon: "☕", desc: "Chatter and coffee cups" },
  { id: "forest", label: "Forest Calm", icon: "🌲", desc: "Whispering pines and wind" },
  { id: "sea", label: "Deep Sea", icon: "🌊", desc: "Swaying underwater waves" },
];

// ---- Web Audio API sound engine ----
type SoundNodes = { source: AudioBufferSourceNode; gain: GainNode };

function createWhiteNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function buildSoundGraph(ctx: AudioContext, soundId: string, gainNode: GainNode): AudioBufferSourceNode {
  const source = createWhiteNoise(ctx);

  if (soundId === "rain") {
    // White noise → lowpass (heavy rain texture)
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    lp.Q.value = 0.5;
    source.connect(lp);
    lp.connect(gainNode);
  } else if (soundId === "cafe") {
    // Band-pass mid-range → gentle chatter feel
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 0.8;
    // Add a slow LFO tremolo for "activity" feeling
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 0.25;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain as unknown as AudioNode);
    lfo.start();
    source.connect(bp);
    bp.connect(gainNode);
  } else if (soundId === "forest") {
    // Pink-ish noise: lowpass at mid-high → wind in trees
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3500;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 200;
    // Slow volume swell (wind gusts)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain as unknown as AudioNode);
    lfo.start();
    source.connect(hp);
    hp.connect(lp);
    lp.connect(gainNode);
  } else if (soundId === "sea") {
    // Deep lowpass + very slow LFO → waves rolling in
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 600;
    lp.Q.value = 1.2;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.45;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain as unknown as AudioNode);
    lfo.start();
    source.connect(lp);
    lp.connect(gainNode);
  } else {
    source.connect(gainNode);
  }

  source.start();
  return source;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function PomodoroFocus() {
  const { pomodoroState, setPomodoroState, incrementFocusTime } = useApp();
  const [activeSound, setActiveSound] = React.useState<string | null>(null);
  const [volume, setVolume] = React.useState(50);
  const [history, setHistory] = React.useState([
    { id: 1, type: "Deep Work", duration: "25 min", status: "completed", time: "09:00 AM" },
    { id: 2, type: "Quick Focus", duration: "15 min", status: "completed", time: "10:15 AM" },
    { id: 3, type: "Deep Work", duration: "25 min", status: "interrupted", time: "11:00 AM" },
  ]);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const soundNodesRef = React.useRef<SoundNodes | null>(null);

  const handleToggleTimer = () => setPomodoroState((prev) => ({ ...prev, isRunning: !prev.isRunning }));

  const handleReset = () => {
    setPomodoroState((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === "focus" ? 25 * 60 : prev.mode === "shortBreak" ? 5 * 60 : 10 * 60,
    }));
  };

  const handleSkip = () => {
    const isFocus = pomodoroState.mode === "focus";
    const nextMode = isFocus ? "shortBreak" : "focus";
    const nextTime = nextMode === "focus" ? 25 * 60 : 5 * 60;
    setPomodoroState({ isRunning: false, timeLeft: nextTime, mode: nextMode });
    if (isFocus) {
      incrementFocusTime(25);
      setHistory((prev) => [{ id: Date.now(), type: "Deep Work", duration: "25 min", status: "completed", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...prev]);
    }
  };

  const handleSelectMode = (mode: "focus" | "shortBreak" | "longBreak") => {
    const times = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 10 * 60 };
    setPomodoroState({ isRunning: false, timeLeft: times[mode], mode });
  };

  // Stop currently playing sound
  const stopSound = React.useCallback(() => {
    if (soundNodesRef.current) {
      try {
        soundNodesRef.current.source.stop();
        soundNodesRef.current.gain.disconnect();
      } catch { /* already stopped */ }
      soundNodesRef.current = null;
    }
  }, []);

  const handleToggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      // Turn off
      stopSound();
      setActiveSound(null);
      return;
    }
    // Turn on new sound
    stopSound();
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume / 100;
    gainNode.connect(ctx.destination);
    const source = buildSoundGraph(ctx, soundId, gainNode);
    soundNodesRef.current = { source, gain: gainNode };
    setActiveSound(soundId);
  };

  // Sync volume slider to live gain node
  React.useEffect(() => {
    if (soundNodesRef.current) {
      soundNodesRef.current.gain.gain.value = volume / 100;
    }
  }, [volume]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => { stopSound(); audioCtxRef.current?.close(); };
  }, [stopSound]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
      <div className="xl:col-span-2 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Pomodoro Focus</h1>
          <p className="text-xs text-slate-400">Immerse yourself in deep learning. Scientifically proven timeboxing loops.</p>
        </div>

        {/* Central Timer */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          {pomodoroState.isRunning && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-pulse" />
          )}

          <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl gap-1 mb-8 flex-wrap justify-center">
            {[
              { mode: "focus" as const, label: "Deep Work (25m)" },
              { mode: "shortBreak" as const, label: "Quick Focus (15m)" },
              { mode: "longBreak" as const, label: "Long Break (10m)" },
            ].map(({ mode, label }) => (
              <button key={mode} onClick={() => handleSelectMode(mode)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${pomodoroState.mode === mode ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight text-slate-800 dark:text-zinc-100 select-none">
              {formatTime(pomodoroState.timeLeft)}
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold tracking-widest uppercase">
              <Sparkles size={13} className={pomodoroState.isRunning ? "animate-spin text-indigo-500" : ""} />
              <span>{pomodoroState.mode === "focus" ? "Focus on Study Materials" : pomodoroState.mode === "shortBreak" ? "Stretch & Walk" : "Enjoy Long Rest"}</span>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-10">
            <button onClick={handleReset} className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 rounded-full cursor-pointer transition-transform hover:rotate-[-45deg]" title="Reset">
              <RotateCcw size={18} />
            </button>
            <button onClick={handleToggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer active:scale-95 transition-all ${pomodoroState.isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
              {pomodoroState.isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={handleSkip} className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 rounded-full cursor-pointer" title="Skip Mode">
              <FastForward size={18} />
            </button>
          </div>
        </div>

        {/* Ambient Sound Machine */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-indigo-500" />
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Binaural Soundscape Generator</h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Focus Grounding</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ambientSounds.map((sound) => {
              const isActive = activeSound === sound.id;
              return (
                <button key={sound.id} onClick={() => handleToggleSound(sound.id)} className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${isActive ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold scale-[1.02]" : "bg-slate-50 dark:bg-zinc-950 border-slate-200/60 dark:border-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900"}`}>
                  <span className="text-2xl block mb-2">{sound.icon}</span>
                  <span className="text-xs font-bold block">{sound.label}</span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-1 line-clamp-1">{sound.desc}</span>
                </button>
              );
            })}
          </div>

          {activeSound && (
            <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200/40">
              <Volume2 size={14} className="text-indigo-600 animate-bounce" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Generator volume</span>
                  <span>{volume}%</span>
                </div>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Focus Analytics Today</h3>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider"><Clock size={12} /><span>Minutes Focus</span></div>
              <span className="text-lg font-black font-mono text-slate-700 dark:text-zinc-200 block mt-1">75 min</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider"><CheckCircle2 size={12} /><span>Loops Done</span></div>
              <span className="text-lg font-black font-mono text-slate-700 dark:text-zinc-200 block mt-1">3 Sessions</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Continuous Focus History</h3>
          <div className="space-y-3">
            {history.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                <div className="flex items-center gap-2.5">
                  {log.status === "completed" ? (
                    <div className="p-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded"><CheckCircle2 size={14} /></div>
                  ) : (
                    <div className="p-1 bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400 rounded"><AlertTriangle size={14} /></div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{log.type}</h4>
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono block">{log.duration}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${log.status === "completed" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
