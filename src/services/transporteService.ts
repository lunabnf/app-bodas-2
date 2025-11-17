import { supabaseConfig } from "./supabaseConfig";

export async function obtenerTransportes() {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem("wedding.transportes") || "[]");
  }

  // FUTURO: Supabase
  // const { data } = await supabase.from("transportes").select("*");
  // return data;

  return [];
}

export async function guardarTransportes(lista: unknown[]) {
  if (!supabaseConfig.enabled) {
    localStorage.setItem("wedding.transportes", JSON.stringify(lista));
    return true;
  }

  // FUTURO Supabase: insert/update
  return true;
}

export async function borrarTransporte(id: string) {
  if (!supabaseConfig.enabled) {
    const lista = JSON.parse(localStorage.getItem("wedding.transportes") || "[]");
    const nueva = lista.filter((t: unknown) => (t as { id: string }).id !== id);
    localStorage.setItem("wedding.transportes", JSON.stringify(nueva));
    return true;
  }

  // FUTURO Supabase delete
  return true;
}