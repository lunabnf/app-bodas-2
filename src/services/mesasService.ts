import { supabaseConfig } from "./supabaseConfig";

export interface Mesa {
  id: string; // id interno (uuid o similar)
  nombre: string; // "Mesa 1", "Mesa amigos", etc.
  capacidad: number; // nº de sillas
  invitadosTokens: string[]; // tokens de invitados sentados en esta mesa
}

const STORAGE_KEY = "wedding_mesas";

// -------------------------
// Obtener mesas
// -------------------------
export async function obtenerMesas(): Promise<Mesa[]> {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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
export async function guardarMesas(mesas: Mesa[]): Promise<boolean> {
  if (!supabaseConfig.enabled) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mesas));
    return true;
  }

  // FUTURO: Supabase insert/update masivo
  return true;
}

// -------------------------
// Guardar/actualizar UNA mesa
// -------------------------
export async function guardarMesa(mesa: Mesa): Promise<boolean> {
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