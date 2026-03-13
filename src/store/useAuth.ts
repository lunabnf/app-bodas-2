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
const DEFAULT_SUPER_ADMIN_EMAIL = "backoffice@demo.com";
const DEFAULT_SUPER_ADMIN_PASSWORD = "backoffice";

type AuthRole = "guest" | "event_admin" | "super_admin" | "owner" | null;

type StoredAuth = {
  esAdmin: boolean;
  esSuperAdmin: boolean;
  esOwner: boolean;
  role: AuthRole;
  currentEventId: string | null;
  currentEventSlug: string | null;
  currentEventLabel: string | null;
  invitado: GuestSession | null;
};

const storedAuthSchema = z.object({
  esAdmin: z.boolean(),
  esSuperAdmin: z.boolean().optional(),
  esOwner: z.boolean().optional(),
  role: z.enum(["guest", "event_admin", "super_admin", "owner"]).nullable().optional(),
  currentEventId: z.string().nullable().optional(),
  currentEventSlug: z.string().nullable().optional(),
  currentEventLabel: z.string().nullable().optional(),
  invitado: guestSessionSchema.nullable(),
});

interface AuthState {
  invitado: GuestSession | null;
  esAdmin: boolean;
  esSuperAdmin: boolean;
  esOwner: boolean;
  role: AuthRole;
  currentEventId: string | null;
  currentEventSlug: string | null;
  currentEventLabel: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: (data: GuestSession) => void;
  loginAsAdmin: (nombre?: string) => void;
  loginAsEventAdmin: (event: { eventId: string; slug: string; coupleLabel: string; email: string }) => void;
  loginBackoffice: (email: string, password: string) => Promise<void>;
  loginAsGuestForEvent: (
    data: GuestSession,
    event: { eventId: string; slug: string; coupleLabel: string }
  ) => void;
  loginAsSuperAdmin: (nombre?: string) => void;
  loginAsOwner: (nombre?: string) => void;
  logout: () => void;
}

function readStoredAuth(): StoredAuth {
  if (typeof window === "undefined") {
    return {
      esAdmin: false,
      esSuperAdmin: false,
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
      esSuperAdmin: false,
      esOwner: false,
      role: null,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
      invitado: null,
    }
  );

  const derivedSuperAdmin =
    parsed.esSuperAdmin ??
    parsed.esOwner ??
    (parsed.role === "super_admin" || parsed.role === "owner");

  return {
    ...parsed,
    esSuperAdmin: Boolean(derivedSuperAdmin),
    esOwner: parsed.esOwner ?? false,
    role:
      parsed.role ??
      (derivedSuperAdmin
        ? "super_admin"
        : parsed.esAdmin
          ? "event_admin"
          : parsed.invitado
            ? "guest"
            : null),
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
  esSuperAdmin: initialAuth.esSuperAdmin,
  esOwner: initialAuth.esOwner,
  role: initialAuth.role,
  currentEventId: initialAuth.currentEventId,
  currentEventSlug: initialAuth.currentEventSlug,
  currentEventLabel: initialAuth.currentEventLabel,

  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail === DEFAULT_SUPER_ADMIN_EMAIL &&
      password === DEFAULT_SUPER_ADMIN_PASSWORD
    ) {
      const nextState = {
        esAdmin: false,
        esSuperAdmin: true,
        esOwner: false,
        role: "super_admin" as const,
        currentEventId: null,
        currentEventSlug: null,
        currentEventLabel: null,
        invitado: null,
      };

      persistAuth(nextState);
      clearAccessEventContext();
      persistCurrentUser({
        nombre: "Super Admin",
        email: normalizedEmail,
        role: "super_admin",
      });

      set(nextState);
      return;
    }

    if (normalizedEmail !== DEFAULT_ADMIN_EMAIL || password !== DEFAULT_ADMIN_PASSWORD) {
      throw new Error("Credenciales no validas");
    }

    const nextState = {
      esAdmin: true,
      esSuperAdmin: false,
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
      esSuperAdmin: false,
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
      esSuperAdmin: false,
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
      esSuperAdmin: false,
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

  loginBackoffice: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail !== DEFAULT_SUPER_ADMIN_EMAIL ||
      password !== DEFAULT_SUPER_ADMIN_PASSWORD
    ) {
      throw new Error("Credenciales no validas");
    }

    const nextState = {
      invitado: null,
      esAdmin: false,
      esSuperAdmin: true,
      esOwner: false,
      role: "super_admin" as const,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    };

    persistAuth(nextState);
    clearAccessEventContext();
    clearOwnerEventContext();
    persistCurrentUser({
      nombre: "Super Admin",
      email: normalizedEmail,
      role: "super_admin",
    });
    set(nextState);
  },

  loginAsGuestForEvent: (data, event) => {
    const nextState = {
      invitado: data,
      esAdmin: false,
      esSuperAdmin: false,
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

  loginAsSuperAdmin: (nombre = "Super Admin") => {
    const nextState = {
      invitado: null,
      esAdmin: false,
      esSuperAdmin: true,
      esOwner: false,
      role: "super_admin" as const,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    };

    persistAuth(nextState);
    clearAccessEventContext();
    persistCurrentUser({
      nombre,
      email: DEFAULT_SUPER_ADMIN_EMAIL,
      role: "super_admin",
    });
    set(nextState);
  },

  loginAsOwner: (nombre = "Super Admin") => {
    const nextState = {
      invitado: null,
      esAdmin: false,
      esSuperAdmin: true,
      esOwner: false,
      role: "super_admin" as const,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    };

    persistAuth(nextState);
    clearAccessEventContext();
    persistCurrentUser({
      nombre,
      email: DEFAULT_SUPER_ADMIN_EMAIL,
      role: "super_admin",
    });
    set(nextState);
  },

  logout: () => {
    clearAccessEventContext();
    clearOwnerEventContext();
    persistAuth({
      invitado: null,
      esAdmin: false,
      esSuperAdmin: false,
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
      esSuperAdmin: false,
      esOwner: false,
      role: null,
      currentEventId: null,
      currentEventSlug: null,
      currentEventLabel: null,
    });
  },
}));
