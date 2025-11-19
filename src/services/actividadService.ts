import { supabaseConfig } from "./supabaseConfig";

export interface EventoActividad {
  id: string;
  timestamp: number;
  tipo: string;
  mensaje: string;
  tokenInvitado?: string;
}

const STORAGE_KEY = "wedding_actividad";

// Obtener actividad
export async function obtenerActividad(): Promise<EventoActividad[]> {
  if (!supabaseConfig.enabled) {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    return JSON.parse(raw) as EventoActividad[];
  }

  // FUTURO Supabase
  return [];
}

// Registrar evento
export async function registrarActividad(evento: EventoActividad): Promise<boolean> {
  const lista = await obtenerActividad();
  lista.push(evento);

  if (!supabaseConfig.enabled) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return true;
  }

  // FUTURO Supabase insert
  return true;
}

// Borrar actividad completa
export async function limpiarActividad(): Promise<boolean> {
  if (!supabaseConfig.enabled) {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }

  // FUTURO supabase delete
  return true;
}