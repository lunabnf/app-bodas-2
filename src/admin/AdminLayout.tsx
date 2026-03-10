import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { useAuth } from "../store/useAuth";
import { getOwnerEventContext } from "../services/ownerEventContextService";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const esOwner = useAuth((state) => state.esOwner);
  const ownerEventContext = getOwnerEventContext();

  return (
    <div className="app-admin-shell flex text-[var(--app-ink)]">
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.92)] text-lg text-[var(--app-ink)] shadow-[var(--app-shadow-soft)] lg:hidden"
        aria-label="Abrir menú del panel"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div
        className={`fixed inset-0 z-20 bg-[rgba(24,24,23,0.18)] backdrop-blur-[2px] transition-opacity lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
      />

      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-30 h-screen w-72 shrink-0 overflow-y-auto px-5 py-6 space-y-5 shadow-[var(--app-shadow)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to={eventSitePaths.home}
          onClick={closeMenu}
          className="app-button-secondary inline-flex"
        >
          Web del evento
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link to="/acceso" onClick={closeMenu} className="app-button-secondary inline-flex">
            Acceso
          </Link>
        </div>
        {esOwner ? (
          <Link
            to="/owner"
            onClick={closeMenu}
            className="app-button-secondary inline-flex"
          >
            Volver a Owner
          </Link>
        ) : null}
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
          <Link className="app-admin-link" to="/admin/invitados" onClick={closeMenu}>Invitados</Link>
          <Link className="app-admin-link" to="/admin/mesas" onClick={closeMenu}>Mesas</Link>
          <Link className="app-admin-link" to="/admin/ceremonia" onClick={closeMenu}>Ceremonia</Link>
          <Link className="app-admin-link" to="/admin/programa" onClick={closeMenu}>Programa</Link>
          <Link className="app-admin-link" to="/admin/alojamiento" onClick={closeMenu}>Alojamiento</Link>
          <Link className="app-admin-link" to="/admin/desplazamiento" onClick={closeMenu}>Desplazamiento</Link>
          <Link className="app-admin-link" to="/admin/chat" onClick={closeMenu}>Chat</Link>

          <h2 className="app-section-title mt-4 mb-1">Solo Novios</h2>
          <Link className="app-admin-link" to="/admin/actividad" onClick={closeMenu}>Actividad</Link>
          <Link className="app-admin-link" to="/admin/resumen" onClick={closeMenu}>Resumen</Link>
          <Link className="app-admin-link" to="/admin/presupuesto" onClick={closeMenu}>Presupuesto</Link>
          <Link className="app-admin-link" to="/admin/checklist" onClick={closeMenu}>Checklist</Link>
          <Link className="app-admin-link" to="/admin/agenda" onClick={closeMenu}>Agenda</Link>
          <Link className="app-admin-link" to="/admin/archivos" onClick={closeMenu}>Archivos</Link>
          <Link className="app-admin-link" to="/admin/ajustes" onClick={closeMenu}>Ajustes</Link>
        </nav>
      </aside>

      <main className="app-admin-main flex-1 px-4 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-24 lg:px-10 lg:py-8">
        <div className="app-admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
