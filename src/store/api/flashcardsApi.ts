import { baseApi } from "./baseApi";

export type CardStatus = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface Flashcard {
  id: string; question: string; answer: string;
  status?: CardStatus; deckId: string;
}

export interface FlashcardDeck {
  id: string; name: string; description?: string; category: string;
  progress: number; subjectId?: string; userId: string;
  cards: Flashcard[];
  subject?: { name: string };
  createdAt: string; updatedAt: string;
}

export const flashcardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDecks: builder.query<FlashcardDeck[], void>({
      query: () => "/flashcards/decks",
      providesTags: ["Decks"],
    }),
    getDeck: builder.query<FlashcardDeck, string>({
      query: (id) => `/flashcards/decks/${id}`,
      providesTags: (_, __, id) => [{ type: "Decks", id }],
    }),
    createDeck: builder.mutation<FlashcardDeck, { name: string; description?: string; category?: string; subjectId?: string }>({
      query: (body) => ({ url: "/flashcards/decks", method: "POST", body }),
      invalidatesTags: ["Decks"],
    }),
    updateDeck: builder.mutation<FlashcardDeck, { id: string; name?: string; description?: string; progress?: number }>({
      query: ({ id, ...body }) => ({ url: `/flashcards/decks/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Decks"],
    }),
    deleteDeck: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/flashcards/decks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Decks"],
    }),
    addCard: builder.mutation<Flashcard, { deckId: string; question: string; answer: string }>({
      query: ({ deckId, ...body }) => ({ url: `/flashcards/decks/${deckId}/cards`, method: "POST", body }),
      invalidatesTags: ["Decks"],
    }),
    bulkAddCards: builder.mutation<{ count: number }, { deckId: string; cards: { question: string; answer: string }[] }>({
      query: ({ deckId, cards }) => ({ url: `/flashcards/decks/${deckId}/cards/bulk`, method: "POST", body: { cards } }),
      invalidatesTags: ["Decks"],
    }),
    updateCard: builder.mutation<Flashcard, { deckId: string; cardId: string; status?: CardStatus; question?: string; answer?: string }>({
      query: ({ deckId, cardId, ...body }) => ({ url: `/flashcards/decks/${deckId}/cards/${cardId}`, method: "PATCH", body }),
      invalidatesTags: ["Decks"],
    }),
    deleteCard: builder.mutation<{ message: string }, { deckId: string; cardId: string }>({
      query: ({ deckId, cardId }) => ({ url: `/flashcards/decks/${deckId}/cards/${cardId}`, method: "DELETE" }),
      invalidatesTags: ["Decks"],
    }),
  }),
});

export const {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
  useAddCardMutation,
  useBulkAddCardsMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
} = flashcardsApi;
