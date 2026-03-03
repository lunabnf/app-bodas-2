import { useState, useEffect } from "react";
import {
  applyAppearanceSettings,
  defaultAppearanceSettings,
  getAppearanceSettings,
  saveAppearanceSettings,
  type AppearanceSettings,
} from "../services/appearanceService";
import {
  defaultWeddingSettings,
  getWeddingSettings,
  saveWeddingSettings,
} from "../services/weddingSettingsService";

export default function Ajustes() {
  const [settings, setSettings] = useState(defaultWeddingSettings);
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearanceSettings);

  useEffect(() => {
    setSettings(getWeddingSettings());
    setAppearance(getAppearanceSettings());
  }, []);

  const subirPortada = (file: File) => {
    const url = URL.createObjectURL(file);
    const next = { ...settings, portada: url };
    setSettings(next);
    saveWeddingSettings(next);
  };

  const updateSettings = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    const next = {
      ...settings,
      [key]: value,
    };
    setSettings(next);
    saveWeddingSettings(next);
  };

  const updateAppearance = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    const next = {
      ...appearance,
      [key]: value,
    };
    setAppearance(next);
    saveAppearanceSettings(next);
    applyAppearanceSettings(next);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-[var(--app-ink)] sm:px-6">

      <div className="app-surface p-8">
        <p className="app-kicker">Configuración</p>
        <h1 className="app-page-title mt-4">Ajustes y configuración</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Controla el contenido general de la boda y también la apariencia visual de la aplicación.
        </p>
      </div>

      <section className="app-panel p-6">
        <h2 className="app-section-heading mb-4">Datos de la boda</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del novio / novia 1"
            value={settings.novio}
            onChange={(e) => updateSettings("novio", e.target.value)}
            className="p-3"
          />

          <input
            type="text"
            placeholder="Nombre del novio / novia 2"
            value={settings.novia}
            onChange={(e) => updateSettings("novia", e.target.value)}
            className="p-3"
          />

          <input
            type="date"
            value={settings.fecha}
            onChange={(e) => updateSettings("fecha", e.target.value)}
            className="p-3"
          />

          <input
            type="time"
            value={settings.hora}
            onChange={(e) => updateSettings("hora", e.target.value)}
            className="p-3"
          />

          <input
            type="text"
            placeholder="Ubicación / dirección"
            value={settings.ubicacion}
            onChange={(e) => updateSettings("ubicacion", e.target.value)}
            className="col-span-1 p-3 md:col-span-2"
          />

          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-2 font-semibold text-[var(--app-ink)]">Color principal de la boda</label>
            <input
              type="color"
              value={settings.color}
              onChange={(e) => updateSettings("color", e.target.value)}
              className="h-12 w-24 p-1"
            />
          </div>
        </div>
      </section>

      <section className="app-panel p-6">
        <h2 className="app-section-heading mb-4">Apariencia visual</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Tamaño título principal: {appearance.heroTitleMaxRem.toFixed(1)}rem
            </span>
            <input
              type="range"
              min="4"
              max="7"
              step="0.1"
              value={appearance.heroTitleMaxRem}
              onChange={(e) => updateAppearance("heroTitleMaxRem", Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Tamaño título de página: {appearance.pageTitleRem.toFixed(1)}rem
            </span>
            <input
              type="range"
              min="2.2"
              max="4.4"
              step="0.1"
              value={appearance.pageTitleRem}
              onChange={(e) => updateAppearance("pageTitleRem", Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Tamaño títulos de bloque: {appearance.sectionTitleRem.toFixed(1)}rem
            </span>
            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              value={appearance.sectionTitleRem}
              onChange={(e) => updateAppearance("sectionTitleRem", Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Opacidad paneles principales: {Math.round(appearance.surfaceOpacity * 100)}%
            </span>
            <input
              type="range"
              min="0.72"
              max="1"
              step="0.01"
              value={appearance.surfaceOpacity}
              onChange={(e) => updateAppearance("surfaceOpacity", Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Opacidad paneles suaves: {Math.round(appearance.softSurfaceOpacity * 100)}%
            </span>
            <input
              type="range"
              min="0.84"
              max="1"
              step="0.01"
              value={appearance.softSurfaceOpacity}
              onChange={(e) => updateAppearance("softSurfaceOpacity", Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </section>

      <section className="app-panel p-6">
        <h2 className="app-section-heading mb-4">Foto de portada</h2>

        <button
          onClick={() =>
            document.getElementById("filePortada")?.click()
          }
          className="app-button-secondary mb-4"
        >
          Subir portada
        </button>

        <input
          id="filePortada"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) subirPortada(e.target.files[0]);
          }}
        />

        {settings.portada && (
          <div className="mt-4">
            <img
              src={settings.portada}
              alt="Portada"
              className="w-full max-h-60 object-cover rounded"
            />
          </div>
        )}
      </section>

      <section className="app-panel p-6">
        <h2 className="app-section-heading mb-4">Invitaciones</h2>

        <textarea
          placeholder="Mensaje personalizado para las invitaciones"
          value={settings.mensajeInvitacion}
          onChange={(e) => updateSettings("mensajeInvitacion", e.target.value)}
          className="mb-3 w-full p-3"
          rows={4}
        />

        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={settings.mostrarPrograma}
            onChange={() => updateSettings("mostrarPrograma", !settings.mostrarPrograma)}
          />
          <label>Mostrar programa a los invitados</label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.mostrarMesas}
            onChange={() => updateSettings("mostrarMesas", !settings.mostrarMesas)}
          />
          <label>Mostrar mesas a los invitados</label>
        </div>
      </section>

      <section className="app-panel p-6">
        <h2 className="app-section-heading mb-4">Gestión de datos</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <button className="app-button-secondary">
            Exportar datos
          </button>

          <button className="app-button-primary">
            Reiniciar boda (vaciar todo)
          </button>
        </div>
      </section>
    </div>
  );
}
