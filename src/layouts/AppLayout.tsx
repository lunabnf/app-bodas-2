import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventSitePaths } from "../eventSite/paths";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link ${isActive ? "app-nav-link-active" : ""}`;

  return (
    <div className="app-shell">
      <Navbar />

      <div className="relative flex flex-1 overflow-hidden pt-18">
        <button
          onClick={() => setOpen(!open)}
          className="fixed left-4 top-21 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.9)] text-[var(--app-ink)] shadow-[var(--app-shadow-soft)] sm:hidden"
          aria-label="Abrir menú lateral"
        >
          {open ? "✕" : "☰"}
        </button>
        <aside
          className={`app-sidebar fixed inset-y-0 left-0 z-20 mt-18 w-72 overflow-y-auto px-4 py-5 shadow-[var(--app-shadow)] transition-all duration-300 sm:sticky sm:top-18 sm:mt-0 sm:h-[calc(100vh-4.5rem)] sm:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="app-surface-soft p-4 space-y-3">
            <NavLink
              to={eventSitePaths.home}
              onClick={close}
              className={linkClass}
            >
              Inicio
            </NavLink>

            <details className="group rounded-[20px] border border-[var(--app-line)] bg-[rgba(248,247,243,0.72)] px-2 py-2">
              <summary className="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-[var(--app-ink)] select-none">
                Información
              </summary>
              <div className="ml-2 mt-2 space-y-1 border-l border-[var(--app-line)] pl-3">
                <NavLink
                  to={eventSitePaths.programa}
                  onClick={close}
                  className={linkClass}
                >
                  Programa
                </NavLink>
                <NavLink
                  to={eventSitePaths.alojamientos}
                  onClick={close}
                  className={linkClass}
                >
                  Alojamiento
                </NavLink>
                <NavLink
                  to={eventSitePaths.desplazamientos}
                  onClick={close}
                  className={linkClass}
                >
                  Desplazamiento
                </NavLink>
                <NavLink
                  to={eventSitePaths.countdown}
                  onClick={close}
                  className={linkClass}
                >
                  Cuenta atrás
                </NavLink>
                <NavLink
                  to={eventSitePaths.contacto}
                  onClick={close}
                  className={linkClass}
                >
                  Contacto
                </NavLink>
              </div>
            </details>

            <details className="group rounded-[20px] border border-[var(--app-line)] bg-[rgba(248,247,243,0.72)] px-2 py-2">
              <summary className="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-[var(--app-ink)] select-none">
                Participación
              </summary>
              <div className="ml-2 mt-2 space-y-1 border-l border-[var(--app-line)] pl-3">
                <NavLink
                  to={eventSitePaths.participaConfirmacion}
                  onClick={close}
                  className={linkClass}
                >
                  Confirmar asistencia
                </NavLink>
                <NavLink
                  to={eventSitePaths.participaMesas}
                  onClick={close}
                  className={linkClass}
                >
                  Mesas
                </NavLink>
                <NavLink
                  to={eventSitePaths.participaAsientos}
                  onClick={close}
                  className={linkClass}
                >
                  Asientos ceremonia
                </NavLink>
                <NavLink
                  to={eventSitePaths.participaMusica}
                  onClick={close}
                  className={linkClass}
                >
                  Música
                </NavLink>
                <NavLink
                  to={eventSitePaths.participaChat}
                  onClick={close}
                  className={linkClass}
                >
                  Chat
                </NavLink>
                <NavLink
                  to={eventSitePaths.participaFotos}
                  onClick={close}
                  className={linkClass}
                >
                  Subir fotos
                </NavLink>
              </div>
            </details>
          </nav>
        </aside>

        <main className="app-main relative flex-1 px-4 pb-8 pt-6 sm:px-8">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
