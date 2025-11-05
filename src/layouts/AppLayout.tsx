import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-600/40 to-pink-700/60 text-white">
      <header className="flex items-center justify-between border-b border-white/20 bg-pink-700/70 p-4">
        <button onClick={() => setOpen(v => !v)} className="block rounded bg-pink-900/60 px-3 py-2 hover:bg-pink-900/90 sm:hidden" aria-label="Toggle menu">☰</button>
        <h1 className="text-xl font-bold">Tu boda</h1>
        <nav className="hidden sm:block">
          <NavLink to="/" className={({isActive}) => `rounded px-3 py-2 ${isActive ? "bg-white text-black":"hover:bg-white/10"}`}>Inicio</NavLink>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-10 w-64 overflow-y-auto bg-pink-900/90 p-4 transition-transform duration-300 sm:static sm:translate-x-0 ${open ? "translate-x-0":"-translate-x-full"}`}>
          <nav className="p-4 space-y-2">
            <NavLink to="/" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Inicio</NavLink>
  
            {/* Grupo: Información */}
            <details className="group">
              <summary className="cursor-pointer rounded px-3 py-2 hover:bg-white/10 list-none select-none">Información</summary>
              <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                <NavLink to="/programa" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Programa</NavLink>
                <NavLink to="/info/alojamientos" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Alojamientos</NavLink>
                <NavLink to="/info/desplazamientos" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Desplazamientos</NavLink>
                <NavLink to="/countdown" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Cuenta atrás</NavLink>
                <NavLink to="/contacto" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Contacto</NavLink>
              </div>
            </details>
  
            {/* Grupo: Participación */}
            <details className="group">
              <summary className="cursor-pointer rounded px-3 py-2 hover:bg-white/10 list-none select-none">Participación</summary>
              <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                <NavLink to="/asistencia" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Confirmar asistencia</NavLink>
                <NavLink to="/participa/mesas" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Mesas</NavLink>
                <NavLink to="/galeria" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Subir fotos</NavLink>
              </div>
            </details>
  
            {/* Grupo: Organización (novios) */}
            <details className="group">
              <summary className="cursor-pointer rounded px-3 py-2 hover:bg-white/10 list-none select-none">Organización</summary>
              <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                <NavLink to="/organiza/personalizacion" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Personalización</NavLink>
                <NavLink to="/organiza/checklist" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Checklist</NavLink>
                <NavLink to="/organiza/agenda" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Agenda</NavLink>
                <NavLink to="/organiza/invitados" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Invitados</NavLink>
                <NavLink to="/organiza/presupuesto" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Presupuesto</NavLink>
                <NavLink to="/organiza/archivos" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Archivos</NavLink>
                <NavLink to="/organiza/ajustes" onClick={close} className={({isActive}) => `block rounded px-3 py-2 ${isActive?"bg-white text-black":"hover:bg-white/10"}`}>Ajustes</NavLink>
              </div>
            </details>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}