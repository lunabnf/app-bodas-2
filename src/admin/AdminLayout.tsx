import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { getOwnerEventContext } from "../services/ownerEventContextService";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../store/useAuth";

const EVENT_MANAGEMENT_ITEMS = [
  { label: "Invitados", path: "invitados" },
  { label: "Mesas", path: "mesas" },
  { label: "Ceremonia", path: "ceremonia" },
  { label: "Programa", path: "programa" },
  { label: "Alojamientos", path: "alojamientos" },
  { label: "Desplazamientos", path: "desplazamientos" },
  { label: "Chat", path: "chat" },
  { label: "Música", path: "musica" },
] as const;

const COUPLE_ONLY_ITEMS = [
  { label: "Actividad", path: "actividad" },
  { label: "Gestión", path: "" },
  { label: "Presupuesto", path: "presupuesto" },
  { label: "Archivos", path: "archivos" },
  { label: "Ajustes", path: "ajustes" },
] as const;

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuth((state) => state.logout);
  const closeMenu = () => setMenuOpen(false);
  const { slug } = useParams();
  const ownerEventContext = getOwnerEventContext();
  const adminBasePath = slug ? `/w/${slug}/admin` : "/admin";
  const publicWeddingPath = slug ? `/w/${slug}` : eventSitePaths.home;
  const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
    `app-admin-link ${isActive ? "app-admin-link-active" : ""}`;

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  return (
    <div className="app-admin-shell text-[var(--app-ink)]">
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.92)] text-lg text-[var(--app-ink)] shadow-[var(--app-shadow-soft)] md:hidden"
        aria-label="Abrir menú del panel"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div
        className={`fixed inset-0 z-20 bg-[rgba(24,24,23,0.18)] backdrop-blur-[2px] transition-opacity md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
      />

      <div className="mx-auto w-full max-w-[1680px] md:grid md:grid-cols-[20rem_minmax(0,1fr)] md:items-start">
        <aside
          className={`app-sidebar fixed inset-y-0 left-0 z-30 h-screen w-72 shrink-0 overflow-y-auto px-4 py-6 shadow-[var(--app-shadow)] transition-transform duration-300 md:sticky md:top-0 md:h-screen md:w-full md:translate-x-0 md:px-5 md:shadow-none ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-4">
            <Link to="/" onClick={closeMenu} className="inline-flex items-center rounded-xl px-1 py-1">
              <BrandMark variant="main" className="h-8 w-auto" />
            </Link>

            <div className="app-surface-soft p-5">
              <p className="app-kicker">Panel de novios</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Gestión del evento</h1>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Controla invitados, logística y decisiones privadas desde un único espacio.
              </p>
              {ownerEventContext ? (
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--app-muted)]">
                  Evento activo: {ownerEventContext.coupleLabel}
                </p>
              ) : null}
            </div>

            <nav className="space-y-4">
              <section className="app-admin-nav-section">
                <div className="px-1">
                  <h2 className="app-section-title">Gestión del evento</h2>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">Todo lo que impacta a la experiencia del invitado.</p>
                </div>
                <div className="app-surface-soft space-y-1 p-3">
                  {EVENT_MANAGEMENT_ITEMS.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path ? `${adminBasePath}/${item.path}` : adminBasePath}
                      onClick={closeMenu}
                      className={adminLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </section>

              <section className="app-admin-nav-section">
                <div className="px-1">
                  <h2 className="app-section-title">Solo novios</h2>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">Visión privada, organización interna y control económico.</p>
                </div>
                <div className="app-surface-soft space-y-1 p-3">
                  {COUPLE_ONLY_ITEMS.map((item) => (
                    <NavLink
                      key={item.label}
                      end={item.path === ""}
                      to={item.path ? `${adminBasePath}/${item.path}` : adminBasePath}
                      onClick={closeMenu}
                      className={adminLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </section>

              <section className="app-admin-nav-section">
                <div className="px-1">
                  <h2 className="app-section-title">Acciones generales</h2>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">Cambiar de vista o salir del panel.</p>
                </div>
                <div className="app-surface-soft space-y-2 p-3">
                  <Link
                    to={publicWeddingPath}
                    onClick={closeMenu}
                    className="app-admin-action"
                  >
                    Ver zona invitados
                  </Link>
                  <button type="button" onClick={handleLogout} className="app-admin-action w-full text-left">
                    Salir
                  </button>
                </div>
              </section>
            </nav>
          </div>
        </aside>

        <main className="app-admin-main min-w-0 px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 md:px-6 md:py-8 lg:px-8">
          <div className="app-admin-content">
            <div className="app-surface-soft mb-4 flex flex-wrap items-center gap-2 p-3 md:hidden">
              <Link to={publicWeddingPath} className="app-button-secondary inline-flex" onClick={closeMenu}>
                Ver zona invitados
              </Link>
              <button type="button" onClick={handleLogout} className="app-button-secondary inline-flex">
                Salir
              </button>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
