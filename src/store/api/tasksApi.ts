import { baseApi } from "./baseApi";

export type TaskStatus = "TODO" | "PROGRESS" | "REVIEW" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string; title: string; description?: string;
  status: TaskStatus; priority: TaskPriority;
  dueDate?: string; subjectId?: string; userId: string;
  createdAt: string; updatedAt: string;
  subject?: { name: string; color: string };
}

export interface CreateTaskDto {
  title: string; description?: string;
  status?: TaskStatus; priority?: TaskPriority;
  dueDate?: string; subjectId?: string;
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], { status?: TaskStatus } | void>({
      query: (params) => ({ url: "/tasks", params: params || {} }),
      providesTags: ["Tasks"],
    }),
    createTask: builder.mutation<Task, CreateTaskDto>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: builder.mutation<Task, { id: string } & Partial<CreateTaskDto>>({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
