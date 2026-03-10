import { NavLink, Outlet } from "react-router-dom";

function linkClass({ isActive }: { isActive: boolean }) {
  return `app-nav-link whitespace-nowrap ${isActive ? "app-nav-link-active" : ""}`;
}

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--app-line)] bg-[rgba(248,247,243,0.82)] backdrop-blur-[18px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-muted)]">
              Wedding SaaS
            </p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.03em]">Momentos Unicos</p>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" end className={linkClass}>
              Inicio
            </NavLink>
            <NavLink to="/demo" className={linkClass}>
              Demo
            </NavLink>
            <NavLink to="/pricing" className={linkClass}>
              Planes
            </NavLink>
            <NavLink to="/acceso" className="app-button-primary">
              Empezar
            </NavLink>
          </nav>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4 sm:px-8 md:hidden">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/demo" className={linkClass}>
            Demo
          </NavLink>
          <NavLink to="/pricing" className={linkClass}>
            Planes
          </NavLink>
          <NavLink to="/acceso" className="app-button-primary">
            Empezar
          </NavLink>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-[var(--app-line)] bg-[rgba(255,255,255,0.52)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-[var(--app-muted)] sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>Plataforma de bodas en evolución: marketing, onboarding y evento separados.</p>
          <div className="flex flex-wrap gap-4">
            <NavLink to="/" className="hover:text-[var(--app-ink)]">
              Inicio
            </NavLink>
            <NavLink to="/demo" className="hover:text-[var(--app-ink)]">
              Demo
            </NavLink>
            <NavLink to="/pricing" className="hover:text-[var(--app-ink)]">
              Planes
            </NavLink>
            <NavLink to="/acceso" className="hover:text-[var(--app-ink)]">
              Acceso
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
