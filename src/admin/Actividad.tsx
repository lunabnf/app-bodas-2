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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Actividad reciente</h1>
        <button
          type="button"
          onClick={handleLimpiar}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-red-50 hover:text-red-700"
        >
          Borrar historial
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando actividad...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no hay actividad registrada.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((evento) => (
            <li
              key={evento.id}
              className="rounded-lg border bg-white/70 p-3 shadow-sm backdrop-blur"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{evento.mensaje}</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Tipo: {evento.tipo}
                    {evento.tokenInvitado && (
                      <> · Invitado: {evento.tokenInvitado}</>
                    )}
                  </p>
                </div>
                <span className="whitespace-nowrap text-[11px] text-gray-500">
                  {formatFecha(evento.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}