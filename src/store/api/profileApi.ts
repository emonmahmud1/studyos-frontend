import { baseApi } from "./baseApi";

export interface FullProfile {
  id: string; name: string; email: string; avatar?: string;
  xp: number; level: number; streak: number; role: string;
  lastActiveDate?: string; createdAt: string;
  stats: {
    totalSubjects: number; totalNotes: number; totalTasks: number;
    completedTasks: number; totalDecks: number; totalEvents: number;
    pomodoroSessions: number; totalFocusMinutes: number; completedPomodoros: number;
  };
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<FullProfile, void>({
      query: () => "/profile",
      providesTags: ["Profile"],
    }),
    addXp: builder.mutation<{ xp: number; level: number }, { amount: number }>({
      query: (body) => ({ url: "/users/me/xp", method: "PATCH", body }),
      invalidatesTags: ["User", "Profile"],
    }),
  }),
});

export const { useGetProfileQuery, useAddXpMutation } = profileApi;
