import { weddingSettingsSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
const SETTINGS_KEY = "wedding.settings";
const LEGACY_KEYS = {
    novio: "wedding.novio",
    novia: "wedding.novia",
    fecha: "wedding.fecha",
    hora: "wedding.hora",
};
export const defaultWeddingSettings = {
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
function migrateLegacySettings() {
    const merged = {
        ...defaultWeddingSettings,
        novio: localStorage.getItem(LEGACY_KEYS.novio) || "",
        novia: localStorage.getItem(LEGACY_KEYS.novia) || "",
        fecha: localStorage.getItem(LEGACY_KEYS.fecha) || "",
        hora: localStorage.getItem(LEGACY_KEYS.hora) || "",
    };
    writeStorage(SETTINGS_KEY, merged);
    return merged;
}
export function getWeddingSettings() {
    const parsed = readStorageWithSchema(SETTINGS_KEY, weddingSettingsSchema.nullable(), null);
    if (parsed) {
        return parsed;
    }
    return migrateLegacySettings();
}
export function saveWeddingSettings(settings) {
    writeStorage(SETTINGS_KEY, settings);
    localStorage.setItem(LEGACY_KEYS.novio, settings.novio);
    localStorage.setItem(LEGACY_KEYS.novia, settings.novia);
    localStorage.setItem(LEGACY_KEYS.fecha, settings.fecha);
    localStorage.setItem(LEGACY_KEYS.hora, settings.hora);
}
