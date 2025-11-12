import { create } from "zustand";

export const useAuth = create((set) => ({
  user: null,
  init: async () => {
    // Simula carga de usuario almacenado localmente
    const storedUser = localStorage.getItem("user");
    if (storedUser) set({ user: JSON.parse(storedUser) });
  },
  login: async (email, password) => {
    // Simula login básico
    const fakeUser = { email, name: "Usuario Demo" };
    localStorage.setItem("user", JSON.stringify(fakeUser));
    set({ user: fakeUser });
  },
  logout: async () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
