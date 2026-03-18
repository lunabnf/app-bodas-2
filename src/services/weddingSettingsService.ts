import { weddingSettingsSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";

export type GuestHomeButtonTarget =
  | "mi_resumen"
  | "rsvp"
  | "programa"
  | "alojamientos"
  | "desplazamientos"
  | "mesas"
  | "musica"
  | "chat"
  | "buscar_boda";

export type GuestHomeSettings = {
  imagenPrincipal: string | null;
  tituloPrincipal: string;
  subtituloBienvenida: string;
  textoSecundario: string;
  mensajeDestacado: string;
  botonPrincipalTexto: string;
  botonPrincipalDestino: GuestHomeButtonTarget;
  botonSecundarioTexto: string;
  botonSecundarioDestino: GuestHomeButtonTarget;
  bloqueSecundarioTitulo: string;
  bloqueSecundarioTexto: string;
  mostrarBloqueSecundario: boolean;
  mostrarInstalacionApp: boolean;
};

export type WeddingSettings = {
  novio: string;
  novia: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  color: string;
  mensajeInvitacion: string;
  portada: string | null;
  mostrarPrograma: boolean;
  mostrarMesas: boolean;
  mesasVisibilityMode: "hidden" | "visible" | "scheduled";
  mesasPublishAt: string | null;
  guestHome: GuestHomeSettings;
};

const SETTINGS_KEY = "wedding.settings";
const LEGACY_KEYS = {
  novio: "wedding.novio",
  novia: "wedding.novia",
  fecha: "wedding.fecha",
  hora: "wedding.hora",
};

export const defaultGuestHomeSettings: GuestHomeSettings = {
  imagenPrincipal: null,
  tituloPrincipal: "La forma más clara de organizar una boda con calma.",
  subtituloBienvenida:
    "Una web app para que novios e invitados compartan toda la información importante en un mismo espacio, con una experiencia limpia, serena y fácil de seguir.",
  textoSecundario: "",
  mensajeDestacado: "Lazo",
  botonPrincipalTexto: "Acceder",
  botonPrincipalDestino: "mi_resumen",
  botonSecundarioTexto: "Ver zona de invitados",
  botonSecundarioDestino: "rsvp",
  bloqueSecundarioTitulo: "Qué resuelve",
  bloqueSecundarioTexto:
    "Invitaciones, RSVP, logística, música, mesas y actividad centralizada para que los novios tengan control y los invitados sólo vean lo que necesitan.",
  mostrarBloqueSecundario: true,
  mostrarInstalacionApp: true,
};

export const defaultWeddingSettings: WeddingSettings = {
  novio: "",
  novia: "",
  fecha: "",
  hora: "",
  ubicacion: "",
  color: "#ffffff",
  mensajeInvitacion: "",
  portada: null,
  mostrarPrograma: true,
  mostrarMesas: true,
  mesasVisibilityMode: "visible",
  mesasPublishAt: null,
  guestHome: defaultGuestHomeSettings,
};

function migrateLegacySettings(): WeddingSettings {
  const scopedKey = scopedStorageKey(SETTINGS_KEY);
  const merged: WeddingSettings = {
    ...defaultWeddingSettings,
    novio: localStorage.getItem(LEGACY_KEYS.novio) || "",
    novia: localStorage.getItem(LEGACY_KEYS.novia) || "",
    fecha: localStorage.getItem(LEGACY_KEYS.fecha) || "",
    hora: localStorage.getItem(LEGACY_KEYS.hora) || "",
  };

  writeStorage(scopedKey, merged);
  return merged;
}

export function getWeddingSettings(): WeddingSettings {
  const scopedKey = scopedStorageKey(SETTINGS_KEY);
  const parsed = readStorageWithSchema<WeddingSettings | null>(
    scopedKey,
    weddingSettingsSchema.nullable(),
    null
  );

  if (parsed) {
    return {
      ...defaultWeddingSettings,
      ...parsed,
      guestHome: {
        ...defaultGuestHomeSettings,
        ...parsed.guestHome,
      },
    };
  }

  const legacyScoped = readStorageWithSchema<WeddingSettings | null>(
    SETTINGS_KEY,
    weddingSettingsSchema.nullable(),
    null
  );
  if (legacyScoped) {
    const normalized = {
      ...defaultWeddingSettings,
      ...legacyScoped,
      guestHome: {
        ...defaultGuestHomeSettings,
        ...legacyScoped.guestHome,
      },
    };
    writeStorage(scopedKey, normalized);
    localStorage.removeItem(SETTINGS_KEY);
    return normalized;
  }

  return migrateLegacySettings();
}

export function isMesasPublishedForGuests(settings: WeddingSettings, now = Date.now()): boolean {
  if (!settings.mostrarMesas) return false;
  if (settings.mesasVisibilityMode === "hidden") return false;
  if (settings.mesasVisibilityMode !== "scheduled") return true;
  if (!settings.mesasPublishAt) return false;
  const publishDate = new Date(settings.mesasPublishAt).getTime();
  if (Number.isNaN(publishDate)) return false;
  return now >= publishDate;
}

export function saveWeddingSettings(settings: WeddingSettings) {
  const scopedKey = scopedStorageKey(SETTINGS_KEY);
  writeStorage(scopedKey, settings);
}
