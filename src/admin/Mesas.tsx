import { useEffect, useMemo, useState, type DragEvent } from "react";
import type { Guest } from "../domain/guest";
import type { Table } from "../domain/table";
import {
  assignGuestToTable,
  createTable,
  deleteTable,
  getFilteredGuests,
  getSeatingNameTemplateCatalog,
  getTableStatus,
  loadSeatingWorkspace,
  suggestTableName,
  type SeatingGuestFilter,
  type SeatingTableDraft,
  type SeatingTemplateCategory,
  type SeatingVisibilityMode,
  updateSeatingVisibility,
  updateTable,
} from "../application/adminSeatingService";
import {
  defaultWeddingSettings,
  isMesasPublishedForGuests,
} from "../services/weddingSettingsService";

const EMPTY_TABLE_DRAFT: SeatingTableDraft = {
  nombre: "",
  capacidad: 10,
  tipoMesa: "redonda",
  templateCategory: "personalizado",
};

type TableEditorState = Record<
  string,
  {
    nombre: string;
    capacidad: number;
    tipoMesa: "redonda" | "rectangular";
    templateCategory: SeatingTemplateCategory;
  }
>;

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function isGuestAssignable(guest: Guest): boolean {
  if (guest.personaEstado === "cancelada") return false;
  return guest.estado === "confirmado";
}

function seedEditors(tables: Table[]): TableEditorState {
  return tables.reduce<TableEditorState>((acc, table) => {
    acc[table.id] = {
      nombre: table.nombre,
      capacidad: table.capacidad,
      tipoMesa: table.tipoMesa === "rectangular" ? "rectangular" : "redonda",
      templateCategory: table.templateCategory ?? "personalizado",
    };
    return acc;
  }, {});
}

