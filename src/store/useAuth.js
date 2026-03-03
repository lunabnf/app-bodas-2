import { create } from "zustand";
import { z } from "zod";
import { guestSessionSchema } from "../domain/schemas";
import { readStorageWithSchema } from "../lib/storage";
const AUTH_STORAGE_KEY = "wedding.auth";
const USER_STORAGE_KEY = "wedding.user";
const DEFAULT_ADMIN_EMAIL = "demo@demo.com";
const DEFAULT_ADMIN_PASSWORD = "demo";
const storedAuthSchema = z.object({
    esAdmin: z.boolean(),
    invitado: guestSessionSchema.nullable(),
});
function readStoredAuth() {
    if (typeof window === "undefined") {
        return { esAdmin: false, invitado: null };
    }
    return readStorageWithSchema(AUTH_STORAGE_KEY, storedAuthSchema, { esAdmin: false, invitado: null });
}
function persistAuth(state) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}
function persistCurrentUser(user) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}
function clearCurrentUser() {
    if (typeof window === "undefined")
        return;
    localStorage.removeItem(USER_STORAGE_KEY);
}
const initialAuth = readStoredAuth();
export const useAuth = create((set) => ({
    invitado: initialAuth.invitado,
    esAdmin: initialAuth.esAdmin,
    login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== DEFAULT_ADMIN_EMAIL || password !== DEFAULT_ADMIN_PASSWORD) {
            throw new Error("Credenciales no validas");
        }
        const nextState = { esAdmin: true, invitado: null };
        persistAuth(nextState);
        persistCurrentUser({
            nombre: "Administrador",
            email: normalizedEmail,
            role: "admin",
        });
        set(nextState);
    },
    loginAsGuest: (data) => {
        const nextState = {
            invitado: data,
            esAdmin: false,
        };
        persistAuth(nextState);
        persistCurrentUser(data);
        set(nextState);
    },
    loginAsAdmin: (nombre = "Administrador") => {
        const nextState = {
            invitado: null,
            esAdmin: true,
        };
        persistAuth(nextState);
        persistCurrentUser({
            nombre,
            email: DEFAULT_ADMIN_EMAIL,
            role: "admin",
        });
        set(nextState);
    },
    logout: () => {
        persistAuth({
            invitado: null,
            esAdmin: false,
        });
        clearCurrentUser();
        set({
            invitado: null,
            esAdmin: false,
        });
    },
}));
