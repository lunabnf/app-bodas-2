import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  type GuestHomeButtonTarget,
} from "../services/weddingSettingsService";

const guestHomeTargetOptions: Array<{ value: GuestHomeButtonTarget; label: string }> = [
  { value: "mi_resumen", label: "Mi resumen" },
  { value: "rsvp", label: "RSVP" },
  { value: "programa", label: "Programa" },
  { value: "alojamientos", label: "Alojamientos" },
  { value: "desplazamientos", label: "Desplazamientos" },
  { value: "mesas", label: "Mesas" },
  { value: "musica", label: "Música" },
  { value: "chat", label: "Chat" },
  { value: "buscar_boda", label: "Buscar boda" },
] as const;

type SettingsSectionId =
  | "identidad"
  | "apariencia"
  | "inicio_invitados"
  | "publicacion"
  | "invitados_acceso"
  | "participacion"
  | "plan_tiempos"
  | "presupuesto"
  | "archivos_fotos"
  | "avanzado";

type SettingsSection = {
  id: SettingsSectionId;
  title: string;
  description: string;
  summary: string;
  keywords: string[];
};

const sectionDefinitions: SettingsSection[] = [
  {
    id: "identidad",
    title: "Identidad de la boda",
    description: "Nombres, fecha, hora, lugar, mensaje principal y portada general.",
    summary: "Novios, fecha, lugar, portada y frase principal.",
    keywords: ["identidad", "boda", "novios", "fecha", "hora", "lugar", "portada", "mensaje"],
  },
  {
    id: "apariencia",
    title: "Apariencia visual",
    description: "Ajustes visuales controlados para mantener el estilo premium sin romper diseño.",
    summary: "Color base, tamaños tipográficos y transparencias.",
    keywords: ["apariencia", "visual", "color", "estilo", "transparencia", "tipografia"],
  },
  {
    id: "inicio_invitados",
    title: "Inicio invitados",
    description: "Configura la portada pública de la boda y los botones principales.",
    summary: "Hero de invitados, textos, botones y ayuda de instalación.",
    keywords: ["inicio", "invitados", "home", "portada", "bienvenida", "ios", "android", "botones"],
  },
  {
    id: "publicacion",
    title: "Publicación y visibilidad",
    description: "Decide qué ven los invitados y cuándo se publica.",
    summary: "Programa, mesas y modos de visibilidad.",
    keywords: ["publicacion", "visibilidad", "programa", "mesas", "publicar", "mostrar"],
  },
  {
    id: "invitados_acceso",
    title: "Invitados y acceso",
    description: "Estado de acceso y confirmaciones ligado a los módulos ya existentes.",
    summary: "Se conecta con invitados, RSVP y control de acceso.",
    keywords: ["invitados", "acceso", "rsvp", "acompanantes", "confirmaciones"],
  },
  {
    id: "participacion",
    title: "Participación",
    description: "Música, chat, fotos y módulos sociales conectados.",
    summary: "Accesos rápidos a módulos participativos.",
    keywords: ["participacion", "chat", "musica", "fotos", "social"],
  },
  {
    id: "plan_tiempos",
    title: "Plan y tiempos",
    description: "Plan contratado, fecha de boda y ritmo general de apertura.",
    summary: "Orientación temporal ligada al plan y a Gestión.",
    keywords: ["plan", "tiempos", "apertura", "agenda", "gestion", "premium", "pro", "free"],
  },
  {
    id: "presupuesto",
    title: "Presupuesto",
    description: "Resumen conectado con el presupuesto real del evento.",
    summary: "Acceso rápido a costes y parte dinámica.",
    keywords: ["presupuesto", "costes", "adulto", "nino", "variable"],
  },
  {
    id: "archivos_fotos",
    title: "Archivos y fotos",
    description: "Carpeta interna y fotos subidas por invitados, sin duplicar persistencia.",
    summary: "Conexión con Archivos y galería pública.",
    keywords: ["archivos", "fotos", "galeria", "invitados"],
  },
  {
    id: "avanzado",
    title: "Avanzado",
    description: "Datos técnicos y operaciones de mantenimiento básico.",
    summary: "Slug, exportación y acciones internas.",
    keywords: ["avanzado", "slug", "exportar", "reiniciar", "tecnico"],
  },
] as const;

function buildInitialCollapsedState() {
  return Object.fromEntries(
    sectionDefinitions.map((section, index) => [section.id, index !== 0])
  ) as Record<SettingsSectionId, boolean>;
}

