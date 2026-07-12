import { baseApi } from "./baseApi";

export interface Subject {
  id: string; name: string; category: string; mastery: number;
  color: string; examDate?: string; userId: string;
  createdAt: string; updatedAt: string;
  _count?: { notes: number; tasks: number };
}

export interface CreateSubjectDto {
  name: string; category: string; color?: string;
  examDate?: string; mastery?: number;
}

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query<Subject[], void>({
      query: () => "/subjects",
      providesTags: ["Subjects"],
    }),
    getSubject: builder.query<Subject, string>({
      query: (id) => `/subjects/${id}`,
      providesTags: (_, __, id) => [{ type: "Subjects", id }],
    }),
    createSubject: builder.mutation<Subject, CreateSubjectDto>({
      query: (body) => ({ url: "/subjects", method: "POST", body }),
      invalidatesTags: ["Subjects"],
    }),
    updateSubject: builder.mutation<Subject, { id: string } & Partial<CreateSubjectDto>>({
      query: ({ id, ...body }) => ({ url: `/subjects/${id}`, method: "PATCH", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "Subjects", id }, "Subjects"],
    }),
    deleteSubject: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Subjects"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;
