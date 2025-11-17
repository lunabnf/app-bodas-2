import { useEffect, useState } from "react";

type Alojamiento = {
  nombre: string;
  direccion: string;
  link: string;
};

export default function AlojamientosPage() {
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("wedding.alojamientos");
    if (raw) {
      try {
        setAlojamientos(JSON.parse(raw));
      } catch {
        setAlojamientos([]);
      }
    }
  }, []);

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Alojamiento</h1>

      {alojamientos.length === 0 && (
        <p className="opacity-70">No hay alojamientos disponibles todavía.</p>
      )}

      <div className="space-y-4">
        {alojamientos.map((a, i) => (
          <div
            key={i}
            className="p-4 bg-white/10 border border-white/20 rounded-lg"
          >
            <p className="text-xl font-semibold">{a.nombre}</p>
            {a.direccion && (
              <p className="opacity-80">{a.direccion}</p>
            )}
            {a.link && (
              <a
                href={a.link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-300 underline block mt-2"
              >
                Ver enlace
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}