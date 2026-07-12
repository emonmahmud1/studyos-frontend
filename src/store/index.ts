import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";

// Import all injected endpoint modules so they register into baseApi
import "./api/authApi";
import "./api/subjectsApi";
import "./api/notesApi";
import "./api/tasksApi";
import "./api/flashcardsApi";
import "./api/eventsApi";
import "./api/resourcesApi";
import "./api/pomodoroApi";
import "./api/profileApi";
import "./api/aiApi";
import "./api/adminApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
