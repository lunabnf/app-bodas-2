import type { GuestSession } from "../domain/guest";

// TEMP DEV: abrir módulos públicos de boda sin identificación obligatoria.
// TODO: desactivar antes de producción y volver a exigir identificación real.
function isLocalhostHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

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
  if (typeof window === "undefined") return false;

  // Entorno local de desarrollo Vite.
  if (import.meta.env.DEV) return true;

  // Preview/editor local explícito sin abrir producción real.
  const { hostname, pathname, search } = window.location;
  return isLocalhostHost(hostname) && isEditorOrPreviewHint(pathname, search);
}

export const DEV_OPEN_PUBLIC_WEDDING = resolveDevPublicAccessFlag();

export type DevGuestRole = "holder" | "companion";

export function resolveDevGuestRole(): DevGuestRole {
  if (typeof window === "undefined") return "holder";
  const role = new URLSearchParams(window.location.search).get("dev-role");
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
