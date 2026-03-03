import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="app-admin-shell flex text-[var(--app-ink)]">
      <aside className="app-sidebar sticky top-0 z-20 h-screen w-72 shrink-0 overflow-y-auto px-5 py-6 space-y-5">
        <Link
          to="/"
          className="app-button-secondary inline-flex"
        >
          Volver a la web
        </Link>
        <div className="app-surface-soft p-5">
          <p className="app-kicker">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Panel de Novios</h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Configuración, seguimiento y control global de la boda.
          </p>
        </div>
        <nav className="app-surface-soft flex flex-col space-y-2 p-4">
          <h2 className="app-section-title mt-1 mb-1">Invitados</h2>
          <Link className="app-admin-link" to="/admin/invitados">Invitados</Link>
          <Link className="app-admin-link" to="/admin/mesas">Mesas</Link>
          <Link className="app-admin-link" to="/admin/ceremonia">Ceremonia</Link>
          <Link className="app-admin-link" to="/admin/programa">Programa</Link>
          <Link className="app-admin-link" to="/admin/alojamiento">Alojamiento</Link>
          <Link className="app-admin-link" to="/admin/desplazamiento">Desplazamiento</Link>
          <Link className="app-admin-link" to="/admin/chat">Chat</Link>

          <h2 className="app-section-title mt-4 mb-1">Solo Novios</h2>
          <Link className="app-admin-link" to="/admin/actividad">Actividad</Link>
          <Link className="app-admin-link" to="/admin/resumen">Resumen</Link>
          <Link className="app-admin-link" to="/admin/presupuesto">Presupuesto</Link>
          <Link className="app-admin-link" to="/admin/checklist">Checklist</Link>
          <Link className="app-admin-link" to="/admin/agenda">Agenda</Link>
          <Link className="app-admin-link" to="/admin/archivos">Archivos</Link>
          <Link className="app-admin-link" to="/admin/ajustes">Ajustes</Link>
        </nav>
      </aside>

      <main className="app-admin-main flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="app-admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
