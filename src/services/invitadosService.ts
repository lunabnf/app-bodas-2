import { supabaseConfig } from "./supabaseConfig";

export interface Invitado {
  token: string;
  nombre: string;
  mesa?: string;
  esAdulto?: boolean;
}

const STORAGE_KEY = "wedding_invitados";

// Obtener todos los invitados
export async function obtenerInvitados(): Promise<Invitado[]> {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }

  // FUTURO: Supabase
  // const { data } = await supabaseConfig.client
  //   .from("invitados")
  //   .select("*");
  // return data ?? [];

  return [];
}

// Guardar invitados
export async function guardarInvitados(lista: Invitado[]): Promise<boolean> {
  if (!supabaseConfig.enabled) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return true;
  }

  // FUTURO: Supabase insert/update
  return true;
}

// Borrar invitado
export async function borrarInvitado(token: string): Promise<boolean> {
  if (!supabaseConfig.enabled) {
    const lista = await obtenerInvitados();
    const nueva = lista.filter((i) => i.token !== token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nueva));
    return true;
  }

  // FUTURO: Supabase delete
  return true;
}