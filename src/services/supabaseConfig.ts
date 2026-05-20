import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"];
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

export const supabaseConfig = {
  enabled: Boolean(url && anonKey),
  url: url ?? "",
  key: anonKey ?? "",
  client: url && anonKey ? createClient(url, anonKey) : null,
};

export function throwSupabaseFeatureNotImplemented(feature: string): never {
  throw new Error(
    `Supabase activo, pero "${feature}" aún no tiene implementación. Evita usar este módulo en staging hasta conectarlo.`
  );
}
