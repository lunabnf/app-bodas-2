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
    return parsed;
  }

  const legacyScoped = readStorageWithSchema<WeddingSettings | null>(
    SETTINGS_KEY,
    weddingSettingsSchema.nullable(),
    null
  );
  if (legacyScoped) {
    writeStorage(scopedKey, legacyScoped);
    localStorage.removeItem(SETTINGS_KEY);
    return legacyScoped;
  }

  return migrateLegacySettings();
}

export function saveWeddingSettings(settings: WeddingSettings) {
  const scopedKey = scopedStorageKey(SETTINGS_KEY);
  writeStorage(scopedKey, settings);
}
