import { z } from "zod";
import { tableSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import type { Table } from "../domain/table";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

const STORAGE_KEY = "wedding.tables";
const LEGACY_STORAGE_KEYS = ["wedding_mesas"];
const tableListSchema = z.array(tableSchema);

function normalizeTable(raw: unknown, index: number): Table {
  const source = (raw ?? {}) as Partial<Table> & { nombre?: string; id?: string };

  return {
    id: source.id ?? String(index + 1),
    nombre: source.nombre?.trim() || `Mesa ${index + 1}`,
    tipoMesa: source.tipoMesa === "rectangular" ? "rectangular" : "redonda",
    capacidad: typeof source.capacidad === "number" ? source.capacidad : 10,
    orden: typeof source.orden === "number" ? source.orden : index,
    templateCategory:
      source.templateCategory === "fiesta" ||
      source.templateCategory === "naturaleza" ||
      source.templateCategory === "musica_pop" ||
      source.templateCategory === "musica_rock" ||
      source.templateCategory === "ciudades" ||
      source.templateCategory === "peliculas" ||
      source.templateCategory === "romantico" ||
      source.templateCategory === "personalizado"
        ? source.templateCategory
        : "personalizado",
    collapsed: typeof source.collapsed === "boolean" ? source.collapsed : false,
    invitadosTokens: Array.isArray(source.invitadosTokens) ? source.invitadosTokens : [],
    captainToken: source.captainToken ?? null,
  };
}

function readLocalTables(): Table[] {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  const candidates = [scopedKey, STORAGE_KEY, ...LEGACY_STORAGE_KEYS];

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

      if (key !== scopedKey) {
        writeStorage(scopedKey, validated.data);
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
  const scopedKey = scopedStorageKey(STORAGE_KEY);

  if (!supabaseConfig.enabled) {
    writeStorage(scopedKey, mesas);
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