export default function MesasAdmin() {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const [invitados, setInvitados] = useState<Guest[]>([]);
  const [mesas, setMesas] = useState<Table[]>([]);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SeatingGuestFilter>("sin_asignar");

  const [tableDraft, setTableDraft] = useState<SeatingTableDraft>(EMPTY_TABLE_DRAFT);
  const [tableEditors, setTableEditors] = useState<TableEditorState>({});

  const [visibilityMode, setVisibilityMode] = useState<SeatingVisibilityMode>("visible");
  const [publishAt, setPublishAt] = useState<string>("");

  const [trayCollapsed, setTrayCollapsed] = useState(false);
  const [compactGuestCards, setCompactGuestCards] = useState(true);
  const [compactTables, setCompactTables] = useState(false);

  const nameTemplates = useMemo(() => getSeatingNameTemplateCatalog(), []);

  useEffect(() => {
    void (async () => {
      try {
        const workspace = await loadSeatingWorkspace();
        setInvitados(workspace.invitados);
        setMesas(workspace.mesas);
        setTableEditors(seedEditors(workspace.mesas));
        setVisibilityMode(workspace.settings.mesasVisibilityMode);
        setPublishAt(workspace.settings.mesasPublishAt ?? "");
      } catch {
        setNotice({ type: "error", text: "No se pudo cargar el módulo de mesas." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const suggestedDraftName = useMemo(
    () => suggestTableName(mesas, tableDraft.templateCategory, mesas.length + 1),
    [mesas, tableDraft.templateCategory]
  );

  const metrics = useMemo(() => {
    const assignable = invitados.filter((guest) => isGuestAssignable(guest));
    const assignableWithoutTable = assignable.filter((guest) => !guest.mesa);
    const withAllergies = invitados.filter((guest) =>
      Boolean(guest.intolerancias?.trim() || guest.alergias?.length)
    );

    return {
      total: invitados.length,
      assignable: assignable.length,
      assignableWithoutTable: assignableWithoutTable.length,
      withAllergies: withAllergies.length,
    };
  }, [invitados]);

  const filteredGuests = useMemo(
    () => getFilteredGuests(invitados, filter, query),
    [invitados, filter, query]
  );

  async function refreshAfterMutation(nextInvitados: Guest[], nextMesas: Table[]) {
    setInvitados(nextInvitados);
    setMesas(nextMesas);
    setTableEditors(seedEditors(nextMesas));
  }

  async function handleCreateTable() {
    try {
      const updated = await createTable(invitados, mesas, tableDraft);
      await refreshAfterMutation(updated.invitados, updated.mesas);
      setTableDraft(EMPTY_TABLE_DRAFT);
      setNotice({ type: "success", text: "Mesa creada correctamente." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo crear la mesa." });
    }
  }

  async function handleSaveTable(tableId: string) {
    const editor = tableEditors[tableId];
    if (!editor) return;

    try {
      const updated = await updateTable(invitados, mesas, tableId, editor);
      await refreshAfterMutation(updated.invitados, updated.mesas);
      setNotice({ type: "success", text: "Mesa actualizada." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo actualizar la mesa." });
    }
  }

  async function handleToggleTableCollapsed(table: Table) {
    try {
      const updated = await updateTable(invitados, mesas, table.id, {
        collapsed: !table.collapsed,
      });
      await refreshAfterMutation(updated.invitados, updated.mesas);
    } catch {
      setNotice({ type: "error", text: "No se pudo minimizar/expandir la mesa." });
    }
  }

  async function handleDeleteTable(tableId: string) {
    try {
      const updated = await deleteTable(invitados, mesas, tableId);
      await refreshAfterMutation(updated.invitados, updated.mesas);
      setNotice({ type: "success", text: "Mesa eliminada. Invitados devueltos a sin asignar." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo eliminar la mesa." });
    }
  }

  async function handleAssignGuest(guestToken: string, tableId: string | null) {
    try {
      const updated = await assignGuestToTable(invitados, mesas, guestToken, tableId);
      await refreshAfterMutation(updated.invitados, updated.mesas);
      setNotice({ type: "success", text: tableId ? "Invitado asignado." : "Invitado movido a sin asignar." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo actualizar la asignación." });
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, guestToken: string) {
    event.dataTransfer.setData("text/plain", guestToken);
    event.dataTransfer.effectAllowed = "move";
  }

  async function handleDrop(event: DragEvent<HTMLElement>, tableId: string | null) {
    event.preventDefault();
    const guestToken = event.dataTransfer.getData("text/plain");
    if (!guestToken) return;
    await handleAssignGuest(guestToken, tableId);
  }

  function handleVisibilitySave() {
    const nextSettings = updateSeatingVisibility({
      mode: visibilityMode,
      publishAt: visibilityMode === "scheduled" ? publishAt || null : null,
    });
    setPublishAt(nextSettings.mesasPublishAt ?? "");
    setNotice({ type: "success", text: "Preferencias de publicación guardadas." });
  }

  const publicationPreview = isMesasPublishedForGuests({
    ...defaultWeddingSettings,
    mostrarMesas: visibilityMode !== "hidden",
    mesasVisibilityMode: visibilityMode,
    mesasPublishAt: visibilityMode === "scheduled" ? publishAt || null : null,
  });

  if (loading) {
    return (
      <section className="app-surface p-8 text-[var(--app-ink)]">
        <p className="app-kicker">Mesas</p>
        <h1 className="app-page-title mt-4">Organizador de seating</h1>
        <p className="mt-3 text-[var(--app-muted)]">Cargando invitados y mesas...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Mesas</p>
        <h1 className="app-page-title mt-4">Organizador de seating plan</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Gestiona invitados confirmados, crea mesas por plantilla y organiza el plano de forma compacta para bodas grandes.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Invitados totales</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.total}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Confirmados activos</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.assignable}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Sin asignar</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.assignableWithoutTable}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Con intolerancias</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.withAllergies}</p>
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

      <div className="app-panel grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
        <div>
          <h2 className="app-section-heading">Publicación para invitados</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Define cuándo se muestra la distribución de mesas en la zona pública.
          </p>
        </div>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Visibilidad</span>
          <select
            value={visibilityMode}
            onChange={(event) => setVisibilityMode(event.target.value as SeatingVisibilityMode)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2 text-sm"
          >
            <option value="hidden">Oculto a invitados</option>
            <option value="visible">Visible para invitados</option>
            <option value="scheduled">Programar apertura</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Fecha y hora</span>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(event) => setPublishAt(event.target.value)}
            disabled={visibilityMode !== "scheduled"}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2 text-sm disabled:opacity-50"
          />
        </label>
        <button type="button" onClick={handleVisibilitySave} className="app-button-primary lg:col-span-3 lg:justify-self-end">
          Guardar publicación
        </button>
        <p className="text-xs text-[var(--app-muted)] lg:col-span-3">
          Estado actual: {publicationPreview ? "publicado" : "oculto"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section
            className="app-panel space-y-4 p-5"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => void handleDrop(event, null)}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="app-section-heading">Bandeja de invitados</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Invitados sin asignar y asignación rápida.</p>
              </div>
              <button
                type="button"
                onClick={() => setTrayCollapsed((current) => !current)}
                className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs"
              >
                {trayCollapsed ? "Expandir" : "Plegar"}
              </button>
            </div>

            {!trayCollapsed ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCompactGuestCards((current) => !current)}
                    className="rounded-xl border border-[var(--app-line)] px-3 py-2 text-xs"
                  >
                    {compactGuestCards ? "Vista amplia" : "Vista compacta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompactTables((current) => !current)}
                    className="rounded-xl border border-[var(--app-line)] px-3 py-2 text-xs"
                  >
                    {compactTables ? "Mesas grandes" : "Mesas compactas"}
                  </button>
                </div>

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nombre"
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                />

                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as SeatingGuestFilter)}
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                >
                  <option value="sin_asignar">Sin asignar</option>
                  <option value="todos">Todos</option>
                  <option value="asignados">Asignados</option>
                  <option value="ninos">Niños</option>
                  <option value="con_intolerancias">Con intolerancias</option>
                </select>

                <div
                  className={`space-y-2 overflow-y-auto pr-1 ${
                    compactGuestCards ? "max-h-[44vh]" : "max-h-[58vh]"
                  }`}
                >
                  {filteredGuests.length === 0 ? (
                    <p className="text-sm text-[var(--app-muted)]">No hay invitados con ese filtro.</p>
                  ) : (
                    filteredGuests.map((guest) => {
                      const assignable = isGuestAssignable(guest);
                      const currentMesa = guest.mesa ?? "";

                      return (
                        <article
                          key={guest.token}
                          draggable={assignable}
                          onDragStart={(event) => handleDragStart(event, guest.token)}
                          className={`app-surface-soft space-y-2 ${
                            compactGuestCards ? "p-3" : "p-4"
                          } ${assignable ? "cursor-grab" : "opacity-75"}`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-[var(--app-ink)]">{guest.nombre}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                              <span className="rounded-full border border-[var(--app-line)] px-2 py-0.5">{guest.tipo}</span>
                              <span className="rounded-full border border-[var(--app-line)] px-2 py-0.5 capitalize">
                                {guest.estado}
                              </span>
                              <span className="rounded-full border border-[var(--app-line)] px-2 py-0.5">
                                {guest.invitationRole === "acompanante" ? "Acompañante" : "Titular"}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--app-muted)]">
                              Mesa: {currentMesa || "Sin asignar"}
                              {guest.intolerancias ? ` · Intolerancias: ${guest.intolerancias}` : ""}
                            </p>
                          </div>

                          <select
                            value={currentMesa}
                            onChange={(event) =>
                              void handleAssignGuest(guest.token, event.target.value || null)
                            }
                            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-2.5 py-1.5 text-xs"
                          >
                            <option value="">Sin asignar</option>
                            {mesas.map((mesa) => (
                              <option key={mesa.id} value={mesa.id}>
                                {mesa.nombre}
                              </option>
                            ))}
                          </select>
                        </article>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-[var(--app-muted)]">Bandeja plegada para ganar espacio visual.</p>
            )}
          </section>

          <section className="app-panel space-y-3 p-5">
            <h2 className="app-section-heading">Nueva mesa</h2>
            <select
              value={tableDraft.templateCategory}
              onChange={(event) =>
                setTableDraft((current) => ({
                  ...current,
                  templateCategory: event.target.value as SeatingTemplateCategory,
                }))
              }
              className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
            >
              {nameTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={tableDraft.nombre}
                onChange={(event) =>
                  setTableDraft((current) => ({ ...current, nombre: event.target.value }))
                }
                placeholder={suggestedDraftName}
                className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
              />
              <button
                type="button"
                onClick={() =>
                  setTableDraft((current) => ({ ...current, nombre: suggestedDraftName }))
                }
                className="rounded-xl border border-[var(--app-line)] px-3 py-2 text-xs"
              >
                Sugerir
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={tableDraft.tipoMesa}
                onChange={(event) =>
                  setTableDraft((current) => ({
                    ...current,
                    tipoMesa: event.target.value as "redonda" | "rectangular",
                  }))
                }
                className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
              >
                <option value="redonda">Redonda</option>
                <option value="rectangular">Rectangular</option>
              </select>
              <input
                type="number"
                min={1}
                value={tableDraft.capacidad}
                onChange={(event) =>
                  setTableDraft((current) => ({
                    ...current,
                    capacidad: Number(event.target.value) || 1,
                  }))
                }
                className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
              />
            </div>
            <button type="button" onClick={handleCreateTable} className="app-button-primary w-full">
              Crear mesa
            </button>
          </section>
        </aside>

        <section className="space-y-4">
          {mesas.length === 0 ? (
            <div className="app-panel p-6">
              <h2 className="app-section-heading">Aún no hay mesas creadas</h2>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Crea la primera mesa para empezar a asignar invitados.
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${compactTables ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {mesas.map((mesa) => {
                const editor = tableEditors[mesa.id] ?? {
                  nombre: mesa.nombre,
                  capacidad: mesa.capacidad,
                  tipoMesa: mesa.tipoMesa === "rectangular" ? "rectangular" : "redonda",
                  templateCategory: mesa.templateCategory ?? "personalizado",
                };
                const seatedGuests = invitados.filter((guest) => guest.mesa === mesa.id);
                const free = Math.max(0, mesa.capacidad - seatedGuests.length);
                const tableStatus = getTableStatus({ ...mesa, invitadosTokens: seatedGuests.map((g) => g.token) });

                return (
                  <article
                    key={mesa.id}
                    className={`app-panel space-y-4 ${compactTables ? "p-4" : "p-5"}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => void handleDrop(event, mesa.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            tableStatus === "completa"
                              ? "bg-emerald-100 text-emerald-700"
                              : tableStatus === "sobreocupada"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {tableStatus === "completa"
                            ? "Mesa completada"
                            : tableStatus === "sobreocupada"
                            ? "Sobreocupada"
                            : "Incompleta"}
                        </span>
                        <span className="text-xs text-[var(--app-muted)]">{mesa.tipoMesa}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleToggleTableCollapsed(mesa)}
                        className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs"
                      >
                        {mesa.collapsed ? "Expandir" : "Minimizar"}
                      </button>
                    </div>

                    {!mesa.collapsed ? (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            value={editor.nombre}
                            onChange={(event) =>
                              setTableEditors((current) => ({
                                ...current,
                                [mesa.id]: { ...editor, nombre: event.target.value },
                              }))
                            }
                            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                          />
                          <select
                            value={editor.templateCategory}
                            onChange={(event) =>
                              setTableEditors((current) => ({
                                ...current,
                                [mesa.id]: {
                                  ...editor,
                                  templateCategory: event.target.value as SeatingTemplateCategory,
                                },
                              }))
                            }
                            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                          >
                            {nameTemplates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editor.tipoMesa}
                            onChange={(event) =>
                              setTableEditors((current) => ({
                                ...current,
                                [mesa.id]: {
                                  ...editor,
                                  tipoMesa: event.target.value as "redonda" | "rectangular",
                                },
                              }))
                            }
                            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                          >
                            <option value="redonda">Redonda</option>
                            <option value="rectangular">Rectangular</option>
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={editor.capacidad}
                            onChange={(event) =>
                              setTableEditors((current) => ({
                                ...current,
                                [mesa.id]: {
                                  ...editor,
                                  capacidad: Number(event.target.value) || 1,
                                },
                              }))
                            }
                            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.52)] px-3 py-2 text-xs text-[var(--app-muted)]">
                            Ocupadas: {seatedGuests.length} / {mesa.capacidad} · Libres: {free}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveTable(mesa.id)}
                              className="app-button-secondary"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteTable(mesa.id)}
                              className="rounded-full border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {seatedGuests.length === 0 ? (
                            <p className="text-sm italic text-[var(--app-muted)]">Sin invitados asignados.</p>
                          ) : (
                            seatedGuests.map((guest) => (
                              <div
                                key={guest.token}
                                className="flex items-center justify-between rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-sm"
                              >
                                <div>
                                  <p className="font-medium text-[var(--app-ink)]">{guest.nombre}</p>
                                  <p className="text-xs text-[var(--app-muted)]">
                                    {guest.tipo}
                                    {guest.intolerancias ? ` · ${guest.intolerancias}` : ""}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void handleAssignGuest(guest.token, null)}
                                  className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs"
                                >
                                  Quitar
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.62)] p-3 text-xs text-[var(--app-muted)]">
                        {seatedGuests.length} / {mesa.capacidad} plazas ocupadas
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {metrics.assignableWithoutTable > 0 ? (
        <div className="app-panel p-4 text-sm text-amber-700">
          Hay {metrics.assignableWithoutTable} invitados confirmados sin mesa asignada.
        </div>
      ) : null}
    </section>
  );
}
