import { baseApi } from "./baseApi";

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string; name: string; email: string; avatar?: string;
    xp: number; level: number; streak: number; role: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User", "Profile"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    getMe: builder.query<AuthResponse["user"], void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
