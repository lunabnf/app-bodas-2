import { useMemo, useState } from "react";
import type { WeddingProgramDocument, WeddingProgramItem } from "../domain/program";
import {
  createEmptyProgramItem,
  getProgramCategoryOptions,
  getWeddingProgramDocument,
  moveProgramItem,
  saveWeddingProgramDocument,
  sortProgramItemsByHour,
} from "../services/programaService";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const categoryOptions = getProgramCategoryOptions();

function updateProgramItem(
  items: WeddingProgramItem[],
  itemId: string,
  patch: Partial<WeddingProgramItem>
) {
  return items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
}

export default function ProgramaAdmin() {
  const [document, setDocument] = useState<WeddingProgramDocument>(() => getWeddingProgramDocument());
  const [notice, setNotice] = useState<Notice>(null);

  const visibleCount = useMemo(
    () => document.items.filter((item) => item.visible).length,
    [document.items]
  );

  function persist(nextDocument: WeddingProgramDocument, successText: string) {
    try {
      saveWeddingProgramDocument(nextDocument);
      setDocument(nextDocument);
      setNotice({ type: "success", text: successText });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el programa.",
      });
    }
  }

  function handleSaveAll() {
    persist(document, "Programa guardado correctamente.");
  }

  function handleAddEvent() {
    const nextDocument: WeddingProgramDocument = {
      ...document,
      items: [...document.items, createEmptyProgramItem(document.items.length)],
    };
    persist(nextDocument, "Nuevo bloque añadido al programa.");
  }

  function handleDeleteEvent(itemId: string) {
    const nextDocument: WeddingProgramDocument = {
      ...document,
      items: document.items
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({ ...item, orden: index })),
    };
    persist(nextDocument, "Evento eliminado del programa.");
  }

  function handleMove(itemIndex: number, direction: "up" | "down") {
    const nextDocument: WeddingProgramDocument = {
      ...document,
      items: moveProgramItem(document.items, itemIndex, direction),
    };
    persist(nextDocument, "Orden del programa actualizado.");
  }

  function handleSortByHour() {
    const nextDocument: WeddingProgramDocument = {
      ...document,
      items: sortProgramItemsByHour(document.items),
    };
    persist(nextDocument, "Programa ordenado cronológicamente por hora.");
  }

  function handleItemChange(itemId: string, patch: Partial<WeddingProgramItem>) {
    setDocument((current) => ({
      ...current,
      items: updateProgramItem(current.items, itemId, patch),
    }));
    setNotice(null);
  }

  return (
    <section className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Programa</p>
        <h1 className="app-page-title mt-4">Editor del programa del día</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Esta es la única fuente de verdad del programa. Todo lo que guardéis aquí será lo que vean los invitados en su timeline.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Bloques totales</p>
            <p className="mt-2 text-2xl font-semibold">{document.items.length}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Visibles para invitados</p>
            <p className="mt-2 text-2xl font-semibold">{visibleCount}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Ocultos</p>
            <p className="mt-2 text-2xl font-semibold">{document.items.length - visibleCount}</p>
          </article>
        </div>
      </div>

      {notice ? (
        <div
          className={`app-panel p-4 text-sm ${
            notice.type === "error" ? "border-red-300/60 text-red-700" : "border-emerald-300/60 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Título de sección</span>
            <input
              className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
              value={document.config.tituloSeccion}
              onChange={(event) =>
                setDocument((current) => ({
                  ...current,
                  config: { ...current.config, tituloSeccion: event.target.value },
                }))
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Subtítulo de sección</span>
            <textarea
              className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
              rows={3}
              value={document.config.subtituloSeccion}
              onChange={(event) =>
                setDocument((current) => ({
                  ...current,
                  config: { ...current.config, subtituloSeccion: event.target.value },
                }))
              }
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleAddEvent} className="app-button-secondary">
            Añadir evento
          </button>
          <button type="button" onClick={handleSortByHour} className="app-button-secondary">
            Ordenar por hora
          </button>
          <button type="button" onClick={handleSaveAll} className="app-button-primary">
            Guardar programa
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {document.items.length === 0 ? (
          <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
            Aún no hay bloques creados. Añade el primero para construir el timeline del día.
          </div>
        ) : (
          document.items.map((item, index) => (
            <article key={item.id} className="app-panel p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.84)] px-4 py-3 text-center">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-muted)]">Hora</p>
                    <p className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                      {item.hora || "--:--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      Evento {index + 1}
                    </p>
                    <h2 className="text-xl font-semibold">
                      {item.titulo.trim() || "Nuevo momento"}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">
                      {item.subtitulo?.trim() || "Sin subtítulo"} · {item.visible ? "Visible" : "Oculto"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs"
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs"
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(item.id)}
                    className="rounded-full border border-red-300/70 px-3 py-1 text-xs text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.52)] px-4 py-3 text-sm text-[var(--app-muted)]">
                Timeline: <strong className="text-[var(--app-ink)]">{item.hora || "--:--"}</strong>
                {" · "}
                <strong className="text-[var(--app-ink)]">{item.titulo || "Sin título"}</strong>
                {item.ubicacion?.trim() ? ` · ${item.ubicacion.trim()}` : ""}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Hora</span>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    value={item.hora}
                    onChange={(event) => handleItemChange(item.id, { hora: event.target.value })}
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Categoría</span>
                  <select
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    value={item.categoria}
                    onChange={(event) =>
                      handleItemChange(item.id, { categoria: event.target.value as WeddingProgramItem["categoria"] })
                    }
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Título</span>
                  <input
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    value={item.titulo}
                    onChange={(event) => handleItemChange(item.id, { titulo: event.target.value })}
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Subtítulo o tipo</span>
                  <input
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    value={item.subtitulo}
                    onChange={(event) => handleItemChange(item.id, { subtitulo: event.target.value })}
                    placeholder="Ej. Llegada invitados, votos, apertura pista..."
                  />
                </label>

                <label className="space-y-1 lg:col-span-2">
                  <span className="text-sm text-[var(--app-muted)]">Descripción</span>
                  <textarea
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    rows={3}
                    value={item.descripcion ?? ""}
                    onChange={(event) => handleItemChange(item.id, { descripcion: event.target.value })}
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Ubicación</span>
                  <input
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    value={item.ubicacion ?? ""}
                    onChange={(event) => handleItemChange(item.id, { ubicacion: event.target.value })}
                    placeholder="Ej. Jardín principal, salón, terraza..."
                  />
                </label>

                <label className="flex items-center gap-3 self-end rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) => handleItemChange(item.id, { visible: event.target.checked })}
                  />
                  <span className="text-sm text-[var(--app-ink)]">Visible para invitados</span>
                </label>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
