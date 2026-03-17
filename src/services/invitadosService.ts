import { z } from "zod";
import { ceremonySeatAssignmentSchema, guestSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import type { Guest } from "../domain/guest";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

const STORAGE_KEY = "wedding.invitados";
const LEGACY_STORAGE_KEYS = ["wedding_invitados"];
const guestListSchema = z.array(guestSchema);

function normalizeGuest(raw: unknown, index: number): Guest {
  const source = (raw ?? {}) as Partial<Guest> & {
    id?: string | number;
    tipo?: string;
    grupoTipo?: string;
    estado?: string;
  };

  return {
    id: String(source.id ?? source.token ?? index + 1),
    token: source.token ?? crypto.randomUUID(),
    nombre: source.nombre?.trim() || `Invitado ${index + 1}`,
    tipo: source.tipo === "Niño" ? "Niño" : "Adulto",
    grupo: source.grupo?.trim() || "",
    grupoTipo:
      source.grupoTipo === "familia_novia" ||
      source.grupoTipo === "familia_novio" ||
      source.grupoTipo === "amigos_novia" ||
      source.grupoTipo === "amigos_novio" ||
      source.grupoTipo === "amigos_comunes" ||
      source.grupoTipo === "amigos_trabajo" ||
      source.grupoTipo === "amigos_pueblo" ||
      source.grupoTipo === "proveedores"
        ? source.grupoTipo
        : "otros",
    estado:
      source.estado === "pendiente" || source.estado === "rechazado"
        ? source.estado
        : "confirmado",
    esAdulto: typeof source.esAdulto === "boolean" ? source.esAdulto : source.tipo !== "Niño",
    ...(source.mesa ? { mesa: source.mesa } : {}),
    ...(typeof source.edad === "number" ? { edad: source.edad } : {}),
    ...(ceremonySeatAssignmentSchema.safeParse(source.ceremonySeat).success
      ? { ceremonySeat: source.ceremonySeat }
      : {}),
  };
}

function readLocalGuests(): Guest[] {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  const candidates = [scopedKey, STORAGE_KEY, ...LEGACY_STORAGE_KEYS];

  for (const key of candidates) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = readStorageWithSchema<unknown[]>(key, z.array(z.unknown()), []);
      const guests = parsed.map((item, index) => normalizeGuest(item, index));
      const validated = guestListSchema.safeParse(guests);
      if (!validated.success) {
        localStorage.removeItem(key);
        continue;
      }

      if (key !== scopedKey) {
        writeStorage(scopedKey, validated.data);
        localStorage.removeItem(key);
      }

      return validated.data as Guest[];
    } catch {
      localStorage.removeItem(key);
    }
  }

  return [];
}

export function obtenerInvitadosSync(): Guest[] {
  if (typeof window === "undefined") return [];
  if (!supabaseConfig.enabled) {
    return readLocalGuests();
  }
  return [];
}

// Obtener todos los invitados
export async function obtenerInvitados(): Promise<Guest[]> {
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

export async function obtenerInvitadoPorToken(token: string): Promise<Guest | null> {
  const invitados = await obtenerInvitados();
  return invitados.find((invitado) => invitado.token === token) ?? null;
}

export function obtenerInvitadoPorTokenSync(token: string): Guest | null {
  const invitados = obtenerInvitadosSync();
  return invitados.find((invitado) => invitado.token === token) ?? null;
}

// Guardar invitados
export async function guardarInvitados(lista: Guest[]): Promise<boolean> {
  const scopedKey = scopedStorageKey(STORAGE_KEY);

  if (!supabaseConfig.enabled) {
    writeStorage(scopedKey, lista);
    return true;
  }

  // FUTURO: Supabase insert/update
  return true;
}

export async function guardarInvitado(invitado: Guest): Promise<boolean> {
  const invitados = await obtenerInvitados();
  const index = invitados.findIndex((item) => item.token === invitado.token);
  const updated = [...invitados];

  if (index === -1) {
    updated.push(invitado);
  } else {
    updated[index] = invitado;
  }

  return guardarInvitados(updated);
}

// Borrar invitado
export async function borrarInvitado(token: string): Promise<boolean> {
  const scopedKey = scopedStorageKey(STORAGE_KEY);

  if (!supabaseConfig.enabled) {
    const lista = await obtenerInvitados();
    const nueva = lista.filter((i) => i.token !== token);
    writeStorage(scopedKey, nueva);
    return true;
  }

  // FUTURO: Supabase delete
  return true;
}
