import { useState, useEffect } from "react";
import { obtenerTransportes, guardarTransportes, borrarTransporte } from "../services/transporteService";
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

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function DesplazamientoAdmin() {
  const [items, setItems] = useState<Transporte[]>([]);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    origen: "",
    destino: "",
    hora: "",
    capacidad: "",
    notas: "",
  });

  useEffect(() => {
    obtenerTransportes().then((data) => setItems(data));
  }, []);

  const guardar = () => {
    if (!nuevo.nombre.trim()) return;

    const entry: Transporte = {
      id: uuid(),
      nombre: nuevo.nombre,
      origen: nuevo.origen,
      destino: nuevo.destino,
      hora: nuevo.hora,
      capacidad: Number(nuevo.capacidad) || 0,
      notas: nuevo.notas,
    };

    const updated = [...items, entry];
    setItems(updated);
    guardarTransportes(updated);

    const usuario = getUsuarioActual();
    if (usuario) {
      addLog(usuario.nombre, `Creó transporte: ${entry.nombre}`);
    }

    setNuevo({
      nombre: "",
      origen: "",
      destino: "",
      hora: "",
      capacidad: "",
      notas: "",
    });
  };

  const borrar = (id: string) => {
    const updated = items.filter((t) => t.id !== id);
    setItems(updated);
    borrarTransporte(id);

    const usuario = getUsuarioActual();
    const transporte = items.find((t) => t.id === id);
    if (usuario && transporte) {
      addLog(usuario.nombre, `Borró transporte: ${transporte.nombre}`);
    }
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Desplazamientos (Admin)</h1>

      <p className="opacity-80">
        Define aquí los medios de transporte para invitados (ida y vuelta).
      </p>

      <div className="p-4 bg-white/10 border border-white/20 rounded space-y-3">
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Nombre del transporte (Ej: Bus A)"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Origen"
          value={nuevo.origen}
          onChange={(e) => setNuevo({ ...nuevo, origen: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Destino"
          value={nuevo.destino}
          onChange={(e) => setNuevo({ ...nuevo, destino: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Hora"
          value={nuevo.hora}
          onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Capacidad (asientos)"
          type="number"
          value={nuevo.capacidad}
          onChange={(e) => setNuevo({ ...nuevo, capacidad: e.target.value })}
        />
        <textarea
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Notas"
          value={nuevo.notas}
          onChange={(e) => setNuevo({ ...nuevo, notas: e.target.value })}
        />

        <button className="bg-blue-600 px-4 py-2 rounded" onClick={guardar}>
          Añadir transporte
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="opacity-60">No hay transportes añadidos.</p>
        )}

        {items.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-white/10 border border-white/20 rounded flex justify-between"
          >
            <div>
              <p className="font-bold text-lg">{t.nombre}</p>
              <p className="opacity-80">
                {t.origen} → {t.destino}
              </p>
              <p className="opacity-80">Hora: {t.hora}</p>
              <p className="opacity-80">Capacidad: {t.capacidad}</p>
              {t.notas && <p className="italic opacity-70 mt-1">{t.notas}</p>}
            </div>

            <button
              className="bg-red-600 px-3 py-1 rounded h-fit"
              onClick={() => borrar(t.id)}
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}