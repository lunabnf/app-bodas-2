import type { GuestSession } from "../domain/guest";

// TEMP DEV: abrir módulos públicos de boda sin identificación obligatoria.
// TODO: desactivar antes de producción y volver a exigir identificación real.
export const DEV_OPEN_PUBLIC_WEDDING = true;

export function resolvePublicGuestSession(
  invitado: GuestSession | null,
  weddingSlug?: string
): GuestSession | null {
  if (invitado) return invitado;
  if (!DEV_OPEN_PUBLIC_WEDDING) return null;

  const slug = (weddingSlug || "demo").trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "demo";

  return {
    token: `dev-open-${slug}`,
    nombre: "Invitado de revisión",
    tipo: "Adulto",
    grupoTipo: "otros",
    esAdulto: true,
    edad: 30,
  };
}
