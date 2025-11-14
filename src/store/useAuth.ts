import { create } from "zustand";

type User = {
  uid: string;
  email: string;
  name?: string;
};

type AuthState = {
  user: User | null;
  init: () => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,

  init: async () => {
    const data = localStorage.getItem("auth.user");
    if (data) {
      set({ user: JSON.parse(data) });
    }
  },

  login: async (email) => {
    const fakeUser: User = {
      uid: crypto.randomUUID(),
      email,
      name: "Usuario Demo",
    };

    localStorage.setItem("auth.user", JSON.stringify(fakeUser));
    set({ user: fakeUser });
  },

  logout: async () => {
    localStorage.removeItem("auth.user");
    set({ user: null });
  },
}));