import { z } from "zod";
import { activityEventSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";
const STORAGE_KEY = "wedding_actividad";
const activitySchema = z.array(activityEventSchema);
// Obtener actividad
export async function obtenerActividad() {
    if (!supabaseConfig.enabled) {
        return readStorageWithSchema(STORAGE_KEY, activitySchema, []);
    }
    // FUTURO Supabase
    return [];
}
// Registrar evento
export async function registrarActividad(evento) {
    const lista = await obtenerActividad();
    lista.push(evento);
    if (!supabaseConfig.enabled) {
        writeStorage(STORAGE_KEY, lista);
        return true;
    }
    // FUTURO Supabase insert
    return true;
}
// Borrar actividad completa
export async function limpiarActividad() {
    if (!supabaseConfig.enabled) {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    }
    // FUTURO supabase delete
    return true;
}
