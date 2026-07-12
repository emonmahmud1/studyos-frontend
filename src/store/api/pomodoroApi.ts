import { baseApi } from "./baseApi";

export type PomodoroMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

export interface PomodoroSession {
  id: string; mode: PomodoroMode; duration: number;
  completed: boolean; userId: string; createdAt: string;
}

export interface PomodoroStats {
  totalSessions: number; completedFocusSessions: number;
  totalFocusMinutes: number; todayFocusMinutes: number; todaySessions: number;
}

export const pomodoroApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    logSession: builder.mutation<PomodoroSession, { mode: PomodoroMode; duration: number; completed?: boolean }>({
      query: (body) => ({ url: "/pomodoro/sessions", method: "POST", body }),
      invalidatesTags: ["Pomodoro", "User"],
    }),
    getSessions: builder.query<PomodoroSession[], number | void>({
      query: (limit) => ({ url: "/pomodoro/sessions", params: limit ? { limit } : {} }),
      providesTags: ["Pomodoro"],
    }),
    getPomodoroStats: builder.query<PomodoroStats, void>({
      query: () => "/pomodoro/stats",
      providesTags: ["Pomodoro"],
    }),
  }),
});

export const {
  useLogSessionMutation,
  useGetSessionsQuery,
  useGetPomodoroStatsQuery,
} = pomodoroApi;
