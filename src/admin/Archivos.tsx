import { useState, useRef } from "react";

type Archivo = {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  url: string;
  carpeta: string;
  fecha: string;
};

const CARPETAS_BASE = [
  "General",
  "Ceremonia",
  "Proveedores",
  "Facturas",
  "Decoración",
  "Documentos legales",
  "Música",
  "Fotos",
  "Otros",
];

export default function Archivos() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [carpetaActiva, setCarpetaActiva] = useState("General");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const subirArchivo = (file: File) => {
    const nuevo: Archivo = {
      id: crypto.randomUUID(),
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      url: URL.createObjectURL(file),
      carpeta: carpetaActiva,
      fecha: new Date().toLocaleDateString(),
    };

    setArchivos((prev) => [...prev, nuevo]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      subirArchivo(e.target.files[0]);
    }
  };

  const borrarArchivo = (id: string) => {
    setArchivos(archivos.filter((a) => a.id !== id));
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de archivos</h1>

      {/* Carpetas */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {CARPETAS_BASE.map((c) => (
          <button
            key={c}
            onClick={() => setCarpetaActiva(c)}
            className={`px-4 py-2 rounded-lg border ${
              carpetaActiva === c
                ? "bg-blue-600 border-blue-400"
                : "bg-white/10 border-white/20 hover:bg-white/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Subir archivo */}
      <div className="bg-white/10 border border-white/20 p-4 rounded-lg mb-6">
        <button
          onClick={() => inputRef.current?.click()}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold"
        >
          + Subir archivo
        </button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInput}
        />
      </div>

      {/* Lista de archivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {archivos
          .filter((a) => a.carpeta === carpetaActiva)
          .map((a) => (
            <div
              key={a.id}
              className="bg-white/10 border border-white/20 p-4 rounded-lg flex flex-col gap-3"
            >
              <div className="text-lg font-semibold break-words">{a.nombre}</div>

              <div className="text-sm opacity-70">
                Tipo: {a.tipo || "Desconocido"}
              </div>
              <div className="text-sm opacity-70">
                Tamaño: {(a.tamaño / 1024).toFixed(1)} KB
              </div>
              <div className="text-sm opacity-70">Fecha: {a.fecha}</div>

              {/* Previsualizar */}
              {(a.tipo.startsWith("image/") || a.tipo === "application/pdf") && (
                <a
                  href={a.url}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  Ver archivo
                </a>
              )}

              {/* Botones */}
              <button
                onClick={() => borrarArchivo(a.id)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded mt-2 text-sm"
              >
                Borrar
              </button>
            </div>
          ))}

        {archivos.filter((a) => a.carpeta === carpetaActiva).length === 0 && (
          <p className="opacity-70 text-lg">No hay archivos en esta carpeta.</p>
        )}
      </div>
    </div>
  );
}