import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type LoginMode = "sign-up" | "sign-in";

interface AuthUiState {
  mode: LoginMode;
  setMode: (mode: LoginMode) => void;
}

export const useAuthUiStore = create<AuthUiState>()(
  devtools(
    (set) => ({
      mode: "sign-in",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "AuthUiStore",
    },
  ),
);
