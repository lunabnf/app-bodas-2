import { useState } from "react";

type Evento = {
  id: string;
  hora: string;
  titulo: string;
  tipo: string;
};

const TIPOS = [
  "Ceremonia",
  "Proveedores",
  "Fotografía",
  "Banquete",
  "Transporte",
  "DJ / Música",
  "Coordinación",
  "Otros",
];

export default function Agenda() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [hora, setHora] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);

  const añadir = () => {
    if (!hora.trim() || !titulo.trim()) return;

    const nuevo: Evento = {
      id: crypto.randomUUID(),
      hora,
      titulo,
      tipo,
    };

    const ordenados = [...eventos, nuevo].sort(
      (a, b) =>
        Number(a.hora.replace(":", "")) -
        Number(b.hora.replace(":", ""))
    );

    setEventos(ordenados);
    setHora("");
    setTitulo("");
  };

  const borrar = (id: string) => {
    setEventos(eventos.filter((e) => e.id !== id));
  };

  return (
    <div className="text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Agenda interna del día de la boda
      </h1>

      <div className="bg-white/10 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-3">Añadir evento</h2>

        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-black/30 border border-white/20 text-white"
        />

        <input
          type="text"
          placeholder="Descripción del evento"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-black/30 border border-white/20 text-white"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-black/30 border border-white/20 text-white"
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={añadir}
          className="w-full bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded font-bold"
        >
          Añadir evento
        </button>
      </div>

      <div className="space-y-4">
        {eventos.map((ev) => (
          <div
            key={ev.id}
            className="bg-white/10 p-4 rounded flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-xl font-bold">{ev.hora}</span>
              <span className="text-lg">{ev.titulo}</span>
              <span className="text-sm opacity-70">{ev.tipo}</span>
            </div>

            <button
              onClick={() => borrar(ev.id)}
              className="text-red-400 hover:text-red-600"
            >
              Borrar
            </button>
          </div>
        ))}

        {eventos.length === 0 && (
          <p className="opacity-70 text-center mt-8">
            No hay eventos aún. Añade el primero arriba.
          </p>
        )}
      </div>
    </div>
  );
}