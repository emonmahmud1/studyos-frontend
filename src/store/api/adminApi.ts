import { baseApi } from "./baseApi";

// ── Types ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string; name: string; email: string; role: "USER" | "ADMIN";
  avatar?: string; xp: number; level: number; streak: number;
  lastActiveDate?: string; createdAt: string; updatedAt: string;
  _count?: { notes: number; tasks: number; subjects: number; decks: number; sessions: number };
}

export interface OverviewData {
  kpis: {
    totalUsers: number; totalNotes: number; totalTasks: number;
    completedTasks: number; taskCompletionRate: number;
    totalSubjects: number; totalDecks: number; totalEvents: number;
    totalResources: number; totalPomodoroSessions: number;
    completedPomodoro: number; totalFocusMinutes: number;
  };
  userGrowth: { date: string; count: number }[];
  recentUsers: Pick<AdminUser, "id" | "name" | "email" | "xp" | "level" | "createdAt">[];
  topUsers: Pick<AdminUser, "id" | "name" | "email" | "xp" | "level" | "streak">[];
  featureUsage: { name: string; count: number }[];
}

export interface AnalyticsData {
  pomodoroByMode: { mode: string; count: number; totalMinutes: number }[];
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  notesByFolder: { folder: string; count: number }[];
  eventsByType: { type: string; count: number }[];
  resourcesByType: { type: string; count: number }[];
  topActiveUsers: AdminUser[];
  dailyPomodoroChart: { date: string; sessions: number; minutes: number }[];
}

export interface GamificationData {
  xpLeaderboard: Pick<AdminUser, "id" | "name" | "email" | "xp" | "level" | "streak" | "avatar">[];
  streakLeaderboard: Pick<AdminUser, "id" | "name" | "email" | "xp" | "streak">[];
  levelDistribution: { level: number; users: number }[];
}

export interface SystemInfo {
  app: { name: string; version: string; environment: string; port: string | number; uptime: number; nodeVersion: string };
  database: { status: string; provider: string; users: number; notes: number; pomodoroSessions: number };
  ai: { provider: string; model: string; configured: boolean };
  features: { registration: boolean; aiFeatures: boolean; maintenanceMode: boolean };
}

export interface PaginatedUsers {
  data: AdminUser[]; total: number; page: number; limit: number; totalPages: number;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<OverviewData, void>({
      query: () => "/admin/overview",
      providesTags: ["User"],
    }),
    getAdminUsers: builder.query<PaginatedUsers, { search?: string; role?: string; page?: number; limit?: number }>({
      query: (params) => ({ url: "/admin/users", params }),
      providesTags: ["User"],
    }),
    getAdminUser: builder.query<AdminUser, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_, __, id) => [{ type: "User", id }],
    }),
    updateUserRole: builder.mutation<AdminUser, { id: string; role: "USER" | "ADMIN" }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: ["User"],
    }),
    adminAddXp: builder.mutation<{ xp: number; level: number }, { id: string; amount: number }>({
      query: ({ id, amount }) => ({ url: `/admin/users/${id}/xp`, method: "PATCH", body: { amount } }),
      invalidatesTags: ["User"],
    }),
    adminResetPassword: builder.mutation<{ message: string; token: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}/reset-password`, method: "PATCH" }),
    }),
    adminDeleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    getAdminAnalytics: builder.query<AnalyticsData, void>({
      query: () => "/admin/analytics",
    }),
    getAdminGamification: builder.query<GamificationData, void>({
      query: () => "/admin/gamification",
      providesTags: ["User"],
    }),
    getAdminSystem: builder.query<SystemInfo, void>({
      query: () => "/admin/system",
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateUserRoleMutation,
  useAdminAddXpMutation,
  useAdminResetPasswordMutation,
  useAdminDeleteUserMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminGamificationQuery,
  useGetAdminSystemQuery,
} = adminApi;
