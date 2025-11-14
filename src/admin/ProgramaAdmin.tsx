import { useState } from "react";

type Evento = {
  id: string;
  hora: string;
  titulo: string;
  descripcion: string;
};

export default function ProgramaAdmin() {
  const [eventos, setEventos] = useState<Evento[]>(
    JSON.parse(localStorage.getItem("wedding.programa") || "[]")
  );
  const [nuevo, setNuevo] = useState<Evento>({
    id: "",
    hora: "",
    titulo: "",
    descripcion: "",
  });

  const guardar = () => {
    localStorage.setItem("wedding.programa", JSON.stringify(eventos));
  };

  const agregar = () => {
    if (!nuevo.hora || !nuevo.titulo) return;
    const actualizados = [
      ...eventos,
      { ...nuevo, id: crypto.randomUUID() },
    ].sort((a, b) => a.hora.localeCompare(b.hora));
    setEventos(actualizados);
    guardar();
    setNuevo({ id: "", hora: "", titulo: "", descripcion: "" });
  };

  const eliminar = (id: string) => {
    const actualizados = eventos.filter((e) => e.id !== id);
    setEventos(actualizados);
    guardar();
  };

  const mover = (indice: number, direccion: "arriba" | "abajo") => {
    const copia = [...eventos];
    const nuevoIndice = direccion === "arriba" ? indice - 1 : indice + 1;
    if (nuevoIndice < 0 || nuevoIndice >= copia.length) return;
    [copia[indice], copia[nuevoIndice]] = [copia[nuevoIndice], copia[indice]];
    setEventos(copia);
    guardar();
  };

  return (
    <section className="text-white p-6 space-y-6">
      <h1 className="text-2xl font-bold">Programa de la boda</h1>

      <div className="flex gap-4">
        <input
          type="time"
          value={nuevo.hora}
          onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })}
          className="bg-black/40 p-2 rounded border border-white/20"
        />
        <input
          type="text"
          placeholder="Título"
          value={nuevo.titulo}
          onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
          className="bg-black/40 p-2 rounded border border-white/20 w-48"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevo.descripcion}
          onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
          className="bg-black/40 p-2 rounded border border-white/20 flex-1"
        />
        <button
          onClick={agregar}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
        >
          Añadir
        </button>
      </div>

      <ul className="space-y-3">
        {eventos.map((ev, i) => (
          <li
            key={ev.id}
            className="bg-white/10 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-lg">{ev.hora} — {ev.titulo}</p>
              <p className="text-sm opacity-80">{ev.descripcion}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => mover(i, "arriba")}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
              >
                ↑
              </button>
              <button
                onClick={() => mover(i, "abajo")}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
              >
                ↓
              </button>
              <button
                onClick={() => eliminar(ev.id)}
                className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}