import { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/useAuth";
import type { GuestPhoto } from "../domain/photo";
import { borrarFotoInvitado, guardarFotoInvitado, obtenerFotosInvitados } from "../services/fotosService";
import { registrarActividad } from "../services/actividadService";

function formatPhotoDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo leer la imagen."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

export default function Fotos() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const invitado = useAuth((state) => state.invitado);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [notice, setNotice] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void obtenerFotosInvitados().then(setPhotos);
  }, []);

  async function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploading(true);
    setNotice("");

    try {
      const nextPhotos: GuestPhoto[] = [];

      for (const file of files) {
        const dataUrl = await readFileAsDataUrl(file);
        const nextPhoto: GuestPhoto = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          uploadedByName: invitado?.nombre?.trim() || "Invitado",
          ...(invitado?.token ? { uploadedByToken: invitado.token } : {}),
          createdAt: Date.now(),
        };

        const saved = await guardarFotoInvitado(nextPhoto);
        if (saved) {
          nextPhotos.push(nextPhoto);
          await registrarActividad({
            id: crypto.randomUUID(),
            timestamp: nextPhoto.createdAt,
            tipo: "foto_subida",
            mensaje: `${nextPhoto.uploadedByName} subió una foto`,
            ...(nextPhoto.uploadedByToken ? { tokenInvitado: nextPhoto.uploadedByToken } : {}),
          });
        }
      }

      if (nextPhotos.length > 0) {
        setPhotos((current) => [...nextPhotos, ...current].sort((a, b) => b.createdAt - a.createdAt));
        setNotice(nextPhotos.length === 1 ? "Foto subida correctamente." : `${nextPhotos.length} fotos subidas correctamente.`);
      }
    } catch {
      setNotice("No se pudo subir alguna de las fotos. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
      if (event.target) event.target.value = "";
    }
  }

  async function handleDelete(photoId: string) {
    const ok = await borrarFotoInvitado(photoId);
    if (!ok) return;
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setNotice("Foto eliminada.");
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Participación</p>
        <h1 className="app-page-title mt-4">Fotos de invitados</h1>
        <p className="mt-3 app-subtitle">
          Subid imágenes de la boda para que queden reunidas en un mismo lugar y los novios también las vean desde su panel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="app-button-primary"
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "Subir fotos"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleInput}
          />
          <p className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--app-muted)]">
            {photos.length} foto(s) compartidas
          </p>
        </div>
        {notice ? (
          <div className="mt-4 rounded-[18px] border border-[rgba(24,24,23,0.08)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--app-muted)]">
            {notice}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article key={photo.id} className="app-surface-soft overflow-hidden">
            <img src={photo.dataUrl} alt={photo.name} className="h-56 w-full object-cover" />
            <div className="space-y-3 p-4">
              <div>
                <p className="font-semibold">{photo.name}</p>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  {photo.uploadedByName} · {formatPhotoDate(photo.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={photo.dataUrl} target="_blank" rel="noreferrer" className="app-button-secondary inline-flex">
                  Ver
                </a>
                <a href={photo.dataUrl} download={photo.name} className="app-button-secondary inline-flex">
                  Descargar
                </a>
                {invitado?.token && photo.uploadedByToken === invitado.token ? (
                  <button type="button" onClick={() => void handleDelete(photo.id)} className="app-button-secondary inline-flex">
                    Eliminar
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}

        {photos.length === 0 ? (
          <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
            Todavía no hay fotos subidas. Cuando los invitados compartan imágenes, aparecerán aquí y también en Archivos del panel admin.
          </div>
        ) : null}
      </div>
    </section>
  );
}
