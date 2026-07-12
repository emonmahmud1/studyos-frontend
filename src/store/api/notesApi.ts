import { baseApi } from "./baseApi";

export interface Note {
  id: string; title: string; content: string; folder: string;
  pinned: boolean; tags: string[]; subjectId?: string; userId: string;
  lastModified: string; createdAt: string; updatedAt: string;
  subject?: { name: string; color: string };
}

export interface CreateNoteDto {
  title: string; content: string; folder?: string;
  pinned?: boolean; tags?: string[]; subjectId?: string;
}

export const notesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query<Note[], { folder?: string } | void>({
      query: (params) => ({ url: "/notes", params: params || {} }),
      providesTags: ["Notes"],
    }),
    getNote: builder.query<Note, string>({
      query: (id) => `/notes/${id}`,
      providesTags: (_, __, id) => [{ type: "Notes", id }],
    }),
    createNote: builder.mutation<Note, CreateNoteDto>({
      query: (body) => ({ url: "/notes", method: "POST", body }),
      invalidatesTags: ["Notes"],
    }),
    updateNote: builder.mutation<Note, { id: string } & Partial<CreateNoteDto>>({
      query: ({ id, ...body }) => ({ url: `/notes/${id}`, method: "PATCH", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "Notes", id }, "Notes"],
    }),
    togglePinNote: builder.mutation<Note, string>({
      query: (id) => ({ url: `/notes/${id}/pin`, method: "PATCH" }),
      invalidatesTags: ["Notes"],
    }),
    deleteNote: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/notes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notes"],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useTogglePinNoteMutation,
  useDeleteNoteMutation,
} = notesApi;
