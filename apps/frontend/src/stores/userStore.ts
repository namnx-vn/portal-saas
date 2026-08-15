import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (user: User) => set({ user, error: null }),

      clearUser: () => set({ user: null }),

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),
    }),
    {
      name: "UserStore",
    }
  )
);
