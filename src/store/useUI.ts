import { create } from "zustand";
type UI = { drawerOpen: boolean; toggle: () => void; close: () => void };
export const useUI = create<UI>((set) => ({
  drawerOpen: false,
  toggle: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  close: () => set({ drawerOpen: false }),
}));