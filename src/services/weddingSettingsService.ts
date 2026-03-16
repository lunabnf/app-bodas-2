import { weddingSettingsSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";

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
};

const SETTINGS_KEY = "wedding.settings";
const LEGACY_KEYS = {
  novio: "wedding.novio",
  novia: "wedding.novia",
  fecha: "wedding.fecha",
  hora: "wedding.hora",
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
    };
  }

  const legacyScoped = readStorageWithSchema<WeddingSettings | null>(
    SETTINGS_KEY,
    weddingSettingsSchema.nullable(),
    null
  );
  if (legacyScoped) {
    const normalized = { ...defaultWeddingSettings, ...legacyScoped };
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
