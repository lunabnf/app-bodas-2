import { supabaseConfig } from "./supabaseConfig";

export type RSVPData = {
  id: string;          // token del invitado
  attending: "si" | "no" | "";
  adultos: number;
  ninos: number;
  detalles: {
    nombre: string;
    edad?: number;
    alergias: string[];
    intolerancias?: string;
  }[];
  nota?: string;
  timestamp: number;
};

// Guardar RSVP
export async function guardarRSVP(id: string, data: RSVPData) {
  if (!supabaseConfig.enabled) {
    localStorage.setItem(`wedding.rsvp.${id}`, JSON.stringify(data));
    return true;
  }

  // FUTURO: Supabase
  // await supabase.from("rsvp").upsert(data);
  return true;
}

// Obtener RSVP de un invitado
export async function obtenerRSVP(id: string) {
  if (!supabaseConfig.enabled) {
    const raw = localStorage.getItem(`wedding.rsvp.${id}`);
    return raw ? (JSON.parse(raw) as RSVPData) : null;
  }

  // FUTURO: Supabase
  // const { data } = await supabase.from("rsvp").select("*").eq("id", id).single();
  // return data;

  return null;
}

// Borrar RSVP (si el invitado cambia completamente)
export async function borrarRSVP(id: string) {
  if (!supabaseConfig.enabled) {
    localStorage.removeItem(`wedding.rsvp.${id}`);
    return true;
  }

  // FUTURO: Supabase
  return true;
}
