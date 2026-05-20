import { z } from "zod";
import { activityEventSchema } from "../domain/schemas";
import { localStore, readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig, throwSupabaseFeatureNotImplemented } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

export interface EventoActividad {
  id: string;
  timestamp: number;
  tipo: string;
  mensaje: string;
  tokenInvitado?: string;
}

const STORAGE_KEY = "wedding_actividad";
const activitySchema = z.array(activityEventSchema);

// Obtener actividad
export async function obtenerActividad(): Promise<EventoActividad[]> {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<EventoActividad[]>(scopedKey, activitySchema, []);
  }

  return throwSupabaseFeatureNotImplemented("actividad.obtenerActividad");
}

// Registrar evento
export async function registrarActividad(evento: EventoActividad): Promise<boolean> {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  const lista = await obtenerActividad();
  lista.push(evento);

  if (!supabaseConfig.enabled) {
    writeStorage(scopedKey, lista);
    return true;
  }

  return throwSupabaseFeatureNotImplemented("actividad.registrarActividad");
}

// Borrar actividad completa
export async function limpiarActividad(): Promise<boolean> {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  if (!supabaseConfig.enabled) {
    localStore.removeItem(scopedKey);
    return true;
  }

  return throwSupabaseFeatureNotImplemented("actividad.limpiarActividad");
}
