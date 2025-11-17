import { useEffect, useState } from "react";
import { obtenerTransportes, guardarTransportes } from "../services/transporteService";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";

type Transporte = {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  hora: string;
  capacidad: number;
  notas: string;
};

export default function DesplazamientosPage() {
  const [items, setItems] = useState<Transporte[]>([]);
  const [solicitudes, setSolicitudes] = useState<Record<string, number>>({});

  useEffect(() => {
    obtenerTransportes().then((data) => {
      setItems(data || []);
    });

    const sol = localStorage.getItem("wedding.desplazamientos.solicitudes");
    if (sol) {
      try {
        setSolicitudes(JSON.parse(sol));
      } catch {
        setSolicitudes({});
      }
    }
  }, []);

  const solicitar = (id: string) => {
    const usuario = getUsuarioActual();
    if (usuario) {
      const transporte = items.find((t) => t.id === id);
      const nombreTransporte = transporte ? transporte.nombre : "Transporte";
      addLog(usuario.nombre, `Solicitó plaza en ${nombreTransporte}`);
    }
    const updated = { ...solicitudes };
    updated[id] = (updated[id] || 0) + 1;
    setSolicitudes(updated);
    localStorage.setItem("wedding.desplazamientos.solicitudes", JSON.stringify(updated));
    guardarTransportes(items);
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Desplazamientos</h1>

      {items.length === 0 && (
        <p className="opacity-70">No hay transportes disponibles todavía.</p>
      )}

      <div className="space-y-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-white/10 border border-white/20 rounded-lg"
          >
            <p className="text-xl font-semibold">{t.nombre}</p>
            <p className="opacity-80">
              {t.origen} → {t.destino}
            </p>
            <p className="opacity-80">Hora: {t.hora}</p>
            <p className="opacity-80">Capacidad: {t.capacidad}</p>
            {t.notas && <p className="italic opacity-70 mt-1">{t.notas}</p>}

            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => solicitar(t.id)}
                className="bg-blue-600 px-4 py-2 rounded"
              >
                Solicitar plaza (+1)
              </button>

              <span className="opacity-80">
                Solicitantes: {solicitudes[t.id] || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}