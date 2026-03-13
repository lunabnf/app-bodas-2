import { NavLink, Outlet } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../store/useAuth";

function linkClass({ isActive }: { isActive: boolean }) {
  return `app-nav-link ${isActive ? "app-nav-link-active" : ""}`;
}

export default function BackofficeLayout() {
  const logout = useAuth((state) => state.logout);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="app-surface-soft p-4 sm:p-5">
          <div className="mb-5">
            <BrandMark variant="main" className="h-9 w-auto" />
            <p className="mt-3 app-kicker">Backoffice</p>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Zona interna privada para gestión global de producto.
            </p>
          </div>

          <nav className="space-y-2">
            <NavLink to="/backoffice" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/backoffice/marketing" className={linkClass}>
              Marketing
            </NavLink>
            <NavLink to="/backoffice/pricing" className={linkClass}>
              Pricing
            </NavLink>
            <NavLink to="/backoffice/weddings" className={linkClass}>
              Weddings
            </NavLink>
            <NavLink to="/backoffice/content" className={linkClass}>
              Content
            </NavLink>
            <NavLink to="/backoffice/settings" className={linkClass}>
              Settings
            </NavLink>
          </nav>

          <div className="mt-5 border-t border-[var(--app-line)] pt-4">
            <button type="button" onClick={logout} className="app-button-secondary w-full text-center">
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="app-surface p-5 sm:p-6">
            <p className="app-kicker">Interno</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Panel Backoffice
            </h1>
          </div>
          <div className="app-surface-soft p-5 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
