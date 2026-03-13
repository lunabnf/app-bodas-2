import { NavLink, Outlet } from "react-router-dom";
import BrandMark from "../components/BrandMark";

function linkClass({ isActive }: { isActive: boolean }) {
  return `app-nav-link shrink-0 whitespace-nowrap text-sm sm:text-base`;
}

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--app-line)] bg-[rgba(248,247,243,0.82)] backdrop-blur-[18px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="inline-flex items-center rounded-xl px-1 py-1">
            <BrandMark variant="main" className="h-9 w-auto sm:h-10" />
          </NavLink>

          <nav className="hidden items-center gap-2 lg:flex">
            <NavLink to="/" end className={linkClass}>
              Inicio
            </NavLink>
            <NavLink to="/pricing" className={linkClass}>
              Planes
            </NavLink>
            <NavLink to="/buscar-boda" className="app-button-primary">
              Entrar
            </NavLink>
          </nav>
        </div>
        <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:hidden">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/pricing" className={linkClass}>
            Planes
          </NavLink>
          <NavLink to="/buscar-boda" className="app-button-primary">
            Entrar
          </NavLink>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-[var(--app-line)] bg-[rgba(255,255,255,0.52)]">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-[var(--app-muted)] sm:px-8">
          <p>Plataforma de bodas en evolución: marketing, onboarding y evento separados.</p>
        </div>
      </footer>
    </div>
  );
}
