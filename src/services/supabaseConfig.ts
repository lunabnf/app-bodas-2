import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"];
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];
const dataEnabled = import.meta.env["VITE_ENABLE_SUPABASE_DATA"] === "true";
const configured = Boolean(url && anonKey);

export const supabaseConfig = {
  configured,
  enabled: configured && dataEnabled,
  url: url ?? "",
  key: anonKey ?? "",
  client: url && anonKey ? createClient(url, anonKey) : null,
};

export function throwSupabaseFeatureNotImplemented(feature: string): never {
  throw new Error(
    `Supabase activo, pero "${feature}" aún no tiene implementación. Evita usar este módulo en staging hasta conectarlo.`
  );
}
