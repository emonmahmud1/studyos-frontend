"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = React.useState("alex@university.edu");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    try {
      const result = await login({ email: "alex@university.edu", password: "password123" }).unwrap();
      dispatch(setCredentials(result));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.data?.message || "Demo login failed. Please ensure the backend is running.");
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans">
      {/* LEFT SIDE: Brand Showcase */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 p-16 flex-col justify-between text-white relative overflow-hidden border-r border-indigo-900/40">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[70%] h-[70%] rounded-full bg-violet-500/15 blur-[150px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">Study OS</span>
        </div>

        <div className="my-auto space-y-8 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-xs text-indigo-300 font-medium tracking-wide">
            <Sparkles size={12} className="text-indigo-400" />
            Empowering students worldwide
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
            Your Entire Academic Universe, In One Workspace.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Organize notes, practice smart flashcards, track exam countdowns, study with customized Pomodoro loops, and synthesize concepts using state-of-the-art AI Study assistants.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono text-indigo-200/80">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
              <BookOpen size={16} className="text-indigo-400" />
              <span>Modular Notebooks</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
              <GraduationCap size={16} className="text-indigo-400" />
              <span>Active Quiz Labs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="italic text-slate-300 text-sm">
            &ldquo;The beautiful thing about learning is that nobody can take it away from you.&rdquo;
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300 font-mono">
              BB
            </div>
            <span className="text-xs text-slate-400 font-semibold">— B.B. King</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-16 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm">
              Enter your student portal to access your workspaces.
            </p>
          </div>

          {/* Quick Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-indigo-300 dark:border-indigo-700 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} className="text-indigo-500" />
            <span>Quick Demo Login</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800" />
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-mono uppercase tracking-widest">
              or credentials
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800" />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="you@university.edu"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Password</label>
                <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Enter password"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Stay signed in for 30 days</span>
              </label>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold font-mono">
                SECURE
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg py-3 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Enter Study OS Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <span className="text-xs text-slate-400 dark:text-zinc-500">
              Demo credentials: <span className="font-mono text-indigo-500">alex@university.edu / password123</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
