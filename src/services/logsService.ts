import { supabaseConfig } from "./supabaseConfig";

export type LogItem = {
  id: string;
  user: string;
  action: string;
  timestamp: number;
};

// Registrar una acción
export async function addLog(user: string, action: string) {
  const newLog: LogItem = {
    id: crypto.randomUUID(),
    user,
    action,
    timestamp: Date.now(),
  };

  if (!supabaseConfig.enabled) {
    const raw = localStorage.getItem("wedding.logs");
    const logs: LogItem[] = raw ? JSON.parse(raw) : [];
    logs.push(newLog);
    localStorage.setItem("wedding.logs", JSON.stringify(logs));
    return true;
  }

  // FUTURO: Supabase
  // await supabase.from("logs").insert(newLog);
  return true;
}

// Obtener logs
export async function obtenerLogs() {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem("wedding.logs") || "[]") as LogItem[];
  }

  // FUTURO: Supabase
  // const { data } = await supabase.from("logs").select("*").order("timestamp", { ascending: false });
  // return data;

  return [];
}

// Limpiar todos los logs
export async function limpiarLogs() {
  if (!supabaseConfig.enabled) {
    localStorage.setItem("wedding.logs", JSON.stringify([]));
    return true;
  }

  // FUTURO: supabase delete
  return true;
}
