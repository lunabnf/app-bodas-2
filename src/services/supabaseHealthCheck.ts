import { isLocalDev } from "../config/appEnv";
import { supabaseConfig } from "./supabaseConfig";

export type SupabaseHealthCheckResult =
  | { ok: true; details: string }
  | { ok: false; details: string };

let hasRun = false;

export async function runSupabaseHealthCheckOnce(): Promise<SupabaseHealthCheckResult | null> {
  if (!isLocalDev) {
    return null;
  }

  if (hasRun) {
    return null;
  }

  hasRun = true;

  if (!supabaseConfig.configured || !supabaseConfig.client) {
    return { ok: false, details: "not configured (missing env vars)" };
  }

  const { error } = await supabaseConfig.client.auth.getSession();

  if (error) {
    return { ok: false, details: error.message };
  }

  return {
    ok: true,
    details: supabaseConfig.enabled
      ? "auth endpoint reachable; data mode enabled"
      : "auth endpoint reachable; data mode disabled",
  };
}
