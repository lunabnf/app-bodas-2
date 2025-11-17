import { supabaseConfig } from "./supabaseConfig";

// Obtener todos los invitados
export async function obtenerInvitados() {
  if (!supabaseConfig.enabled) {
    return JSON.parse(localStorage.getItem("wedding.invitados") || "[]");
  }

  // FUTURO: Supabase
  // const { data } = await supabase.from("invitados").select("*");
  // return data;

  return [];
}

// Guardar invitado
export async function guardarInvitados(lista: unknown[]) {
  if (!supabaseConfig.enabled) {
    localStorage.setItem("wedding.invitados", JSON.stringify(lista));
    return true;
  }

  // FUTURO: Supabase: insert/update
  return true;
}

// Borrar invitado
export async function borrarInvitado(token: string) {
  if (!supabaseConfig.enabled) {
    const lista = JSON.parse(localStorage.getItem("wedding.invitados") || "[]");
    const nueva = lista.filter(
      (i: unknown) => (i as { token: string }).token !== token
    );
    localStorage.setItem("wedding.invitados", JSON.stringify(nueva));
    return true;
  }

  // FUTURO: supabase delete
  return true;
}