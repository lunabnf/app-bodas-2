import { useState } from "react";

type Tarea = {
  id: string;
  titulo: string;
  categoria: string;
  completada: boolean;
};

const CATEGORIAS = [
  "Ceremonia",
  "Banquete",
  "Proveedores",
  "Invitados",
  "Documentación",
  "Pagos",
  "Decoración",
];

export default function Checklist() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nueva, setNueva] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);

  const añadirTarea = () => {
    if (!nueva.trim()) return;
    const t: Tarea = {
      id: crypto.randomUUID(),
      titulo: nueva,
      categoria,
      completada: false,
    };
    setTareas([...tareas, t]);
    setNueva("");
  };

  const toggle = (id: string) => {
    setTareas(
      tareas.map((t) =>
        t.id === id ? { ...t, completada: !t.completada } : t
      )
    );
  };

  const borrar = (id: string) => {
    setTareas(tareas.filter((t) => t.id !== id));
  };

  return (
    <div className="text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Checklist profesional</h1>

      {/* Progreso */}
      <div className="mb-6">
        <p className="text-lg">
          Completadas:{" "}
          <span className="font-bold">
            {tareas.filter((t) => t.completada).length}/{tareas.length}
          </span>
        </p>
        <div className="w-full h-3 bg-white/20 rounded mt-2">
          <div
            className="h-full bg-green-500 rounded"
            style={{
              width:
                tareas.length === 0
                  ? "0%"
                  : `${
                      (tareas.filter((t) => t.completada).length /
                        tareas.length) *
                      100
                    }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Añadir tarea */}
      <div className="bg-white/10 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Añadir nueva tarea</h2>

        <input
          type="text"
          placeholder="Descripción de la tarea"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          className="w-full p-2 rounded bg-black/30 border border-white/20 mb-3 text-white"
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 rounded bg-black/30 border border-white/20 mb-3 text-white"
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded font-bold"
          onClick={añadirTarea}
        >
          Añadir tarea
        </button>
      </div>

      {/* Lista por categorías */}
      {CATEGORIAS.map((cat) => (
        <div key={cat} className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{cat}</h3>

          <div className="space-y-3">
            {tareas
              .filter((t) => t.categoria === cat)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-white/10 p-3 rounded"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggle(t.id)}
                  >
                    <input
                      type="checkbox"
                      checked={t.completada}
                      readOnly
                      className="w-5 h-5"
                    />
                    <span
                      className={`text-lg ${
                        t.completada ? "line-through opacity-50" : ""
                      }`}
                    >
                      {t.titulo}
                    </span>
                  </div>

                  <button
                    onClick={() => borrar(t.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    Borrar
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}