function loadCollapsedState(): Record<SettingsSectionId, boolean> {
  if (typeof window === "undefined") return buildInitialCollapsedState();
  try {
    const raw = localStorage.getItem("wedding.admin.settings.collapsed");
    if (!raw) return buildInitialCollapsedState();
    const parsed = JSON.parse(raw) as Partial<Record<SettingsSectionId, boolean>>;
    return {
      ...buildInitialCollapsedState(),
      ...parsed,
    };
  } catch {
    return buildInitialCollapsedState();
  }
}

function saveCollapsedState(next: Record<SettingsSectionId, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wedding.admin.settings.collapsed", JSON.stringify(next));
}

export default function Ajustes() {
  const { slug } = useParams();
  const adminBasePath = slug ? `/w/${slug}/admin` : "/w/demo/admin";

  const [settingsDraft, setSettingsDraft] = useState(defaultWeddingSettings);
  const [appearanceDraft, setAppearanceDraft] = useState<AppearanceSettings>(defaultAppearanceSettings);
  const [collapsed, setCollapsed] = useState<Record<SettingsSectionId, boolean>>(buildInitialCollapsedState);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSettingsDraft(getWeddingSettings());
    const storedAppearance = getAppearanceSettings();
    setAppearanceDraft(storedAppearance);
    setCollapsed(loadCollapsedState());
  }, []);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sectionDefinitions;
    return sectionDefinitions.filter((section) => {
      const haystack = [
        section.title,
        section.description,
        section.summary,
        ...section.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  function updateSettings<K extends keyof typeof settingsDraft>(
    key: K,
    value: (typeof settingsDraft)[K]
  ) {
    setSettingsDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateGuestHome<K extends keyof typeof settingsDraft.guestHome>(
    key: K,
    value: (typeof settingsDraft.guestHome)[K]
  ) {
    setSettingsDraft((current) => ({
      ...current,
      guestHome: {
        ...current.guestHome,
        [key]: value,
      },
    }));
  }

  function updateAppearance<K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) {
    const next = {
      ...appearanceDraft,
      [key]: value,
    };
    setAppearanceDraft(next);
    applyAppearanceSettings(next);
  }

  function subirPortada(file: File) {
    const url = URL.createObjectURL(file);
    updateSettings("portada", url);
  }

  function subirImagenInicio(file: File) {
    const url = URL.createObjectURL(file);
    updateGuestHome("imagenPrincipal", url);
  }

  function handleSave() {
    saveWeddingSettings(settingsDraft);
    saveAppearanceSettings(appearanceDraft);
    applyAppearanceSettings(appearanceDraft);
    setNotice("Ajustes guardados correctamente.");
  }

  function toggleSection(id: SettingsSectionId) {
    const next = {
      ...collapsed,
      [id]: !collapsed[id],
    };
    setCollapsed(next);
    saveCollapsedState(next);
  }

  function expandAll() {
    const next = Object.fromEntries(
      sectionDefinitions.map((section) => [section.id, false])
    ) as Record<SettingsSectionId, boolean>;
    setCollapsed(next);
    saveCollapsedState(next);
  }

  function collapseAll() {
    const next = Object.fromEntries(
      sectionDefinitions.map((section) => [section.id, true])
    ) as Record<SettingsSectionId, boolean>;
    setCollapsed(next);
    saveCollapsedState(next);
  }

  function renderSection(section: SettingsSection) {
    if (section.id === "identidad") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre del novio / novia 1"
            value={settingsDraft.novio}
            onChange={(event) => updateSettings("novio", event.target.value)}
            className="p-3"
          />
          <input
            type="text"
            placeholder="Nombre del novio / novia 2"
            value={settingsDraft.novia}
            onChange={(event) => updateSettings("novia", event.target.value)}
            className="p-3"
          />
          <input
            type="date"
            value={settingsDraft.fecha}
            onChange={(event) => updateSettings("fecha", event.target.value)}
            className="p-3"
          />
          <input
            type="time"
            value={settingsDraft.hora}
            onChange={(event) => updateSettings("hora", event.target.value)}
            className="p-3"
          />
          <input
            type="text"
            placeholder="Lugar o dirección"
            value={settingsDraft.ubicacion}
            onChange={(event) => updateSettings("ubicacion", event.target.value)}
            className="p-3 md:col-span-2"
          />
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">Mensaje de invitación</span>
            <textarea
              value={settingsDraft.mensajeInvitacion}
              onChange={(event) => updateSettings("mensajeInvitacion", event.target.value)}
              className="w-full p-3"
              rows={4}
            />
          </label>
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Foto principal de la boda</p>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Portada general usada como imagen base del evento.</p>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("filePortada")?.click()}
                className="app-button-secondary"
              >
                Subir portada
              </button>
              <input
                id="filePortada"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.[0]) subirPortada(event.target.files[0]);
                }}
              />
            </div>
            {settingsDraft.portada ? (
              <img src={settingsDraft.portada} alt="Portada" className="mt-4 max-h-64 w-full rounded-[22px] object-cover" />
            ) : null}
          </div>
        </div>
      );
    }

    if (section.id === "apariencia") {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">Color principal de la boda</span>
            <input
              type="color"
              value={settingsDraft.color}
              onChange={(event) => updateSettings("color", event.target.value)}
              className="h-12 w-24 p-1"
            />
          </label>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[var(--app-muted)]">
            Estilo visual general controlado: la personalización afecta a tipografía y superficies sin romper la identidad base.
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Tamaño título principal: {appearanceDraft.heroTitleMaxRem.toFixed(1)}rem
            </span>
            <input
              type="range"
              min="4"
              max="7"
              step="0.1"
              value={appearanceDraft.heroTitleMaxRem}
              onChange={(event) => updateAppearance("heroTitleMaxRem", Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Tamaño título de página: {appearanceDraft.pageTitleRem.toFixed(1)}rem
            </span>
            <input
              type="range"
              min="2.2"
              max="4.4"
              step="0.1"
              value={appearanceDraft.pageTitleRem}
              onChange={(event) => updateAppearance("pageTitleRem", Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Tamaño títulos de bloque: {appearanceDraft.sectionTitleRem.toFixed(1)}rem
            </span>
            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              value={appearanceDraft.sectionTitleRem}
              onChange={(event) => updateAppearance("sectionTitleRem", Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Opacidad paneles principales: {Math.round(appearanceDraft.surfaceOpacity * 100)}%
            </span>
            <input
              type="range"
              min="0.72"
              max="1"
              step="0.01"
              value={appearanceDraft.surfaceOpacity}
              onChange={(event) => updateAppearance("surfaceOpacity", Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">
              Opacidad paneles suaves: {Math.round(appearanceDraft.softSurfaceOpacity * 100)}%
            </span>
            <input
              type="range"
              min="0.84"
              max="1"
              step="0.01"
              value={appearanceDraft.softSurfaceOpacity}
              onChange={(event) => updateAppearance("softSurfaceOpacity", Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
      );
    }

    if (section.id === "inicio_invitados") {
      return (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Portada de invitados</p>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Controla el hero principal, mensajes y botones de la home pública.
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("fileInicioInvitados")?.click()}
              className="app-button-secondary"
            >
              Subir imagen principal
            </button>
            <input
              id="fileInicioInvitados"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                if (event.target.files?.[0]) subirImagenInicio(event.target.files[0]);
              }}
            />
          </div>

          {settingsDraft.guestHome.imagenPrincipal ? (
            <img
              src={settingsDraft.guestHome.imagenPrincipal}
              alt="Inicio invitados"
              className="max-h-64 w-full rounded-[24px] object-cover"
            />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Título principal</span>
              <input
                type="text"
                value={settingsDraft.guestHome.tituloPrincipal}
                onChange={(event) => updateGuestHome("tituloPrincipal", event.target.value)}
                className="w-full p-3"
              />
            </label>
            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Subtítulo o bienvenida</span>
              <textarea
                value={settingsDraft.guestHome.subtituloBienvenida}
                onChange={(event) => updateGuestHome("subtituloBienvenida", event.target.value)}
                className="w-full p-3"
                rows={4}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Mensaje destacado</span>
              <input
                type="text"
                value={settingsDraft.guestHome.mensajeDestacado}
                onChange={(event) => updateGuestHome("mensajeDestacado", event.target.value)}
                className="w-full p-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Texto secundario</span>
              <input
                type="text"
                value={settingsDraft.guestHome.textoSecundario}
                onChange={(event) => updateGuestHome("textoSecundario", event.target.value)}
                className="w-full p-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Texto botón principal</span>
              <input
                type="text"
                value={settingsDraft.guestHome.botonPrincipalTexto}
                onChange={(event) => updateGuestHome("botonPrincipalTexto", event.target.value)}
                className="w-full p-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Destino botón principal</span>
              <select
                value={settingsDraft.guestHome.botonPrincipalDestino}
                onChange={(event) =>
                  updateGuestHome("botonPrincipalDestino", event.target.value as GuestHomeButtonTarget)
                }
                className="w-full p-3"
              >
                {guestHomeTargetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Texto botón secundario</span>
              <input
                type="text"
                value={settingsDraft.guestHome.botonSecundarioTexto}
                onChange={(event) => updateGuestHome("botonSecundarioTexto", event.target.value)}
                className="w-full p-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--app-muted)]">Destino botón secundario</span>
              <select
                value={settingsDraft.guestHome.botonSecundarioDestino}
                onChange={(event) =>
                  updateGuestHome("botonSecundarioDestino", event.target.value as GuestHomeButtonTarget)
                }
                className="w-full p-3"
              >
                {guestHomeTargetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.65)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Bloque secundario</h3>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  Mensaje adicional bajo la cabecera principal.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settingsDraft.guestHome.mostrarBloqueSecundario}
                  onChange={() =>
                    updateGuestHome(
                      "mostrarBloqueSecundario",
                      !settingsDraft.guestHome.mostrarBloqueSecundario
                    )
                  }
                />
                Mostrar bloque
              </label>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--app-muted)]">Título del bloque</span>
                <input
                  type="text"
                  value={settingsDraft.guestHome.bloqueSecundarioTitulo}
                  onChange={(event) => updateGuestHome("bloqueSecundarioTitulo", event.target.value)}
                  className="w-full p-3"
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium text-[var(--app-muted)]">Texto del bloque</span>
                <textarea
                  value={settingsDraft.guestHome.bloqueSecundarioTexto}
                  onChange={(event) => updateGuestHome("bloqueSecundarioTexto", event.target.value)}
                  className="w-full p-3"
                  rows={4}
                />
              </label>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settingsDraft.guestHome.mostrarInstalacionApp}
              onChange={() =>
                updateGuestHome("mostrarInstalacionApp", !settingsDraft.guestHome.mostrarInstalacionApp)
              }
            />
            Mantener visible la ayuda para instalar la web app
          </label>
        </div>
      );
    }

    if (section.id === "publicacion") {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="inline-flex items-center gap-3 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
            <input
              type="checkbox"
              checked={settingsDraft.mostrarPrograma}
              onChange={() => updateSettings("mostrarPrograma", !settingsDraft.mostrarPrograma)}
            />
            Mostrar programa a invitados
          </label>
          <label className="inline-flex items-center gap-3 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
            <input
              type="checkbox"
              checked={settingsDraft.mostrarMesas}
              onChange={() => updateSettings("mostrarMesas", !settingsDraft.mostrarMesas)}
            />
            Mostrar mesas a invitados
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">Modo de visibilidad de mesas</span>
            <select
              value={settingsDraft.mesasVisibilityMode}
              onChange={(event) =>
                updateSettings("mesasVisibilityMode", event.target.value as typeof settingsDraft.mesasVisibilityMode)
              }
              className="w-full p-3"
            >
              <option value="hidden">Ocultas</option>
              <option value="visible">Visibles</option>
              <option value="scheduled">Programadas</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">Fecha de apertura de mesas</span>
            <input
              type="datetime-local"
              value={settingsDraft.mesasPublishAt ?? ""}
              onChange={(event) => updateSettings("mesasPublishAt", event.target.value || null)}
              className="w-full p-3"
            />
          </label>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[var(--app-muted)] lg:col-span-2">
            Programa y mesas se publican desde aquí. Ceremonia, chat, música, alojamientos, desplazamientos y fotos siguen gestionándose desde sus módulos y quedan listos para una fase siguiente de centralización.
          </div>
        </div>
      );
    }

    if (section.id === "invitados_acceso") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Invitados y RSVP</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              La configuración real de acceso, acompañantes y confirmaciones vive en los flujos de Invitados y RSVP.
            </p>
            <Link to={`${adminBasePath}/invitados`} className="app-button-secondary mt-4 inline-flex">
              Abrir Invitados
            </Link>
          </div>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Panel personal del invitado</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              El resumen de invitado y los permisos de participación se derivan de los datos reales ya cargados.
            </p>
            <Link to={`${adminBasePath}/actividad`} className="app-button-secondary mt-4 inline-flex">
              Revisar Actividad
            </Link>
          </div>
        </div>
      );
    }

    if (section.id === "participacion") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Chat</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">Salas, audiencia y mensajes del evento.</p>
            <Link to={`${adminBasePath}/chat`} className="app-button-secondary mt-4 inline-flex">
              Abrir Chat
            </Link>
          </div>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Música</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">Ranking, propuestas y moderación de canciones.</p>
            <Link to={`${adminBasePath}/musica`} className="app-button-secondary mt-4 inline-flex">
              Abrir Música
            </Link>
          </div>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Fotos</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">La galería de invitados se centraliza dentro de Archivos.</p>
            <Link to={`${adminBasePath}/archivos`} className="app-button-secondary mt-4 inline-flex">
              Abrir Archivos
            </Link>
          </div>
        </div>
      );
    }

    if (section.id === "plan_tiempos") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Plan y aperturas</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Gestión calcula aperturas y fases desde el plan contratado y la fecha de boda.
            </p>
            <Link to={`${adminBasePath}/gestion`} className="app-button-secondary mt-4 inline-flex">
              Abrir Gestión
            </Link>
          </div>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Programa del día</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              La parte pública del evento se coordina con el timeline real del programa.
            </p>
            <Link to={`${adminBasePath}/programa`} className="app-button-secondary mt-4 inline-flex">
              Abrir Programa
            </Link>
          </div>
        </div>
      );
    }

    if (section.id === "presupuesto") {
      return (
        <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
          <p className="font-semibold">Presupuesto dinámico</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Los costes base por adultos, niños y otras variables ya viven en el módulo Presupuesto. Este bloque los centraliza como acceso rápido sin duplicar la lógica.
          </p>
          <Link to={`${adminBasePath}/presupuesto`} className="app-button-secondary mt-4 inline-flex">
            Abrir Presupuesto
          </Link>
        </div>
      );
    }

    if (section.id === "archivos_fotos") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Archivos internos</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Documentos, facturas y material interno del evento.
            </p>
            <Link to={`${adminBasePath}/archivos`} className="app-button-secondary mt-4 inline-flex">
              Abrir Archivos
            </Link>
          </div>
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="font-semibold">Fotos de invitados</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              La galería pública se comparte con admin sin duplicar persistencia.
            </p>
            <Link to={`${adminBasePath}/archivos`} className="app-button-secondary mt-4 inline-flex">
              Ver Fotos invitados
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
          <p className="font-semibold">Slug y estructura interna</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            El slug y el contexto del evento se derivan desde la configuración general del sistema y del evento activo.
          </p>
        </div>
        <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
          <p className="font-semibold">Gestión de datos</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Acciones internas de mantenimiento y exportación, preparadas para futura ampliación.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button className="app-button-secondary">Exportar datos</button>
            <button className="app-button-primary">Reiniciar boda (vaciar todo)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6">
      <div className="app-surface p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">Configuración</p>
            <h1 className="app-page-title mt-4">Ajustes y configuración</h1>
            <p className="mt-3 text-[var(--app-muted)]">
              Centro de configuración del evento organizado por bloques plegables, con menos scroll y una lectura mucho más clara.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={expandAll} className="app-button-secondary">
              Expandir todo
            </button>
            <button type="button" onClick={collapseAll} className="app-button-secondary">
              Contraer todo
            </button>
            <button type="button" onClick={handleSave} className="app-button-primary">
              Guardar cambios
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar ajustes, bloques o palabras clave..."
            className="w-full p-3"
          />
          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--app-muted)]">
            {filteredSections.length} bloque(s) visibles · Persistencia real por evento
          </div>
        </div>

        {notice ? (
          <div className="mt-4 rounded-[18px] border border-[rgba(47,106,72,0.18)] bg-[rgba(84,153,111,0.08)] px-4 py-3 text-sm text-[var(--app-muted)]">
            {notice}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {filteredSections.map((section) => {
          const isCollapsed = collapsed[section.id];
          return (
            <section key={section.id} className="app-panel overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full flex-col gap-3 p-6 text-left sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="app-kicker">{section.title}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{section.title}</h2>
                  <p className="mt-2 text-sm text-[var(--app-muted)]">
                    {isCollapsed ? section.summary : section.description}
                  </p>
                </div>
                <div className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-sm font-medium text-[var(--app-ink)]">
                  {isCollapsed ? "Abrir" : "Cerrar"}
                </div>
              </button>

              {!isCollapsed ? (
                <div className="border-t border-[var(--app-line)] px-6 pb-6 pt-2">
                  {renderSection(section)}
                </div>
              ) : null}
            </section>
          );
        })}

        {filteredSections.length === 0 ? (
          <div className="app-panel p-6 text-sm text-[var(--app-muted)]">
            No he encontrado bloques de ajustes para esa búsqueda.
          </div>
        ) : null}
      </div>
    </div>
  );
}
