import { baseApi } from "./baseApi";

export type ResourceType = "PDF" | "VIDEO" | "DOCUMENT" | "ARCHIVE";

export interface Resource {
  id: string; name: string; type: ResourceType; folder: string;
  url: string; size: string; subjectId?: string; userId: string;
  subject?: { name: string };
  createdAt: string; updatedAt: string;
}

export const resourcesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResources: builder.query<Resource[], { folder?: string } | void>({
      query: (params) => ({ url: "/resources", params: params || {} }),
      providesTags: ["Resources"],
    }),
    createResource: builder.mutation<Resource, { name: string; type: ResourceType; folder?: string; url?: string; size?: string; subjectId?: string }>({
      query: (body) => ({ url: "/resources", method: "POST", body }),
      invalidatesTags: ["Resources"],
    }),
    deleteResource: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/resources/${id}`, method: "DELETE" }),
      invalidatesTags: ["Resources"],
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useCreateResourceMutation,
  useDeleteResourceMutation,
} = resourcesApi;
