import { Link, useParams } from "react-router-dom";
import { getWeddingBySlug } from "../data/weddingsMock";

export default function WeddingAccess() {
  const { slug } = useParams();
  const wedding = slug ? getWeddingBySlug(slug) : null;

  if (!wedding) {
    return (
      <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
        <section className="mx-auto max-w-3xl app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso</p>
          <h1 className="app-page-title mt-4">Boda no encontrada</h1>
          <p className="mt-4 text-[var(--app-muted)]">
            No existe ninguna boda con ese identificador.
          </p>
          <div className="mt-6">
            <Link to="/buscar-boda" className="app-button-primary inline-flex">
              Volver a buscar
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso a Boda</p>
          <h1 className="app-page-title mt-4">{wedding.nombre}</h1>
          <p className="mt-4 text-sm text-[var(--app-muted)]">
            slug: /w/{wedding.slug} · código: {wedding.codigo}
          </p>
        </div>

        <div className="app-surface-soft p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to={`/w/${wedding.slug}/rsvp`} className="app-button-primary text-center">
              Entrar como invitado
            </Link>
            <Link to={`/w/${wedding.slug}/admin`} className="app-button-secondary text-center">
              Entrar como administrador
            </Link>
          </div>
          <div className="mt-4">
            <Link to="/buscar-boda" className="text-sm font-semibold text-[var(--app-ink)]">
              Buscar otra boda
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
