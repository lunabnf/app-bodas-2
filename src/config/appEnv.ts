import { getBrowserLocation } from "../lib/browser";

export type AppEnvironment = "local" | "demo" | "staging" | "production";

const rawAppEnvironment = import.meta.env["VITE_APP_ENV"]?.trim().toLowerCase();

function resolveAppEnvironment(): AppEnvironment {
  if (
    rawAppEnvironment === "local" ||
    rawAppEnvironment === "demo" ||
    rawAppEnvironment === "staging" ||
    rawAppEnvironment === "production"
  ) {
    return rawAppEnvironment;
  }

  return import.meta.env.DEV ? "local" : "production";
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

export const appEnvironment = resolveAppEnvironment();
export const isDemoMode = appEnvironment === "local" || appEnvironment === "demo";
export const isProductionLike =
  appEnvironment === "staging" || appEnvironment === "production";

const browserLocation = getBrowserLocation();

export const isLocalDev =
  appEnvironment === "local" &&
  import.meta.env.DEV &&
  Boolean(browserLocation && isLocalhost(browserLocation.hostname));

export const allowDevBypass =
  isLocalDev && import.meta.env["VITE_ENABLE_DEV_ADMIN_BYPASS"] === "true";

export function isLocalHostname(hostname: string): boolean {
  return isLocalhost(hostname);
}
