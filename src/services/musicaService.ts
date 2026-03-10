import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

export interface Cancion {
  id: string; // id interno
  titulo: string;
  artista: string;
  propuestaPorToken?: string; // invitado que la propone
  votos: number;
}

const STORAGE_KEY = "wedding_musica";
const songSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  artista: z.string(),
  propuestaPorToken: z.string().optional(),
  votos: z.number(),
});
const songsSchema = z.array(songSchema);

// -------------------------
// Obtener canciones
// -------------------------
export async function obtenerCanciones(): Promise<Cancion[]> {
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<Cancion[]>(scopedStorageKey(STORAGE_KEY), songsSchema, []);
  }

  // FUTURO: Supabase
  // const { data } = await supabaseConfig.client
  //   .from("musica")
  //   .select("*");
  // return (data as Cancion[]) ?? [];

  return [];
}

// -------------------------
// Guardar TODAS las canciones
// -------------------------
export async function guardarCanciones(canciones: Cancion[]): Promise<boolean> {
  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(STORAGE_KEY), canciones);
    return true;
  }

  // FUTURO: Supabase insert/update masivo
  return true;
}

// -------------------------
// Añadir o actualizar UNA canción
// -------------------------
export async function guardarCancion(cancion: Cancion): Promise<boolean> {
  const canciones = await obtenerCanciones();
  const index = canciones.findIndex((c) => c.id === cancion.id);

  if (index === -1) {
    canciones.push(cancion);
  } else {
    canciones[index] = cancion;
  }

  return guardarCanciones(canciones);
}

// -------------------------
// Votar canción por id
// -------------------------
export async function votarCancion(id: string): Promise<boolean> {
  const canciones = await obtenerCanciones();
  const index = canciones.findIndex((c) => c.id === id);

  if (index === -1) return false;

  const cancion = canciones[index];
  if (!cancion) return false;
  cancion.votos += 1;
  return guardarCanciones(canciones);
}

// -------------------------
// Borrar canción
// -------------------------
export async function borrarCancion(id: string): Promise<boolean> {
  const canciones = await obtenerCanciones();
  const filtradas = canciones.filter((c) => c.id !== id);
  return guardarCanciones(filtradas);
}
