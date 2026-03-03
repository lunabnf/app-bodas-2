import { Link } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { useAuth } from "../store/useAuth";

export default function Home() {
  const esAdmin = useAuth((state) => state.esAdmin);
  const invitado = useAuth((state) => state.invitado);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Wedding OS</p>
          <h1 className="app-title mt-4">
            La forma más clara de organizar una boda con calma.
          </h1>
          <p className="app-subtitle mt-6 max-w-3xl">
            Una web app para que novios e invitados compartan toda la información importante en un
            mismo espacio, con una experiencia limpia, serena y fácil de seguir.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={esAdmin ? "/admin/resumen" : invitado ? eventSitePaths.participaConfirmacion : "/login"}
              className="app-button-primary text-center"
            >
              {esAdmin ? "Ir al panel de novios" : invitado ? "Entrar en mi panel" : "Acceder"}
            </Link>
            {!esAdmin && !invitado ? (
              <Link
                to={eventSitePaths.participaConfirmacion}
                className="app-button-secondary text-center"
              >
                Ver zona de invitados
              </Link>
            ) : null}
          </div>
        </div>

        <div className="app-grid-cards">
          <article className="app-surface-soft p-7">
            <p className="app-kicker">Qué resuelve</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--app-ink)]">
              Todo el evento en una interfaz ordenada y premium.
            </p>
            <p className="mt-4 app-prose">
              Invitaciones, RSVP, logística, música, mesas y actividad centralizada para que los
              novios tengan control y los invitados sólo vean lo que necesitan.
            </p>
          </article>
          <article className="app-surface-soft p-7">
            <p className="app-kicker">Estado</p>
            <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">01</p>
            <p className="mt-3 app-prose">
              La app ya está tomando una dirección visual minimalista, limpia y más consistente con
              un producto premium.
            </p>
          </article>
        </div>
      </div>

      <div className="mt-6 app-surface p-8 sm:p-12">
        <div className="max-w-4xl space-y-6">
          <h2 className="app-section-heading !text-[calc(var(--app-section-title-size)*1.5)]">
            Una historia real convertida en producto útil.
          </h2>
          <p className="app-subtitle">
          Esta aplicación nació de una historia muy especial. En 2017 presenté a dos amigos que,
          con el paso del tiempo, se enamoraron y acabaron casándose en 2025. Quise ayudarles a que
          todo lo relacionado con su boda fuese más sencillo, organizado y bonito. El objetivo era
          que pudieran disfrutar del proceso sin tanto estrés, dedicando más tiempo a compartir
          momentos con los suyos y menos a los preparativos, para que así todo saliera perfecto.
          </p>
          <p className="app-subtitle">
          Más adelante aquí se explicará cómo funciona la página, cómo crear tu propia webapp de boda
          y cómo aprovechar todas las herramientas que ofrece esta aplicación.
          </p>
        </div>

        <div className="mt-10 text-left space-y-6">
          <h2 className="app-section-heading">
            Instalarla como WebApp
          </h2>

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
    </section>
  );
}
