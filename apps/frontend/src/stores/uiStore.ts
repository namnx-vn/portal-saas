import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  notificationOpen: boolean;
  notificationMessage: string;
  notificationType: "success" | "error" | "warning" | "info";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  showNotification: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  closeNotification: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      theme: "light",
      notificationOpen: false,
      notificationMessage: "",
      notificationType: "info",

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      setTheme: (theme: "light" | "dark") => set({ theme }),

      showNotification: (message: string, type) =>
        set({
          notificationOpen: true,
          notificationMessage: message,
          notificationType: type,
        }),

      closeNotification: () => set({ notificationOpen: false }),
    }),
    {
      name: "UIStore",
    }
  )
);
