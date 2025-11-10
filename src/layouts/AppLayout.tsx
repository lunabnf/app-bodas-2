import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div
      className="relative flex min-h-screen flex-col text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-disco.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <header className="flex items-center justify-between border-b border-white/20 bg-black/60 backdrop-blur-md p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="block rounded bg-white/10 px-3 py-2 hover:bg-white/20 sm:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className="text-xl font-bold tracking-wide">Tu Boda</h1>
        <nav className="hidden sm:block">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded px-3 py-2 ${
                isActive ? "bg-white text-black" : "hover:bg-white/10"
              }`
            }
          >
            Inicio
          </NavLink>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`fixed inset-y-0 left-0 z-10 w-64 overflow-y-auto bg-black/70 backdrop-blur-md p-4 transition-transform duration-300 sm:static sm:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-2">
            <NavLink
              to="/"
              onClick={close}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${
                  isActive ? "bg-white text-black" : "hover:bg-white/10"
                }`
              }
            >
              Inicio
            </NavLink>

            {/* Información */}
            <details className="group">
              <summary className="cursor-pointer rounded px-3 py-2 hover:bg-white/10 select-none">
                Información
              </summary>
              <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                <NavLink
                  to="/programa"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Programa
                </NavLink>
                <NavLink
                  to="/info/alojamientos"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Alojamientos
                </NavLink>
                <NavLink
                  to="/info/desplazamientos"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Desplazamientos
                </NavLink>
                <NavLink
                  to="/countdown"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Cuenta atrás
                </NavLink>
                <NavLink
                  to="/contacto"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Contacto
                </NavLink>
              </div>
            </details>

            {/* Participación */}
            <details className="group">
              <summary className="cursor-pointer rounded px-3 py-2 hover:bg-white/10 select-none">
                Participación
              </summary>
              <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                <NavLink
                  to="/asistencia"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Confirmar asistencia
                </NavLink>
                <NavLink
                  to="/participa/mesas"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Mesas
                </NavLink>
                <NavLink
                  to="/galeria"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Subir fotos
                </NavLink>
              </div>
            </details>

            {/* Organización */}
            <details className="group">
              <summary className="cursor-pointer rounded px-3 py-2 hover:bg-white/10 select-none">
                Organización
              </summary>
              <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                <NavLink
                  to="/organiza/personalizacion"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Personalización
                </NavLink>
                <NavLink
                  to="/organiza/checklist"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Checklist
                </NavLink>
                <NavLink
                  to="/organiza/agenda"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Agenda
                </NavLink>
                <NavLink
                  to="/organiza/invitados"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Invitados
                </NavLink>
                <NavLink
                  to="/organiza/presupuesto"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Presupuesto
                </NavLink>
                <NavLink
                  to="/organiza/archivos"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Archivos
                </NavLink>
                <NavLink
                  to="/organiza/ajustes"
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-white text-black" : "hover:bg-white/10"
                    }`
                  }
                >
                  Ajustes
                </NavLink>
              </div>
            </details>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto bg-black/50 backdrop-blur-sm p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}