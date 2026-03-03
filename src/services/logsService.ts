import { z } from "zod";
import { logItemSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";

export type LogItem = {
  id: string;
  user: string;
  action: string;
  timestamp: number;
};

const LOGS_KEY = "wedding.logs";
const logsSchema = z.array(logItemSchema);

// Registrar una acción
export async function addLog(user: string, action: string) {
  const newLog: LogItem = {
    id: crypto.randomUUID(),
    user,
    action,
    timestamp: Date.now(),
  };

  if (!supabaseConfig.enabled) {
    const logs = readStorageWithSchema<LogItem[]>(LOGS_KEY, logsSchema, []);
    logs.push(newLog);
    writeStorage(LOGS_KEY, logs);
    return true;
  }

  // FUTURO: Supabase
  // await supabase.from("logs").insert(newLog);
  return true;
}

// Obtener logs
export async function obtenerLogs() {
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<LogItem[]>(LOGS_KEY, logsSchema, []);
  }

  // FUTURO: Supabase
  // const { data } = await supabase.from("logs").select("*").order("timestamp", { ascending: false });
  // return data;

  return [];
}

// Limpiar todos los logs
export async function limpiarLogs() {
  if (!supabaseConfig.enabled) {
    writeStorage(LOGS_KEY, []);
    return true;
  }

  // FUTURO: supabase delete
  return true;
}
