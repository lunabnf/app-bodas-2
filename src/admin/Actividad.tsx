import { useEffect, useState } from "react";
import {
  obtenerActividad,
  limpiarActividad,
  type EventoActividad,
} from "../services/actividadService";

export default function ActividadAdmin() {
  const [items, setItems] = useState<EventoActividad[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarActividad = async () => {
    setLoading(true);
    const data = await obtenerActividad();
    const ordenada = [...data].sort((a, b) => b.timestamp - a.timestamp);
    setItems(ordenada);
    setLoading(false);
  };

  useEffect(() => {
    void cargarActividad();
  }, []);

  const handleLimpiar = async () => {
    const confirmar = window.confirm(
      "¿Seguro que quieres borrar todo el historial de actividad?"
    );
    if (!confirmar) return;

    await limpiarActividad();
    await cargarActividad();
  };

  const formatFecha = (ts: number) =>
    new Date(ts).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="p-6 space-y-10 text-white">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Actividad</h1>
        <button
          type="button"
          onClick={handleLimpiar}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-red-50 hover:text-red-700"
        >
          Borrar historial
        </button>
      </div>

      {loading ? (
        <p className="text-sm opacity-60">Cargando actividad...</p>
      ) : items.length === 0 ? (
        <p className="text-sm opacity-60">Todavía no hay actividad registrada.</p>
      ) : (
        <>
          {/* =================== CONFIRMAR ASISTENCIA =================== */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Confirmación asistencia</h2>
            <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Invitado</th>
                    <th className="px-3 py-2">Acción</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((e) => e.tipo === "rsvp" || e.tipo.includes("confirmacion"))
                    .map((e) => (
                      <tr key={e.id} className="border-t border-white/10">
                        <td className="px-3 py-2">{e.tokenInvitado || "-"}</td>
                        <td className="px-3 py-2">{e.mensaje}</td>
                        <td className="px-3 py-2">{formatFecha(e.timestamp)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* =================== ALOJAMIENTOS =================== */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Alojamientos</h2>
            <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Invitado</th>
                    <th className="px-3 py-2">Acción</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((e) => e.tipo === "alojamiento")
                    .map((e) => (
                      <tr key={e.id} className="border-t border-white/10">
                        <td className="px-3 py-2">{e.tokenInvitado || "-"}</td>
                        <td className="px-3 py-2">{e.mensaje}</td>
                        <td className="px-3 py-2">{formatFecha(e.timestamp)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* =================== TRANSPORTE =================== */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Transporte</h2>
            <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Invitado</th>
                    <th className="px-3 py-2">Acción</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((e) => e.tipo === "transporte")
                    .map((e) => (
                      <tr key={e.id} className="border-t border-white/10">
                        <td className="px-3 py-2">{e.tokenInvitado || "-"}</td>
                        <td className="px-3 py-2">{e.mensaje}</td>
                        <td className="px-3 py-2">{formatFecha(e.timestamp)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* =================== MÚSICA =================== */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Música</h2>

            {/* Propuestas */}
            <h3 className="font-medium mt-4 mb-2">Propuestas</h3>
            <div className="overflow-auto rounded-lg border border-white/20 bg-white/5 mb-6">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Invitado</th>
                    <th className="px-3 py-2">Canción</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((e) => e.tipo === "musica_propuesta")
                    .map((e) => (
                      <tr key={e.id} className="border-t border-white/10">
                        <td className="px-3 py-2">{e.tokenInvitado || "-"}</td>
                        <td className="px-3 py-2">{e.mensaje}</td>
                        <td className="px-3 py-2">{formatFecha(e.timestamp)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Votos */}
            <h3 className="font-medium mt-4 mb-2">Votos</h3>
            <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-left">
                  <tr>
                    <th className="px-3 py-2">Invitado</th>
                    <th className="px-3 py-2">Canción</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((e) => e.tipo === "musica_voto")
                    .map((e) => (
                      <tr key={e.id} className="border-t border-white/10">
                        <td className="px-3 py-2">{e.tokenInvitado || "-"}</td>
                        <td className="px-3 py-2">{e.mensaje}</td>
                        <td className="px-3 py-2">{formatFecha(e.timestamp)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}