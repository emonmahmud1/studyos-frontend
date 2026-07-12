import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "../index";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Unwrap the backend's { statusCode, success, message, data, meta? } envelope
const baseQueryWithUnwrap: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.data && typeof result.data === "object" && "data" in (result.data as object)) {
    const envelope = result.data as any;
    // Paginated response — interceptor sends { data: items, meta: { total, page, ... } }
    if (envelope.meta) {
      return { ...result, data: { data: envelope.data, ...envelope.meta } };
    }
    return { ...result, data: envelope.data };
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithUnwrap,
  tagTypes: [
    "User",
    "Subjects",
    "Notes",
    "Tasks",
    "Decks",
    "Events",
    "Resources",
    "Pomodoro",
    "Profile",
  ],
  endpoints: () => ({}),
});
