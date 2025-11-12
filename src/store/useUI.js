import { create } from "zustand";
export const useUI = create((set) => ({
    drawerOpen: false,
    toggle: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
    close: () => set({ drawerOpen: false }),
}));
