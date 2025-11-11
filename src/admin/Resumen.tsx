import { Link } from "react-router-dom";

export default function Resumen() {
  return (
    <div className="min-h-screen bg-black/40 text-white p-6 backdrop-blur-md">
      <h1 className="text-3xl font-bold text-pink-400 mb-8">Resumen general de la boda</h1>

      {/* Estado general */}
      <Link to="/admin/resumen" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Estado general</h2>
        <p className="text-sm text-white/70">Progreso global: 72% · Todo bajo control · 12 días para la boda</p>
        <div className="mt-4 h-3 w-full bg-white/20 rounded-full">
          <div className="h-3 bg-pink-400 rounded-full w-[72%]" />
        </div>
      </Link>

      {/* Invitados */}
      <Link to="/admin/invitados" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Invitados</h2>
        <p className="text-sm text-white/70">Confirmados: 82 · Pendientes: 14 · Rechazados: 3</p>
        <p className="text-sm text-white/70 mt-1">Adultos: 76 · Niños: 23 · Alergias: 7</p>
      </Link>

      {/* Mesas y asientos */}
      <Link to="/admin/mesas" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Mesas y asientos</h2>
        <p className="text-sm text-white/70">Mesas creadas: 12 / 15 necesarias</p>
        <p className="text-sm text-white/70 mt-1">Invitados asignados: 95 / 110</p>
      </Link>

      {/* Ceremonia */}
      <Link to="/admin/ceremonia" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Ceremonia</h2>
        <p className="text-sm text-white/70">Asientos confirmados: 87 / 110</p>
        <p className="text-sm text-white/70 mt-1">Faltan 23 confirmaciones.</p>
      </Link>

      {/* Logística */}
      <Link to="/admin/logistica" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Logística</h2>
        <p className="text-sm text-white/70">Alojamientos confirmados: 45 / 50</p>
        <p className="text-sm text-white/70 mt-1">Transportes organizados: 3 autobuses y 2 coches.</p>
      </Link>

      {/* Checklist y agenda */}
      <Link to="/admin/checklist" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Checklist y agenda</h2>
        <p className="text-sm text-white/70">Tareas completadas: 24 / 30 (80%)</p>
        <ul className="list-disc list-inside text-sm text-white/60 mt-2">
          <li>Confirmar fotógrafo (mañana)</li>
          <li>Prueba de menú (jueves)</li>
          <li>Enviar lista final de mesas (sábado)</li>
        </ul>
      </Link>

      {/* Presupuesto */}
      <Link to="/admin/presupuesto" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Presupuesto</h2>
        <p className="text-sm text-white/70">Total estimado: 23.000 € · Gastado: 18.700 € · Restante: 4.300 €</p>
      </Link>

      {/* Mensajes y canciones */}
      <Link to="/admin/mensajes" className="block mb-8 bg-white/10 p-6 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <h2 className="text-xl font-semibold mb-2">Mensajes y canciones</h2>
        <p className="text-sm text-white/70">Canciones más votadas: “Vivir así es morir de amor”, “Eros Ramazzotti – Fuego en el fuego”.</p>
        <p className="text-sm text-white/70 mt-1">Mensajes recientes: “¡Qué ganas de que llegue el día!”</p>
      </Link>

      {/* Cierre motivacional */}
      <section className="bg-pink-400/20 border border-pink-400/30 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-pink-300 mb-2">Todo listo para el gran día</h2>
        <p className="text-white/80">Vuestra boda está al 82% completada. Relajaos y disfrutad — el amor ya está organizado.</p>
      </section>
    </div>
  );
}