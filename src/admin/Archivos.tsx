import { useEffect, useRef, useState } from "react";
import type { GuestPhoto } from "../domain/photo";
import { borrarFotoInvitado, obtenerFotosInvitados } from "../services/fotosService";

type Archivo = {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  url: string;
  carpeta: string;
  fecha: string;
};

const GUEST_PHOTOS_FOLDER = "Fotos invitados";

const CARPETAS_BASE = [
  "General",
  "Ceremonia",
  "Proveedores",
  "Facturas",
  "Decoración",
  "Documentos legales",
  "Música",
  GUEST_PHOTOS_FOLDER,
  "Otros",
] as const;

function formatPhotoDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Archivos() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<GuestPhoto[]>([]);
  const [carpetaActiva, setCarpetaActiva] = useState<(typeof CARPETAS_BASE)[number]>("General");
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void obtenerFotosInvitados().then(setGuestPhotos);
  }, []);

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

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      subirArchivo(event.target.files[0]);
    }
  };

  const borrarArchivo = (id: string) => {
    setArchivos((current) => current.filter((archivo) => archivo.id !== id));
  };

  async function handleDeleteGuestPhoto(photoId: string) {
    const ok = await borrarFotoInvitado(photoId);
    if (!ok) return;
    setGuestPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setNotice("Foto de invitado eliminada.");
  }

  const internalFiles = archivos.filter((archivo) => archivo.carpeta === carpetaActiva);
  const isGuestPhotoFolder = carpetaActiva === GUEST_PHOTOS_FOLDER;

  return (
    <div className="space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6">
      <div className="app-surface p-8">
        <h1 className="app-page-title">Gestión de archivos</h1>
        <p className="mt-3 text-[var(--app-muted)]">
          Centraliza documentos internos y revisa también las fotos reales subidas por invitados desde la zona pública.
        </p>
      </div>

      <div className="app-surface-soft p-4">
        <div className="md:hidden">
          <label className="mb-2 block text-sm font-medium text-[var(--app-muted)]">
            Carpeta activa
          </label>
          <select
            value={carpetaActiva}
            onChange={(event) => setCarpetaActiva(event.target.value as (typeof CARPETAS_BASE)[number])}
            className="w-full p-3"
          >
            {CARPETAS_BASE.map((carpeta) => (
              <option key={carpeta} value={carpeta}>
                {carpeta}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden flex-wrap gap-2 md:flex">
          {CARPETAS_BASE.map((carpeta) => (
            <button
              key={carpeta}
              type="button"
              onClick={() => setCarpetaActiva(carpeta)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                carpetaActiva === carpeta
                  ? "border-[var(--app-ink)] bg-[var(--app-ink)] text-[#f8f7f3] shadow-[0_10px_24px_rgba(24,24,23,0.12)]"
                  : "border-[var(--app-line)] bg-[rgba(255,255,255,0.88)] text-[var(--app-ink)] hover:bg-white"
              }`}
            >
              {carpeta}
            </button>
          ))}
        </div>
      </div>

      <div className="app-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{carpetaActiva}</p>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              {isGuestPhotoFolder
                ? "Misma galería que alimentan los invitados al subir fotos."
                : "Archivos internos de gestión del evento."}
            </p>
          </div>
          {!isGuestPhotoFolder ? (
            <>
              <button onClick={() => inputRef.current?.click()} className="app-button-primary">
                + Subir archivo
              </button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleInput}
              />
            </>
          ) : (
            <div className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--app-muted)]">
              {guestPhotos.length} foto(s) compartidas por invitados
            </div>
          )}
        </div>
        {notice ? (
          <div className="mt-4 rounded-[18px] border border-[rgba(24,24,23,0.08)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--app-muted)]">
            {notice}
          </div>
        ) : null}
      </div>

      {isGuestPhotoFolder ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {guestPhotos.map((photo) => (
            <article key={photo.id} className="app-panel overflow-hidden">
              <img src={photo.dataUrl} alt={photo.name} className="h-52 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div>
                  <p className="font-semibold break-words">{photo.name}</p>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">
                    {photo.uploadedByName} · {formatPhotoDate(photo.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-[var(--app-muted)]">
                  Tamaño: {(photo.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={photo.dataUrl} target="_blank" rel="noreferrer" className="app-button-secondary inline-flex text-sm">
                    Ver
                  </a>
                  <a href={photo.dataUrl} download={photo.name} className="app-button-secondary inline-flex text-sm">
                    Descargar
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleDeleteGuestPhoto(photo.id)}
                    className="app-button-secondary inline-flex text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}

          {guestPhotos.length === 0 ? (
            <p className="text-lg text-[var(--app-muted)]">Todavía no hay fotos subidas por invitados.</p>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {internalFiles.map((archivo) => (
            <div key={archivo.id} className="app-panel flex flex-col gap-3 p-4">
              <div className="break-words text-lg font-semibold">{archivo.nombre}</div>
              <div className="text-sm text-[var(--app-muted)]">Tipo: {archivo.tipo || "Desconocido"}</div>
              <div className="text-sm text-[var(--app-muted)]">Tamaño: {(archivo.tamaño / 1024).toFixed(1)} KB</div>
              <div className="text-sm text-[var(--app-muted)]">Fecha: {archivo.fecha}</div>
              {(archivo.tipo.startsWith("image/") || archivo.tipo === "application/pdf") && (
                <a href={archivo.url} target="_blank" rel="noreferrer" className="underline text-[var(--app-ink)]">
                  Ver archivo
                </a>
              )}
              <button onClick={() => borrarArchivo(archivo.id)} className="app-button-secondary mt-2 text-sm">
                Borrar
              </button>
            </div>
          ))}

          {internalFiles.length === 0 ? (
            <p className="text-lg text-[var(--app-muted)]">No hay archivos en esta carpeta.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
