import { supabaseConfig } from "./supabaseConfig";

export async function obtenerAlojamientos() {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem("wedding.alojamientos") || "[]");
  }

  // FUTURO: Supabase
  // const { data } = await supabase.from("alojamientos").select("*");
  // return data;

  return [];
}

export async function guardarAlojamientos(lista: unknown[]) {
  if (!supabaseConfig.enabled) {
    localStorage.setItem("wedding.alojamientos", JSON.stringify(lista));
    return true;
  }

  // FUTURO: Supabase: insert/update
  return true;
}

export async function borrarAlojamiento(id: string) {
  if (!supabaseConfig.enabled) {
    const lista = JSON.parse(localStorage.getItem("wedding.alojamientos") || "[]");
    const nueva = lista.filter((a: unknown) => (a as { id: string }).id !== id);
    localStorage.setItem("wedding.alojamientos", JSON.stringify(nueva));
    return true;
  }

  // FUTURO: Supabase delete
  return true;
}