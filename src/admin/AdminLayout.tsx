import { useState } from "react";
import { Outlet, Link, useParams } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { getOwnerEventContext } from "../services/ownerEventContextService";
import BrandMark from "../components/BrandMark";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const { slug } = useParams();
  const ownerEventContext = getOwnerEventContext();
  const adminBasePath = slug ? `/w/${slug}/admin` : "/admin";
  const publicWeddingPath = slug ? `/w/${slug}` : eventSitePaths.home;

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

      <div className="mx-auto w-full max-w-[1680px] md:grid md:grid-cols-[19rem_minmax(0,1fr)] md:items-start">
        <aside
          className={`app-sidebar fixed inset-y-0 left-0 z-30 h-screen w-72 shrink-0 overflow-y-auto px-4 py-6 space-y-5 shadow-[var(--app-shadow)] transition-transform duration-300 md:sticky md:top-0 md:h-screen md:w-full md:translate-x-0 md:px-5 md:shadow-none ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Link to="/" onClick={closeMenu} className="inline-flex items-center rounded-xl px-1 py-1">
            <BrandMark variant="main" className="h-8 w-auto" />
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              to={publicWeddingPath}
              onClick={closeMenu}
              className="app-button-secondary inline-flex"
            >
              Ver boda
            </Link>
            <Link to="/buscar-boda" onClick={closeMenu} className="app-button-secondary inline-flex">
              Buscar boda
            </Link>
          </div>
          <div className="app-surface-soft p-5">
            <p className="app-kicker">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Panel de Novios</h1>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Configuración, seguimiento y control global de la boda.
            </p>
            {ownerEventContext ? (
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--app-muted)]">
                Contexto: {ownerEventContext.coupleLabel}
              </p>
            ) : null}
          </div>
          <nav className="app-surface-soft flex flex-col space-y-2 p-4">
            <h2 className="app-section-title mt-1 mb-1">Invitados</h2>
            <Link className="app-admin-link" to={`${adminBasePath}/invitados`} onClick={closeMenu}>Invitados</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/mesas`} onClick={closeMenu}>Mesas</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/ceremonia`} onClick={closeMenu}>Ceremonia</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/programa`} onClick={closeMenu}>Programa</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/alojamientos`} onClick={closeMenu}>Alojamientos</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/desplazamientos`} onClick={closeMenu}>Desplazamientos</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/chat`} onClick={closeMenu}>Chat</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/musica`} onClick={closeMenu}>Música</Link>

            <h2 className="app-section-title mt-4 mb-1">Solo Novios</h2>
            <Link className="app-admin-link" to={adminBasePath} onClick={closeMenu}>Resumen</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/presupuesto`} onClick={closeMenu}>Presupuesto</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/ajustes`} onClick={closeMenu}>Ajustes</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/actividad`} onClick={closeMenu}>Actividad</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/checklist`} onClick={closeMenu}>Checklist</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/agenda`} onClick={closeMenu}>Agenda</Link>
            <Link className="app-admin-link" to={`${adminBasePath}/archivos`} onClick={closeMenu}>Archivos</Link>
          </nav>
        </aside>

        <main className="app-admin-main min-w-0 px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 md:px-6 md:py-8 lg:px-8">
          <div className="app-admin-content">
            <div className="app-surface-soft mb-4 flex flex-wrap items-center gap-2 p-3 md:hidden">
              <Link to={publicWeddingPath} className="app-button-secondary inline-flex">Ver boda</Link>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
