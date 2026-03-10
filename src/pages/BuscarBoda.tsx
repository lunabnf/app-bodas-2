import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { searchWeddings } from "../data/weddingsMock";

export default function BuscarBoda() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchWeddings(query), [query]);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <div className="mb-5">
            <Link to="/" className="app-button-secondary inline-flex">
              Inicio
            </Link>
          </div>
          <p className="app-kicker">Buscar Boda</p>
          <h1 className="app-page-title mt-4">Encuentra tu boda para acceder.</h1>
          <p className="mt-4 app-subtitle max-w-3xl">
            Busca por nombre, slug o código de referencia y entra directamente en tu boda.
          </p>
          <input
            className="mt-6 w-full p-3 text-base"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ejemplo: garcia-lopez o GL-2026"
          />
        </div>

        <div className="grid gap-4">
          {results.map((wedding) => (
            <article key={wedding.id} className="app-surface-soft p-5 sm:p-6">
              <h2 className="text-xl font-semibold">{wedding.nombre}</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                slug: /w/{wedding.slug} · código: {wedding.codigo}
              </p>
              <div className="mt-4">
                <Link to={`/w/${wedding.slug}`} className="app-button-primary inline-flex">
                  Entrar en esta boda
                </Link>
              </div>
            </article>
          ))}
          {results.length === 0 ? (
            <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
              No encontramos bodas con esa búsqueda.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
