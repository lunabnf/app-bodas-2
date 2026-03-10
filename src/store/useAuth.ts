import { create } from "zustand";
import { z } from "zod";
import { guestSessionSchema } from "../domain/schemas";
import { readStorageWithSchema } from "../lib/storage";
import type { GuestSession } from "../domain/guest";
import { clearOwnerEventContext } from "../services/ownerEventContextService";
import { clearAccessEventContext } from "../services/accessEventContextService";

const AUTH_STORAGE_KEY = "wedding.auth";
const USER_STORAGE_KEY = "wedding.user";
const DEFAULT_ADMIN_EMAIL = "demo@demo.com";
const DEFAULT_ADMIN_PASSWORD = "demo";
const DEFAULT_OWNER_EMAIL = "owner@demo.com";
const DEFAULT_OWNER_PASSWORD = "owner";

type AuthRole = "guest" | "event_admin" | "owner" | null;

type StoredAuth = {
  esAdmin: boolean;
  esOwner: boolean;
  role: AuthRole;
  currentEventId: string | null;
  currentEventSlug: string | null;
  currentEventLabel: string | null;
  invitado: GuestSession | null;
};

const storedAuthSchema = z.object({
  esAdmin: z.boolean(),
  esOwner: z.boolean().optional(),
  role: z.enum(["guest", "event_admin", "owner"]).nullable().optional(),
  currentEventId: z.string().nullable().optional(),
  currentEventSlug: z.string().nullable().optional(),
  currentEventLabel: z.string().nullable().optional(),
  invitado: guestSessionSchema.nullable(),
});

interface AuthState {
  invitado: GuestSession | null;
  esAdmin: boolean;
  esOwner: boolean;
  role: AuthRole;
  currentEventId: string | null;
  currentEventSlug: string | null;
  currentEventLabel: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: (data: GuestSession) => void;
  loginAsAdmin: (nombre?: string) => void;
  loginAsEventAdmin: (event: { eventId: string; slug: string; coupleLabel: string; email: string }) => void;
  loginAsGuestForEvent: (
    data: GuestSession,
    event: { eventId: string; slug: string; coupleLabel: string }
  ) => void;
  loginAsOwner: (nombre?: string) => void;
  logout: () => void;
}

function readStoredAuth(): StoredAuth {
  if (typeof window === "undefined") {
    return {
      esAdmin: false,
      esOwner: false,
      role: null,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
      invitado: null,
    };
  }
  const parsed = readStorageWithSchema<StoredAuth>(
    AUTH_STORAGE_KEY,
    storedAuthSchema,
    {
      esAdmin: false,
      esOwner: false,
      role: null,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
      invitado: null,
    }
  );

  return {
    ...parsed,
    esOwner: parsed.esOwner ?? parsed.role === "owner",
    role: parsed.role ?? (parsed.esAdmin ? "event_admin" : parsed.invitado ? "guest" : null),
    currentEventId: parsed.currentEventId ?? "evt-demo",
    currentEventSlug: parsed.currentEventSlug ?? "demo",
    currentEventLabel: parsed.currentEventLabel ?? "Boda Demo",
  };
}

function persistAuth(state: StoredAuth) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function persistCurrentUser(user: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

const initialAuth = readStoredAuth();

export const useAuth = create<AuthState>((set) => ({
  invitado: initialAuth.invitado,
  esAdmin: initialAuth.esAdmin,
  esOwner: initialAuth.esOwner,
  role: initialAuth.role,
  currentEventId: initialAuth.currentEventId,
  currentEventSlug: initialAuth.currentEventSlug,
  currentEventLabel: initialAuth.currentEventLabel,

  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === DEFAULT_OWNER_EMAIL && password === DEFAULT_OWNER_PASSWORD) {
      const nextState = {
        esAdmin: false,
        esOwner: true,
        role: "owner" as const,
        currentEventId: null,
        currentEventSlug: null,
        currentEventLabel: null,
        invitado: null,
      };

      persistAuth(nextState);
      clearAccessEventContext();
      persistCurrentUser({
        nombre: "Owner",
        email: normalizedEmail,
        role: "owner",
      });

      set(nextState);
      return;
    }

    if (normalizedEmail !== DEFAULT_ADMIN_EMAIL || password !== DEFAULT_ADMIN_PASSWORD) {
      throw new Error("Credenciales no validas");
    }

    const nextState = {
      esAdmin: true,
      esOwner: false,
      role: "event_admin" as const,
      currentEventId: "evt-demo",
      currentEventSlug: "demo",
      currentEventLabel: "Boda Demo",
      invitado: null,
    };
    persistAuth(nextState);
    clearAccessEventContext();
    clearOwnerEventContext();
    persistCurrentUser({
      nombre: "Administrador",
      email: normalizedEmail,
      role: "event_admin",
    });

    set(nextState);
  },

  loginAsGuest: (data) => {
    const nextState = {
      invitado: data,
      esAdmin: false,
      esOwner: false,
      role: "guest" as const,
      currentEventId: "evt-demo",
      currentEventSlug: "demo",
      currentEventLabel: "Boda Demo",
    };

    persistAuth(nextState);
    clearAccessEventContext();
    clearOwnerEventContext();
    persistCurrentUser(data);
    set(nextState);
  },

  loginAsAdmin: (nombre = "Administrador") => {
    const nextState = {
      invitado: null,
      esAdmin: true,
      esOwner: false,
      role: "event_admin" as const,
      currentEventId: "evt-demo",
      currentEventSlug: "demo",
      currentEventLabel: "Boda Demo",
    };

    persistAuth(nextState);
    clearAccessEventContext();
    clearOwnerEventContext();
    persistCurrentUser({
      nombre,
      email: DEFAULT_ADMIN_EMAIL,
      role: "event_admin",
    });
    set(nextState);
  },

  loginAsEventAdmin: (event) => {
    const nextState = {
      invitado: null,
      esAdmin: true,
      esOwner: false,
      role: "event_admin" as const,
      currentEventId: event.eventId,
      currentEventSlug: event.slug,
      currentEventLabel: event.coupleLabel,
    };

    persistAuth(nextState);
    clearAccessEventContext();
    clearOwnerEventContext();
    persistCurrentUser({
      nombre: "Novios",
      email: event.email,
      role: "event_admin",
      eventId: event.eventId,
      eventSlug: event.slug,
    });
    set(nextState);
  },

  loginAsGuestForEvent: (data, event) => {
    const nextState = {
      invitado: data,
      esAdmin: false,
      esOwner: false,
      role: "guest" as const,
      currentEventId: event.eventId,
      currentEventSlug: event.slug,
      currentEventLabel: event.coupleLabel,
    };

    persistAuth(nextState);
    clearOwnerEventContext();
    persistCurrentUser({
      ...data,
      eventId: event.eventId,
      eventSlug: event.slug,
    });
    set(nextState);
  },

  loginAsOwner: (nombre = "Owner") => {
    const nextState = {
      invitado: null,
      esAdmin: false,
      esOwner: true,
      role: "owner" as const,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    };

    persistAuth(nextState);
    clearAccessEventContext();
    persistCurrentUser({
      nombre,
      email: DEFAULT_OWNER_EMAIL,
      role: "owner",
    });
    set(nextState);
  },

  logout: () => {
    clearAccessEventContext();
    clearOwnerEventContext();
    persistAuth({
      invitado: null,
      esAdmin: false,
      esOwner: false,
      role: null,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    });
    clearCurrentUser();
    set({
      invitado: null,
      esAdmin: false,
      esOwner: false,
      role: null,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    });
  },
}));
