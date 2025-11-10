import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  // Simulación temporal de rol del usuario
  const user = { role: "admin" }; // Temporalmente admin para desarrollo

  return (
    <div
      className="relative flex min-h-screen flex-col text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-disco.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      {user.role === "admin" ? (
        <Navbar />
      ) : (
        <div className="fixed top-0 w-full z-40 bg-black/60 backdrop-blur-md text-center py-3 border-b border-white/10 text-pink-300 font-semibold tracking-wide">
          💍 Boda de Eric y Leticia
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="fixed top-20 left-4 z-30 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-md border border-white/10 sm:hidden"
          aria-label="Abrir menú lateral"
        >
          {open ? "✕" : "☰"}
        </button>
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 overflow-y-auto bg-black/80 backdrop-blur-md shadow-lg transition-all duration-300 sm:static sm:translate-x-0 mt-[64px] ${
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