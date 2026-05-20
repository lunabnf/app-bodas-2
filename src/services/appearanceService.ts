import { appearanceSettingsSchema } from "../domain/schemas";
import { getDocumentRoot } from "../lib/browser";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";

export type AppearanceSettings = {
  heroTitleMaxRem: number;
  pageTitleRem: number;
  sectionTitleRem: number;
  surfaceOpacity: number;
  softSurfaceOpacity: number;
};

const STORAGE_KEY = "wedding.appearance";

export const defaultAppearanceSettings: AppearanceSettings = {
  heroTitleMaxRem: 5.2,
  pageTitleRem: 3.1,
  sectionTitleRem: 1.6,
  surfaceOpacity: 0.76,
  softSurfaceOpacity: 0.92,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getAppearanceSettings(): AppearanceSettings {
  const parsed = readStorageWithSchema<AppearanceSettings>(
    scopedStorageKey(STORAGE_KEY),
    appearanceSettingsSchema,
    defaultAppearanceSettings
  );
  return {
    heroTitleMaxRem: clamp(parsed.heroTitleMaxRem, 4, 7),
    pageTitleRem: clamp(parsed.pageTitleRem, 2.2, 4.4),
    sectionTitleRem: clamp(parsed.sectionTitleRem, 1.2, 2.4),
    surfaceOpacity: clamp(parsed.surfaceOpacity, 0.72, 1),
    softSurfaceOpacity: clamp(parsed.softSurfaceOpacity, 0.84, 1),
  };
}

export function saveAppearanceSettings(settings: AppearanceSettings) {
  writeStorage(scopedStorageKey(STORAGE_KEY), settings);
}

export function applyAppearanceSettings(settings: AppearanceSettings) {
  const root = getDocumentRoot();
  if (!root) return;
  root.style.setProperty("--app-hero-title-max", `${settings.heroTitleMaxRem}rem`);
  root.style.setProperty("--app-page-title-size", `${settings.pageTitleRem}rem`);
  root.style.setProperty("--app-section-title-size", `${settings.sectionTitleRem}rem`);
  root.style.setProperty("--app-surface-bg", `rgba(255, 255, 255, ${settings.surfaceOpacity})`);
  root.style.setProperty(
    "--app-surface-soft-bg",
    `rgba(255, 255, 255, ${settings.softSurfaceOpacity})`
  );
}
