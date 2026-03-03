import { z } from "zod";
import { tableSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import type { Table } from "../domain/table";
import { supabaseConfig } from "./supabaseConfig";

const STORAGE_KEY = "wedding.tables";
const LEGACY_STORAGE_KEYS = ["wedding_mesas"];
const tableListSchema = z.array(tableSchema);

function normalizeTable(raw: unknown, index: number): Table {
  const source = (raw ?? {}) as Partial<Table> & { nombre?: string; id?: string };

  return {
    id: source.id ?? String(index + 1),
    nombre: source.nombre?.trim() || `Mesa ${index + 1}`,
    capacidad: typeof source.capacidad === "number" ? source.capacidad : 10,
    invitadosTokens: Array.isArray(source.invitadosTokens) ? source.invitadosTokens : [],
    captainToken: source.captainToken ?? null,
  };
}

function readLocalTables(): Table[] {
  const candidates = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];

  for (const key of candidates) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

    try {
      const parsed = readStorageWithSchema<unknown[]>(key, z.array(z.unknown()), []);
      const tables = parsed.map((item, index) => normalizeTable(item, index));
      const validated = tableListSchema.safeParse(tables);
      if (!validated.success) {
        localStorage.removeItem(key);
        continue;
      }

      if (key !== STORAGE_KEY) {
        writeStorage(STORAGE_KEY, validated.data);
        localStorage.removeItem(key);
      }

      return validated.data;
    } catch {
      localStorage.removeItem(key);
    }
  }

  return [];
}

// -------------------------
// Obtener mesas
// -------------------------
export async function obtenerMesas(): Promise<Table[]> {
  if (!supabaseConfig.enabled) {
    return readLocalTables();
  }

  // FUTURO: Supabase
  // const { data } = await supabaseConfig.client
  //   .from("mesas")
  //   .select("*");
  // return (data as Mesa[]) ?? [];

  return [];
}

// -------------------------
// Guardar TODAS las mesas
// -------------------------
export async function guardarMesas(mesas: Table[]): Promise<boolean> {
  if (!supabaseConfig.enabled) {
    writeStorage(STORAGE_KEY, mesas);
    return true;
  }

  // FUTURO: Supabase insert/update masivo
  return true;
}

// -------------------------
// Guardar/actualizar UNA mesa
// -------------------------
export async function guardarMesa(mesa: Table): Promise<boolean> {
  const mesas = await obtenerMesas();
  const index = mesas.findIndex((m) => m.id === mesa.id);

  if (index === -1) {
    mesas.push(mesa);
  } else {
    mesas[index] = mesa;
  }

  return guardarMesas(mesas);
}

// -------------------------
// Borrar mesa por id
// -------------------------
export async function borrarMesa(id: string): Promise<boolean> {
  const mesas = await obtenerMesas();
  const filtradas = mesas.filter((m) => m.id !== id);
  return guardarMesas(filtradas);
}
