import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  setAuth: (token: string, refreshToken: string, expiresIn: number) => void;
  clearAuth: () => void;
  setToken: (token: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        expiresIn: null,

        setAuth: (token: string, refreshToken: string, expiresIn: number) =>
          set({
            isAuthenticated: true,
            token,
            refreshToken,
            expiresIn,
          }),

        clearAuth: () =>
          set({
            isAuthenticated: false,
            token: null,
            refreshToken: null,
            expiresIn: null,
          }),

        setToken: (token: string) => set({ token }),

        setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      }),
      {
        name: "auth-storage", // localStorage key
      }
    ),
    {
      name: "AuthStore",
    }
  )
);