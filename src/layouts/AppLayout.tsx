import { NavLink, Outlet, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { buildEventSitePaths } from "../eventSite/paths";

export default function AppLayout() {
  const { slug } = useParams();
  const paths = buildEventSitePaths(slug);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link ${isActive ? "app-nav-link-active" : ""}`;

  return (
    <div className="app-shell">
      <Navbar />

      <div className="relative flex min-h-screen flex-1 pt-[4.5rem]">
        <aside className="app-sidebar sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-[18rem] shrink-0 overflow-y-auto px-4 py-5 md:block">
          <nav className="app-surface-soft p-4 space-y-3">
            <NavLink
              to={paths.home}
              className={linkClass}
            >
              Inicio
            </NavLink>

            <NavLink
              to={paths.miResumen}
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
                  className={linkClass}
                >
                  Programa
                </NavLink>
                <NavLink
                  to={paths.alojamientos}
                  className={linkClass}
                >
                  Alojamiento
                </NavLink>
                <NavLink
                  to={paths.desplazamientos}
                  className={linkClass}
                >
                  Desplazamiento
                </NavLink>
                <NavLink
                  to={paths.countdown}
                  className={linkClass}
                >
                  Cuenta atrás
                </NavLink>
                <NavLink
                  to={paths.contacto}
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
                  className={linkClass}
                >
                  Confirmar asistencia
                </NavLink>
                <NavLink
                  to={paths.participaMesas}
                  className={linkClass}
                >
                  Mesas
                </NavLink>
                <NavLink
                  to={paths.participaMusica}
                  className={linkClass}
                >
                  Música
                </NavLink>
                <NavLink
                  to={paths.participaChat}
                  className={linkClass}
                >
                  Chat
                </NavLink>
                <NavLink
                  to={paths.participaFotos}
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
