import { z } from "zod";
import { guestSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";
const STORAGE_KEY = "wedding.invitados";
const LEGACY_STORAGE_KEYS = ["wedding_invitados"];
const guestListSchema = z.array(guestSchema);
function normalizeGuest(raw, index) {
    const source = (raw ?? {});
    return {
        id: String(source.id ?? source.token ?? index + 1),
        token: source.token ?? crypto.randomUUID(),
        nombre: source.nombre?.trim() || `Invitado ${index + 1}`,
        tipo: source.tipo === "Niño" ? "Niño" : "Adulto",
        grupo: source.grupo?.trim() || "",
        grupoTipo: source.grupoTipo === "familia_novia" ||
            source.grupoTipo === "familia_novio" ||
            source.grupoTipo === "amigos_novia" ||
            source.grupoTipo === "amigos_novio" ||
            source.grupoTipo === "amigos_comunes" ||
            source.grupoTipo === "amigos_trabajo" ||
            source.grupoTipo === "amigos_pueblo" ||
            source.grupoTipo === "proveedores"
            ? source.grupoTipo
            : "otros",
        estado: source.estado === "pendiente" || source.estado === "rechazado"
            ? source.estado
            : "confirmado",
        esAdulto: typeof source.esAdulto === "boolean" ? source.esAdulto : source.tipo !== "Niño",
        ...(source.mesa ? { mesa: source.mesa } : {}),
        ...(typeof source.edad === "number" ? { edad: source.edad } : {}),
    };
}
function readLocalGuests() {
    const candidates = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw)
            continue;
        try {
            const parsed = readStorageWithSchema(key, z.array(z.unknown()), []);
            const guests = parsed.map((item, index) => normalizeGuest(item, index));
            const validated = guestListSchema.safeParse(guests);
            if (!validated.success) {
                localStorage.removeItem(key);
                continue;
            }
            if (key !== STORAGE_KEY) {
                writeStorage(STORAGE_KEY, validated.data);
                localStorage.removeItem(key);
            }
            return validated.data;
        }
        catch {
            localStorage.removeItem(key);
        }
    }
    return [];
}
// Obtener todos los invitados
export async function obtenerInvitados() {
    if (!supabaseConfig.enabled) {
        return readLocalGuests();
    }
    // FUTURO: Supabase
    // const { data } = await supabaseConfig.client
    //   .from("invitados")
    //   .select("*");
    // return data ?? [];
    return [];
}
export async function obtenerInvitadoPorToken(token) {
    const invitados = await obtenerInvitados();
    return invitados.find((invitado) => invitado.token === token) ?? null;
}
// Guardar invitados
export async function guardarInvitados(lista) {
    if (!supabaseConfig.enabled) {
        writeStorage(STORAGE_KEY, lista);
        return true;
    }
    // FUTURO: Supabase insert/update
    return true;
}
export async function guardarInvitado(invitado) {
    const invitados = await obtenerInvitados();
    const index = invitados.findIndex((item) => item.token === invitado.token);
    const updated = [...invitados];
    if (index === -1) {
        updated.push(invitado);
    }
    else {
        updated[index] = invitado;
    }
    return guardarInvitados(updated);
}
// Borrar invitado
export async function borrarInvitado(token) {
    if (!supabaseConfig.enabled) {
        const lista = await obtenerInvitados();
        const nueva = lista.filter((i) => i.token !== token);
        writeStorage(STORAGE_KEY, nueva);
        return true;
    }
    // FUTURO: Supabase delete
    return true;
}
