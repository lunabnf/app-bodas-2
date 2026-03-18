import { Link, useParams } from "react-router-dom";
import { buildEventSitePaths } from "../eventSite/paths";
import { getWeddingSettings, type GuestHomeButtonTarget } from "../services/weddingSettingsService";
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
  const adminPath = slug ? `/w/${slug}/admin` : "/w/demo/admin";
  const heroImage = settings.guestHome.imagenPrincipal || settings.portada;
  const primaryHref = esAdmin
    ? adminPath
    : resolveGuestHomeTarget(settings.guestHome.botonPrincipalDestino, paths);
  const secondaryHref = resolveGuestHomeTarget(settings.guestHome.botonSecundarioDestino, paths);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-10 lg:px-8">
      <div className={`grid gap-6 ${settings.guestHome.mostrarBloqueSecundario ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}>
        <div className="app-surface overflow-hidden p-8 sm:p-12">
          {heroImage ? (
            <div className="mb-8 overflow-hidden rounded-[28px] border border-[var(--app-line)]">
              <img src={heroImage} alt="Imagen principal de la boda" className="h-64 w-full object-cover" />
            </div>
          ) : null}

          <p className="app-kicker">
            {settings.guestHome.mensajeDestacado.trim() || "Lazo"}
          </p>
          <h1 className="app-title mt-4">{settings.guestHome.tituloPrincipal.trim()}</h1>
          <p className="app-subtitle mt-6 max-w-3xl">
            {settings.guestHome.subtituloBienvenida.trim()}
          </p>
          {settings.guestHome.textoSecundario.trim() ? (
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-muted)]">
              {settings.guestHome.textoSecundario.trim()}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={primaryHref} className="app-button-primary text-center">
              {esAdmin
                ? "Ir al panel de novios"
                : settings.guestHome.botonPrincipalTexto.trim() || "Acceder"}
            </Link>
            {settings.guestHome.botonSecundarioTexto.trim() ? (
              <Link to={secondaryHref} className="app-button-secondary text-center">
                {settings.guestHome.botonSecundarioTexto.trim()}
              </Link>
            ) : null}
          </div>
        </div>

        {settings.guestHome.mostrarBloqueSecundario ? (
          <div className="app-grid-cards">
            <article className="app-surface-soft p-7">
              <p className="app-kicker">Mensaje adicional</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--app-ink)]">
                {settings.guestHome.bloqueSecundarioTitulo.trim() || "Todo el evento en una interfaz ordenada y premium."}
              </p>
              <p className="mt-4 app-prose">
                {settings.guestHome.bloqueSecundarioTexto.trim() ||
                  "Invitaciones, RSVP, logística, música, mesas y actividad centralizada para que los novios tengan control y los invitados sólo vean lo que necesitan."}
              </p>
            </article>

            <article className="app-surface-soft p-7">
              <p className="app-kicker">Bienvenida</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                {invitado ? "Hola" : "01"}
              </p>
              <p className="mt-3 app-prose">
                {invitado
                  ? `Tu acceso ya está listo para revisar detalles, confirmar asistencia y seguir todo lo importante del evento.`
                  : `Todo lo importante de la boda queda centralizado aquí para que cada invitado vea solo lo que necesita.`}
              </p>
            </article>
          </div>
        ) : null}
      </div>

      {settings.guestHome.mostrarInstalacionApp ? (
        <div className="mt-6 app-surface p-8 sm:p-12">
          <div className="max-w-4xl space-y-6">
            <h2 className="app-section-heading !text-[calc(var(--app-section-title-size)*1.5)]">
              Instalarla como WebApp
            </h2>
            <p className="app-subtitle">
              Si la guardas en la pantalla de inicio, tendrás una experiencia más fluida y parecida a una app nativa.
            </p>
          </div>

          <div className="mt-10 text-left space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <details className="app-surface-soft p-5 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-[var(--app-ink)]">
                  iPhone / iPad
                </summary>
                <ol className="mt-3 list-decimal space-y-1 pl-6 text-[var(--app-muted)]">
                  <li>Abre esta web en Safari.</li>
                  <li>Toca el botón <span className="italic">Compartir</span>.</li>
                  <li>Desplázate y pulsa <strong>Añadir a pantalla de inicio</strong>.</li>
                  <li>Opcional: cambia el nombre que verás en el icono.</li>
                  <li>Pulsa <strong>Añadir</strong>. La app quedará como si fuera una app nativa.</li>
                </ol>
              </details>

              <details className="app-surface-soft p-5 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-[var(--app-ink)]">
                  Android
                </summary>
                <ol className="mt-3 list-decimal space-y-1 pl-6 text-[var(--app-muted)]">
                  <li>Abre esta web en Google Chrome.</li>
                  <li>Toca el menú ⋮ en la esquina superior derecha.</li>
                  <li>Pulsa <strong>Añadir a pantalla de inicio</strong> o <strong>Instalar app</strong>.</li>
                  <li>Confirma en el diálogo y espera a que se cree el icono.</li>
                </ol>
              </details>
            </div>

            <p className="mt-4 text-sm text-[var(--app-muted)]">
              Consejo: al abrirla desde el icono, la verás a pantalla completa, sin barra de dirección, y se actualizará sola cuando publiquemos mejoras.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
