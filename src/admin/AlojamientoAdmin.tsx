
type Alojamiento = {
  nombre: string;
  direccion: string;
  link: string;
};
import { useState, useEffect } from "react";

export default function AlojamientoAdmin() {
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", direccion: "", link: "" });

  useEffect(() => {
    const saved = localStorage.getItem("wedding.alojamientos");
    if (saved) setAlojamientos(JSON.parse(saved));
  }, []);

  const guardar = () => {
    if (!nuevo.nombre.trim()) return;
    const updated = [...alojamientos, nuevo];
    setAlojamientos(updated);
    localStorage.setItem("wedding.alojamientos", JSON.stringify(updated));
    setNuevo({ nombre: "", direccion: "", link: "" });
  };

  const borrar = (index: number) => {
    const updated = alojamientos.filter((_, i) => i !== index);
    setAlojamientos(updated);
    localStorage.setItem("wedding.alojamientos", JSON.stringify(updated));
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Alojamiento (Admin)</h1>

      <p className="opacity-80">
        Añade aquí los hoteles, apartamentos o casas rurales que verán los invitados.
      </p>

      <div className="p-4 bg-white/10 border border-white/20 rounded-lg space-y-3">
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Nombre del alojamiento"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Dirección"
          value={nuevo.direccion}
          onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Link de reserva"
          value={nuevo.link}
          onChange={(e) => setNuevo({ ...nuevo, link: e.target.value })}
        />

        <button className="bg-blue-600 px-4 py-2 rounded" onClick={guardar}>
          Añadir alojamiento
        </button>
      </div>

      <div className="space-y-3">
        {alojamientos.length === 0 && (
          <p className="opacity-60">No hay alojamientos añadidos.</p>
        )}

        {alojamientos.map((h, i) => (
          <div key={i} className="p-4 bg-white/10 border rounded-lg flex justify-between">
            <div>
              <p className="font-bold">{h.nombre}</p>
              <p className="opacity-80">{h.direccion}</p>
              <a
                href={h.link}
                className="underline text-blue-300"
                target="_blank"
                rel="noreferrer"
              >
                Ver enlace
              </a>
            </div>

            <button
              className="bg-red-600 px-3 py-1 rounded h-fit"
              onClick={() => borrar(i)}
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}