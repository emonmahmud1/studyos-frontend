import { baseApi } from "./baseApi";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    chatWithAi: builder.mutation<{ reply: string }, { message: string; history?: { role: string; content: string }[] }>({
      query: (body) => ({ url: "/ai/chat", method: "POST", body }),
    }),
    summarizeNote: builder.mutation<{ summary: string }, { title: string; content: string }>({
      query: (body) => ({ url: "/ai/summarize", method: "POST", body }),
    }),
    generateFlashcards: builder.mutation<{ cards: { question: string; answer: string }[] }, { topic: string; quantity?: number }>({
      query: (body) => ({ url: "/ai/generate-flashcards", method: "POST", body }),
    }),
  }),
});

export const {
  useChatWithAiMutation,
  useSummarizeNoteMutation,
  useGenerateFlashcardsMutation,
} = aiApi;
