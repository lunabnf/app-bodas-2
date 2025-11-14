import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-black/80 text-white">
      <aside className="w-60 bg-black/60 border-r border-white/10 p-4 space-y-4">
        <Link
          to="/"
          className="block mb-4 text-sm text-pink-300 hover:text-pink-400 transition-colors"
        >
          ← Volver a la web
        </Link>
        <h1 className="text-xl font-semibold text-pink-400 mb-4">Panel de Novios</h1>
        <nav className="flex flex-col space-y-2">
          <Link to="/admin/resumen">Resumen</Link>
          <Link to="/admin/invitados">Invitados</Link>
          <Link to="/admin/mesas">Mesas</Link>
          <Link to="/admin/ceremonia">Ceremonia</Link>
          <Link to="/admin/programa">Programa</Link>
          <Link to="/admin/presupuesto">Presupuesto</Link>
          <Link to="/admin/checklist">Checklist</Link>
          <Link to="/admin/agenda">Agenda</Link>
          <Link to="/admin/archivos">Archivos</Link>
          <Link to="/admin/ajustes">Ajustes</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}