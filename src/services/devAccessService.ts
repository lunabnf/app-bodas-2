import type { GuestSession } from "../domain/guest";
import {
  allowDevBypass,
  isDemoMode,
  isLocalDev,
  isLocalHostname,
} from "../config/appEnv";
import { getBrowserLocation } from "../lib/browser";

// TEMP DEV: abrir módulos públicos de boda sin identificación obligatoria.
// TODO: desactivar antes de producción y volver a exigir identificación real.
function isEditorOrPreviewHint(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  return (
    params.get("preview") === "1" ||
    params.get("editor") === "1" ||
    params.get("dev-rsvp") === "1" ||
    pathname.includes("/preview") ||
    pathname.includes("/editor")
  );
}

function resolveDevPublicAccessFlag() {
  const location = getBrowserLocation();
  if (!location) return false;

  // Entorno local de desarrollo Vite.
  if (isLocalDev) return true;

  // Preview/editor local explícito sin abrir producción real.
  const { hostname, pathname, search } = location;
  return (
    isDemoMode &&
    isLocalHostname(hostname) &&
    isEditorOrPreviewHint(pathname, search)
  );
}

export const DEV_OPEN_PUBLIC_WEDDING = resolveDevPublicAccessFlag();

function resolveDevAdminAccessFlag() {
  return allowDevBypass;
}

export const DEV_OPEN_WEDDING_ADMIN = resolveDevAdminAccessFlag();

export type DevGuestRole = "holder" | "companion";

export function resolveDevGuestRole(): DevGuestRole {
  const role = new URLSearchParams(getBrowserLocation?.()?.search ?? "").get("dev-role");
  return role === "companion" ? "companion" : "holder";
}

export function resolvePublicGuestSession(
  invitado: GuestSession | null,
  weddingSlug?: string
): GuestSession | null {
  if (invitado) return invitado;
  if (!DEV_OPEN_PUBLIC_WEDDING) return null;

  const slug = (weddingSlug || "demo").trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "demo";
  const devRole = resolveDevGuestRole();
  const tokenSuffix = devRole === "companion" ? "companion" : "holder";

  return {
    token: `dev-open-${slug}-${tokenSuffix}`,
    nombre: devRole === "companion" ? "Acompañante de revisión" : "Titular de revisión",
    tipo: "Adulto",
    grupoTipo: "otros",
    esAdulto: true,
    edad: 30,
  };
}
