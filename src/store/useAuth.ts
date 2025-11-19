import { create } from "zustand";

export interface GuestData {
  token: string;
  nombre: string;
  mesa?: string;
  esAdulto?: boolean;
}

interface AuthState {
  invitado: GuestData | null;
  esAdmin: boolean;

  loginAsGuest: (data: GuestData) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  invitado: null,
  esAdmin: false,

  loginAsGuest: (data) =>
    set({
      invitado: data,
      esAdmin: false,
    }),

  loginAsAdmin: () =>
    set({
      invitado: null,
      esAdmin: true,
    }),

  logout: () =>
    set({
      invitado: null,
      esAdmin: false,
    }),
}));