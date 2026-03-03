import { Link } from "react-router-dom";

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Wedding SaaS</p>
          <h1 className="app-title mt-4 max-w-4xl">
            Cread vuestra web de boda, gestionad invitados y organizad todo el evento desde un
            mismo sitio.
          </h1>
          <p className="app-subtitle mt-6 max-w-3xl">
            Una plataforma para registrar novios, activar su evento, compartir la web con los
            invitados y centralizar RSVP, logística, música, chat y fotos en una experiencia
            premium.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="app-button-primary text-center">
              Empezar ahora
            </Link>
            <Link to="/demo" className="app-button-secondary text-center">
              Ver demo de boda
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="app-surface-soft p-7">
            <p className="app-kicker">Producto</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              Landing comercial, onboarding de novios y web de evento separada.
            </h2>
            <p className="mt-4 app-prose">
              La idea es convertir la web actual de boda en la experiencia final del evento, y usar
              esta portada para captar clientes, enseñar la demo y activar nuevas bodas sin mezclar
              marketing con la experiencia de invitados.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/demo" className="app-button-secondary">
                Ver demo
              </Link>
              <Link to="/pricing" className="app-button-secondary">
                Ver planes
              </Link>
            </div>
          </article>

          <div className="app-grid-cards">
            <article className="app-surface-soft p-7">
              <p className="app-kicker">Demo</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Explora una boda ejemplo antes de contratar.
              </p>
              <p className="mt-4 app-prose">
                Programa, participación, login de invitados y panel de novios sobre una boda demo.
              </p>
              <div className="mt-5">
                <Link to="/demo" className="text-sm font-semibold text-[var(--app-ink)]">
                  Abrir demo
                </Link>
              </div>
            </article>
            <article className="app-surface-soft p-7">
              <p className="app-kicker">Escalado</p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Multi-evento</p>
              <p className="mt-3 app-prose">
                Cada boda tendrá su propio espacio, sus propios datos y su propia configuración.
              </p>
              <div className="mt-5">
                <Link to="/pricing" className="text-sm font-semibold text-[var(--app-ink)]">
                  Ver planes
                </Link>
              </div>
            </article>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="app-surface-soft p-7">
            <p className="app-kicker">1</p>
            <h2 className="mt-3 text-xl font-semibold">Descubrir el producto</h2>
            <p className="mt-3 app-prose">
              Landing comercial, demo realista y explicación clara del servicio.
            </p>
          </article>
          <article className="app-surface-soft p-7">
            <p className="app-kicker">2</p>
            <h2 className="mt-3 text-xl font-semibold">Activar la boda</h2>
            <p className="mt-3 app-prose">
              Registro de novios, pago y onboarding para crear el evento.
            </p>
          </article>
          <article className="app-surface-soft p-7">
            <p className="app-kicker">3</p>
            <h2 className="mt-3 text-xl font-semibold">Gestionar invitados</h2>
            <p className="mt-3 app-prose">
              Panel privado para novios y experiencia guiada para invitados.
            </p>
          </article>
        </section>

        <section className="app-surface p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-kicker">Recorrido</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Sigue el flujo: descubre la demo y revisa los planes.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/demo" className="app-button-secondary text-center">
                Siguiente: demo
              </Link>
              <Link to="/pricing" className="app-button-primary text-center">
                Ir a planes
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
