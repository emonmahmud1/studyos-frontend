"use client";

import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { AppProvider } from "@/context/AppContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AppProvider>{children}</AppProvider>
    </ReduxProvider>
  );
}
