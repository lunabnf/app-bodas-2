import { supabaseConfig } from "./supabaseConfig";

export interface Cancion {
  id: string; // id interno
  titulo: string;
  artista: string;
  propuestaPorToken?: string; // invitado que la propone
  votos: number;
}

const STORAGE_KEY = "wedding_musica";

// -------------------------
// Obtener canciones
// -------------------------
export async function obtenerCanciones(): Promise<Cancion[]> {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(canciones));
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

  canciones[index].votos += 1;
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