import { Link, Outlet } from "react-router-dom";

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="app-surface p-6 sm:p-8">
          <p className="app-kicker">Owner</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Control Global</h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Panel principal del dueño de la app para gestionar marketing, clientes y operaciones.
          </p>
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="app-button-secondary inline-flex">
                Marketing
              </Link>
              <Link to="/buscar-boda" className="app-button-secondary inline-flex">
                Acceso
              </Link>
            </div>
          </div>
        </header>
        <main className="app-surface-soft p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
