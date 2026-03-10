import { Link, useSearchParams } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";

export default function MarketingDemo() {
  const [params] = useSearchParams();
  const plan = params.get("plan") === "premium" ? "premium" : params.get("plan") === "pro" ? "pro" : "free";
  const planLabel = plan === "premium" ? "Premium" : plan === "pro" ? "Completo" : "Esencial";
  const capabilities =
    plan === "premium"
      ? ["Todo activado", "Personalización avanzada", "Acompañamiento prioritario"]
      : plan === "pro"
        ? ["RSVP, mesas y programa", "Logística", "Música, chat y fotos"]
        : ["RSVP", "Mesas", "Programa", "Panel básico"];

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Demo</p>
          <h1 className="app-page-title mt-4">Recorre una boda de ejemplo antes de contratar.</h1>
          <p className="mt-5 app-subtitle max-w-3xl">
            La demo os permite ver la experiencia completa: portada del evento, programa,
            confirmación de asistencia, logística, música, chat y panel de novios.
          </p>
          <p className="mt-4 text-sm text-[var(--app-muted)]">
            Simulación actual: plan <strong>{planLabel}</strong>.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--app-muted)]">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={eventSitePaths.home} className="app-button-primary text-center">
              Abrir boda demo
            </Link>
            <Link to="/pricing" className="app-button-secondary text-center">
              Ver planes
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="app-surface-soft p-7">
            <p className="app-kicker">Invitados</p>
            <h2 className="mt-3 text-xl font-semibold">Acceso simple y guiado</h2>
            <p className="mt-3 app-prose">
              Los invitados entran por token, responden RSVP y consultan sólo lo necesario.
            </p>
          </article>
          <article className="app-surface-soft p-7">
            <p className="app-kicker">Novios</p>
            <h2 className="mt-3 text-xl font-semibold">Panel centralizado</h2>
            <p className="mt-3 app-prose">
              Invitados, actividad, mesas, logística, archivos y ajustes en un mismo sistema.
            </p>
          </article>
          <article className="app-surface-soft p-7">
            <p className="app-kicker">Producto</p>
            <h2 className="mt-3 text-xl font-semibold">Base preparada para escalar</h2>
            <p className="mt-3 app-prose">
              La demo actual servirá como plantilla para futuros eventos independientes.
            </p>
          </article>
        </div>

        <section className="app-surface p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-kicker">Siguiente paso</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Si la experiencia encaja, revisa los planes y prepara el alta.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="app-button-secondary text-center">
                Volver al inicio
              </Link>
              <Link to={`/crear-evento?plan=${plan}`} className="app-button-primary text-center">
                Crear mi evento con este plan
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
