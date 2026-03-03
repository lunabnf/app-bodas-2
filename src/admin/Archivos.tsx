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
    <div className="space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6">
      <div className="app-surface p-8">
        <h1 className="app-page-title">Gestión de archivos</h1>
        <p className="mt-3 text-[var(--app-muted)]">
          Centraliza documentos, facturas e imágenes con una lectura más clara y contraste estable.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {CARPETAS_BASE.map((c) => (
          <button
            key={c}
            onClick={() => setCarpetaActiva(c)}
            className={`px-4 py-2 rounded-lg border ${
              carpetaActiva === c
                ? "bg-[var(--app-ink)] text-white border-[var(--app-ink)]"
                : "bg-[rgba(255,255,255,0.88)] border-[var(--app-line)] hover:bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="app-panel mb-6 p-4">
        <button
          onClick={() => inputRef.current?.click()}
          className="app-button-primary"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {archivos
          .filter((a) => a.carpeta === carpetaActiva)
          .map((a) => (
            <div
              key={a.id}
              className="app-panel flex flex-col gap-3 p-4"
            >
              <div className="text-lg font-semibold break-words">{a.nombre}</div>

              <div className="text-sm text-[var(--app-muted)]">
                Tipo: {a.tipo || "Desconocido"}
              </div>
              <div className="text-sm text-[var(--app-muted)]">
                Tamaño: {(a.tamaño / 1024).toFixed(1)} KB
              </div>
              <div className="text-sm text-[var(--app-muted)]">Fecha: {a.fecha}</div>

              {(a.tipo.startsWith("image/") || a.tipo === "application/pdf") && (
                <a
                  href={a.url}
                  target="_blank"
                  className="underline text-[var(--app-ink)]"
                >
                  Ver archivo
                </a>
              )}

              <button
                onClick={() => borrarArchivo(a.id)}
                className="app-button-secondary mt-2 text-sm"
              >
                Borrar
              </button>
            </div>
          ))}

        {archivos.filter((a) => a.carpeta === carpetaActiva).length === 0 && (
          <p className="text-lg text-[var(--app-muted)]">No hay archivos en esta carpeta.</p>
        )}
      </div>
    </div>
  );
}
