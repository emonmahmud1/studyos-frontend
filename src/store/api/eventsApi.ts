import { baseApi } from "./baseApi";

export type EventType = "EXAM" | "ASSIGNMENT" | "STUDY" | "OTHER";

export interface CalendarEvent {
  id: string; title: string; type: EventType; date: string; time: string;
  description?: string; subjectId?: string; userId: string;
  subject?: { name: string; color: string };
  createdAt: string; updatedAt: string;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<CalendarEvent[], { month?: string } | void>({
      query: (params) => ({ url: "/events", params: params || {} }),
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation<CalendarEvent, { title: string; type?: EventType; date: string; time: string; description?: string; subjectId?: string }>({
      query: (body) => ({ url: "/events", method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation<CalendarEvent, { id: string; title?: string; type?: EventType; date?: string; time?: string; description?: string }>({
      query: ({ id, ...body }) => ({ url: `/events/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;
