"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout as reduxLogout } from "@/store/slices/authSlice";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  mode: PomodoroMode;
}

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  pomodoroState: PomodoroState;
  setPomodoroState: React.Dispatch<React.SetStateAction<PomodoroState>>;
  focusTimeToday: number;
  incrementFocusTime: (minutes: number) => void;
  handleLogout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [focusTimeToday, setFocusTimeToday] = useState(0);
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: "focus",
  });

  const incrementFocusTime = useCallback((minutes: number) => {
    setFocusTimeToday((prev) => prev + minutes);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    let ticker: ReturnType<typeof setInterval> | null = null;
    if (pomodoroState.isRunning) {
      ticker = setInterval(() => {
        setPomodoroState((prev) => {
          if (prev.timeLeft <= 1) {
            if (ticker) clearInterval(ticker);
            const completedFocus = prev.mode === "focus";
            const nextMode: PomodoroMode = completedFocus ? "shortBreak" : "focus";
            const nextTime = nextMode === "focus" ? 25 * 60 : 5 * 60;
            if (completedFocus) {
              incrementFocusTime(25);
            }
            return { isRunning: false, timeLeft: nextTime, mode: nextMode };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (ticker) clearInterval(ticker);
    };
  }, [pomodoroState.isRunning, incrementFocusTime]);

  const handleLogout = useCallback(() => {
    dispatch(reduxLogout());
  }, [dispatch]);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        pomodoroState,
        setPomodoroState,
        focusTimeToday,
        incrementFocusTime,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
