import { Link, useParams } from "react-router-dom";
import { buildEventSitePaths } from "../eventSite/paths";
import {
  defaultGuestHomeSettings,
  getWeddingSettings,
  type GuestHomeButtonTarget,
} from "../services/weddingSettingsService";
import { useAuth } from "../store/useAuth";

function resolveGuestHomeTarget(
  target: GuestHomeButtonTarget,
  paths: ReturnType<typeof buildEventSitePaths>
) {
  switch (target) {
    case "mi_resumen":
      return paths.miResumen;
    case "rsvp":
      return paths.participaConfirmacion;
    case "programa":
      return paths.programa;
    case "alojamientos":
      return paths.alojamientos;
    case "desplazamientos":
      return paths.desplazamientos;
    case "mesas":
      return paths.participaMesas;
    case "musica":
      return paths.participaMusica;
    case "chat":
      return paths.participaChat;
    case "buscar_boda":
      return "/buscar-boda";
    default:
      return paths.miResumen;
  }
}

export default function Home() {
  const esAdmin = useAuth((state) => state.esAdmin);
  const invitado = useAuth((state) => state.invitado);
  const { slug } = useParams();
  const paths = buildEventSitePaths(slug);
  const settings = getWeddingSettings();
  const isDemoWedding = slug === "demo";
  const adminPath = slug ? `/w/${slug}/admin` : "/w/demo/admin";
  const heroImage = settings.guestHome.imagenPrincipal || settings.portada;
  const primaryHref = esAdmin
    ? adminPath
    : resolveGuestHomeTarget(settings.guestHome.botonPrincipalDestino, paths);
  const secondaryHref = resolveGuestHomeTarget(settings.guestHome.botonSecundarioDestino, paths);
  const coupleNames =
    settings.novio.trim() && settings.novia.trim()
      ? `${settings.novio.trim()} & ${settings.novia.trim()}`
      : settings.guestHome.tituloPrincipal.trim() &&
          settings.guestHome.tituloPrincipal !== defaultGuestHomeSettings.tituloPrincipal
        ? settings.guestHome.tituloPrincipal.trim()
        : isDemoWedding
          ? "María & Javier"
          : "Nuestra boda";
  const weddingDate = settings.fecha
    ? new Date(`${settings.fecha}T12:00:00`).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : isDemoWedding
      ? "18 de julio de 2026"
      : "Fecha por confirmar";
  const weddingLocation = settings.ubicacion.trim() || (isDemoWedding ? "Finca El Olivar · Toledo" : "");
  const welcomeKicker =
    settings.guestHome.mensajeDestacado === defaultGuestHomeSettings.mensajeDestacado
      ? "Bienvenidos"
      : settings.guestHome.mensajeDestacado.trim() || "Bienvenidos";
  const welcomeSubtitle =
    settings.guestHome.subtituloBienvenida === defaultGuestHomeSettings.subtituloBienvenida
      ? "Nos hace mucha ilusión compartir este día con vosotros. Aquí encontraréis los horarios, la confirmación de asistencia y toda la información práctica."
      : settings.guestHome.subtituloBienvenida.trim();
  const primaryLabel =
    settings.guestHome.botonPrincipalTexto === defaultGuestHomeSettings.botonPrincipalTexto
      ? "Ver mi invitación"
      : settings.guestHome.botonPrincipalTexto.trim() || "Ver mi invitación";
  const secondaryLabel =
    settings.guestHome.botonSecundarioTexto === defaultGuestHomeSettings.botonSecundarioTexto
      ? "Confirmar asistencia"
      : settings.guestHome.botonSecundarioTexto.trim() || "Abrir mi resumen";
  const guestModules = [
    {
      label: "Programa",
      description: "Consulta los horarios y momentos importantes del día.",
      to: paths.programa,
      eyebrow: "El gran día",
    },
    {
      label: "Confirmar asistencia",
      description: "Responde al RSVP y comparte alergias o necesidades.",
      to: paths.participaConfirmacion,
      eyebrow: "Tu invitación",
    },
    {
      label: "Música",
      description: "Propón canciones y vota las favoritas de los invitados.",
      to: paths.participaMusica,
      eyebrow: "Participa",
    },
    {
      label: "Alojamiento",
      description: "Revisa las opciones recomendadas cerca de la celebración.",
      to: paths.alojamientos,
      eyebrow: "Información útil",
    },
    {
      label: "Cómo llegar",
      description: "Consulta desplazamientos y detalles prácticos del evento.",
      to: paths.desplazamientos,
      eyebrow: "Organiza tu viaje",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-10 lg:px-8">
      <div className="app-surface overflow-hidden">
        <div className={`grid ${heroImage ? "lg:grid-cols-[1.08fr_0.92fr]" : ""}`}>
          <div className="flex min-h-[34rem] flex-col justify-between p-7 sm:p-10 lg:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--app-muted)]">
                <span className="rounded-full border border-[var(--app-line)] bg-white/70 px-3 py-1.5">
                  {weddingDate}
                </span>
                {weddingLocation ? (
                  <span className="rounded-full border border-[var(--app-line)] bg-white/70 px-3 py-1.5">
                    {weddingLocation}
                  </span>
                ) : null}
              </div>

              <p className="app-kicker mt-10">
                {welcomeKicker}
              </p>
              <h1 className="app-title mt-4 max-w-3xl">{coupleNames}</h1>
              <p className="app-subtitle mt-6 max-w-2xl">
                {settings.mensajeInvitacion.trim() ||
                  welcomeSubtitle ||
                  "Nos hace mucha ilusión compartir este día con vosotros. Aquí encontraréis todo lo necesario para disfrutarlo con calma."}
              </p>
              {settings.guestHome.textoSecundario.trim() ? (
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-muted)]">
                  {settings.guestHome.textoSecundario.trim()}
                </p>
              ) : null}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryHref} className="app-button-primary text-center">
                {esAdmin
                  ? "Ir al panel de novios"
                  : primaryLabel}
              </Link>
              <Link to={paths.programa} className="app-button-secondary text-center">
                Ver programa
              </Link>
            </div>
          </div>

          {heroImage ? (
            <div className="min-h-80 overflow-hidden border-t border-[var(--app-line)] lg:border-l lg:border-t-0">
              <img src={heroImage} alt="Imagen principal de la boda" className="h-full min-h-80 w-full object-cover" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="app-surface-soft flex min-h-56 flex-col justify-between p-6 md:col-span-2 xl:col-span-1">
          <div>
            <p className="app-kicker">{invitado ? `Hola, ${invitado.nombre}` : "Tu espacio"}</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
              {invitado ? "Todo listo para acompañarnos." : "Toda la boda en un mismo lugar."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
              {invitado
                ? "Revisa tu confirmación, consulta los detalles y participa en los preparativos."
                : "Accede desde tu invitación personal para confirmar asistencia y ver la información preparada para ti."}
            </p>
          </div>
          <Link to={secondaryHref} className="mt-6 text-sm font-semibold">
            {secondaryLabel} &rarr;
          </Link>
        </article>

        {guestModules.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="group app-surface-soft flex min-h-56 flex-col justify-between p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--app-line-strong)] hover:shadow-[0_22px_48px_rgba(53,52,48,0.09)]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {item.eyebrow}
                </p>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-white/70 transition group-hover:bg-[var(--app-ink)] group-hover:text-[#f8f7f3]">
                  &rarr;
                </span>
              </div>
              <h2 className="mt-7 text-2xl font-semibold tracking-[-0.04em]">{item.label}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">{item.description}</p>
            </div>
            <p className="mt-6 text-sm font-semibold">Abrir</p>
          </Link>
        ))}
      </div>

      {settings.guestHome.mostrarInstalacionApp ? (
        <details className="app-surface-soft p-6 sm:p-8">
          <summary className="cursor-pointer list-none">
            <p className="app-kicker">Acceso rápido</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Guardar esta boda en tu móvil</h2>
              <span className="text-sm font-semibold">Ver instrucciones</span>
            </div>
          </summary>
          <div className="mt-6 grid gap-4 border-t border-[var(--app-line)] pt-6 md:grid-cols-2">
            <div>
              <p className="font-semibold">iPhone / iPad</p>
              <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                Abre en Safari, pulsa Compartir y elige “Añadir a pantalla de inicio”.
              </p>
            </div>
            <div>
              <p className="font-semibold">Android</p>
              <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                Abre el menú de Chrome y selecciona “Instalar app” o “Añadir a pantalla de inicio”.
              </p>
            </div>
          </div>
        </details>
      ) : null}
    </section>
  );
}
