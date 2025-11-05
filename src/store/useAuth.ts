import { create } from "zustand";
import { api } from "@/lib/api";

type AuthState = {
  user: { uid: string } | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  init: async () => set({ user: await api.me() }),
  login: async (email, password) => {
    const u = await api.login(email, password);
    set({ user: u });
  },
  logout: async () => {
    await api.logout();
    set({ user: null });
  },
}));