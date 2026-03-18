import { useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { buildEventSitePaths } from "../eventSite/paths";

export default function AppLayout() {
  const { slug } = useParams();
  const paths = buildEventSitePaths(slug);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link ${isActive ? "app-nav-link-active" : ""}`;

  return (
    <div className="app-shell">
      <Navbar />

      <div className="relative flex min-h-screen flex-1 pt-[4.5rem]">
        <button
          onClick={() => setOpen(!open)}
          className="fixed left-4 top-[5.25rem] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.9)] text-[var(--app-ink)] shadow-[var(--app-shadow-soft)] md:hidden"
          aria-label="Abrir menú lateral"
        >
          {open ? "✕" : "☰"}
        </button>
        <div
          className={`fixed inset-0 z-10 bg-[rgba(24,24,23,0.2)] backdrop-blur-[1px] transition-opacity md:hidden ${
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={close}
        />
        <aside
          className={`app-sidebar fixed inset-y-0 left-0 z-20 mt-[4.5rem] w-72 overflow-y-auto px-4 py-5 shadow-[var(--app-shadow)] transition-transform duration-300 md:sticky md:top-[4.5rem] md:mt-0 md:h-[calc(100vh-4.5rem)] md:w-[18rem] md:translate-x-0 md:shadow-none ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="app-surface-soft p-4 space-y-3">
            <NavLink
              to={paths.home}
              onClick={close}
              className={linkClass}
            >
              Inicio
            </NavLink>

            <NavLink
              to={paths.miResumen}
              onClick={close}
              className={linkClass}
            >
              Mi resumen
            </NavLink>

            <details className="group rounded-[20px] border border-[var(--app-line)] bg-[rgba(248,247,243,0.72)] px-2 py-2">
              <summary className="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-[var(--app-ink)] select-none">
                Información
              </summary>
              <div className="ml-2 mt-2 space-y-1 border-l border-[var(--app-line)] pl-3">
                <NavLink
                  to={paths.programa}
                  onClick={close}
                  className={linkClass}
                >
                  Programa
                </NavLink>
                <NavLink
                  to={paths.alojamientos}
                  onClick={close}
                  className={linkClass}
                >
                  Alojamiento
                </NavLink>
                <NavLink
                  to={paths.desplazamientos}
                  onClick={close}
                  className={linkClass}
                >
                  Desplazamiento
                </NavLink>
                <NavLink
                  to={paths.countdown}
                  onClick={close}
                  className={linkClass}
                >
                  Cuenta atrás
                </NavLink>
                <NavLink
                  to={paths.contacto}
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
                  to={paths.participaConfirmacion}
                  onClick={close}
                  className={linkClass}
                >
                  Confirmar asistencia
                </NavLink>
                <NavLink
                  to={paths.participaMesas}
                  onClick={close}
                  className={linkClass}
                >
                  Mesas
                </NavLink>
                <NavLink
                  to={paths.participaAsientos}
                  onClick={close}
                  className={linkClass}
                >
                  Asientos ceremonia
                </NavLink>
                <NavLink
                  to={paths.participaMusica}
                  onClick={close}
                  className={linkClass}
                >
                  Música
                </NavLink>
                <NavLink
                  to={paths.participaChat}
                  onClick={close}
                  className={linkClass}
                >
                  Chat
                </NavLink>
                <NavLink
                  to={paths.participaFotos}
                  onClick={close}
                  className={linkClass}
                >
                  Subir fotos
                </NavLink>
              </div>
            </details>
          </nav>
        </aside>

        <main className="app-main relative min-w-0 flex-1 px-4 pb-8 pt-6 sm:px-6 md:px-8">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
