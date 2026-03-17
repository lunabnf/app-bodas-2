import { useEffect, useMemo, useState, type DragEvent } from "react";
import type { CeremonyGuestFilter, CeremonyLayout } from "../domain/ceremony";
import type { CeremonySeatAssignment, Guest } from "../domain/guest";
import {
  assignGuestToCeremonySeat,
  buildCeremonySeats,
  getCeremonyGuestCards,
  getCeremonyMetrics,
  loadCeremonyWorkspace,
  unassignGuestFromCeremony,
  updateCeremonyLayoutConfig,
} from "../application/adminCeremonyService";

type Notice = {
  type: "success" | "error" | "warning";
  text: string;
} | null;

function getGuestTypeLabel(guest: Guest) {
  if (guest.tipo === "Niño" && typeof guest.edad === "number" && guest.edad <= 2) {
    return "Bebé";
  }
  return guest.tipo === "Niño" ? "Niño" : "Adulto";
}

function seatLabel(seat: CeremonySeatAssignment) {
  return `${seat.side === "left" ? "Izq." : "Der."} · F${seat.row} · A${seat.seat}`;
}

export default function Ceremonia() {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [layout, setLayout] = useState<CeremonyLayout>(() => ({
    layoutType: "two_blocks_center_aisle" as const,
    leftRows: 6,
    rightRows: 6,
    seatsPerRow: 8,
    centerAisleLabel: "Pasillo central",
    updatedAt: Date.now(),
  }));

  const [leftRowsDraft, setLeftRowsDraft] = useState("6");
  const [rightRowsDraft, setRightRowsDraft] = useState("6");
  const [seatsPerRowDraft, setSeatsPerRowDraft] = useState("8");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CeremonyGuestFilter>("sin_asignar");
  const [trayCollapsed, setTrayCollapsed] = useState(false);
  const [selectedGuestToken, setSelectedGuestToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const workspace = await loadCeremonyWorkspace();
        setGuests(workspace.guests);
        setLayout(workspace.layout);
        setLeftRowsDraft(String(workspace.layout.leftRows));
        setRightRowsDraft(String(workspace.layout.rightRows));
        setSeatsPerRowDraft(String(workspace.layout.seatsPerRow));
        setWarnings(workspace.warnings);
      } catch {
        setNotice({ type: "error", text: "No se pudo cargar el organizador de ceremonia." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => getCeremonyMetrics(layout, guests), [layout, guests]);
  const guestCards = useMemo(() => getCeremonyGuestCards(guests, filter, query), [guests, filter, query]);
  const selectedGuest = useMemo(
    () => guests.find((guest) => guest.token === selectedGuestToken) ?? null,
    [guests, selectedGuestToken]
  );

  const seats = useMemo(() => buildCeremonySeats(layout, guests), [layout, guests]);
  const leftSeats = useMemo(() => seats.filter((seat) => seat.side === "left"), [seats]);
  const rightSeats = useMemo(() => seats.filter((seat) => seat.side === "right"), [seats]);

  function clearMessages() {
    setNotice(null);
    setWarnings([]);
  }

  async function handleSaveLayout() {
    try {
      clearMessages();
      const nextLayout = await updateCeremonyLayoutConfig(guests, {
        leftRows: Number(leftRowsDraft),
        rightRows: Number(rightRowsDraft),
        seatsPerRow: Number(seatsPerRowDraft),
      });
      setLayout(nextLayout);
      setNotice({ type: "success", text: "Configuración de ceremonia guardada." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar la configuración.",
      });
    }
  }

  async function applySeatAssignment(guestToken: string, seat: CeremonySeatAssignment) {
    try {
      clearMessages();
      const nextGuests = await assignGuestToCeremonySeat(guests, layout, guestToken, seat);
      setGuests(nextGuests);
      setSelectedGuestToken(null);
      setNotice({ type: "success", text: "Invitado asignado al asiento de ceremonia." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo actualizar la asignación.",
      });
    }
  }

  async function handleUnassign(guestToken: string) {
    try {
      clearMessages();
      const nextGuests = await unassignGuestFromCeremony(guests, guestToken);
      setGuests(nextGuests);
      if (selectedGuestToken === guestToken) {
        setSelectedGuestToken(null);
      }
      setNotice({ type: "success", text: "Invitado devuelto a sin asignar." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo quitar la asignación.",
      });
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, guestToken: string) {
    event.dataTransfer.setData("text/plain", guestToken);
    event.dataTransfer.effectAllowed = "move";
  }

  async function handleSeatDrop(event: DragEvent<HTMLElement>, seat: CeremonySeatAssignment) {
    event.preventDefault();
    const guestToken = event.dataTransfer.getData("text/plain");
    if (!guestToken) return;
    await applySeatAssignment(guestToken, seat);
  }

  async function handleTrayDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const guestToken = event.dataTransfer.getData("text/plain");
    if (!guestToken) return;
    await handleUnassign(guestToken);
  }

  function handleSeatClick(seat: CeremonySeatAssignment, occupantToken: string | null) {
    if (selectedGuestToken) {
      void applySeatAssignment(selectedGuestToken, seat);
      return;
    }

    if (occupantToken) {
      setSelectedGuestToken(occupantToken);
      setNotice({ type: "warning", text: "Invitado del asiento seleccionado. Toca otro asiento o quítalo." });
    }
  }

  function renderSeatBlock(side: "left" | "right") {
    const rowCount = side === "left" ? layout.leftRows : layout.rightRows;
    const sideSeats = side === "left" ? leftSeats : rightSeats;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{side === "left" ? "Bancada izquierda" : "Bancada derecha"}</h3>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
            {side === "left"
              ? `${metrics.leftAssigned}/${metrics.leftCapacity} ocupados`
              : `${metrics.rightAssigned}/${metrics.rightCapacity} ocupados`}
          </p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: rowCount }, (_, index) => index + 1).map((row) => {
            const rowSeats = sideSeats.filter((seat) => seat.row === row);
            return (
              <div key={`${side}-row-${row}`} className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.56)] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Fila {row}</p>
                  <p className="text-xs text-[var(--app-muted)]">{rowSeats.filter((seat) => seat.guestToken).length}/{layout.seatsPerRow}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                  {rowSeats.map((seat) => {
                    const occupant = seat.guestToken
                      ? guests.find((guest) => guest.token === seat.guestToken) ?? null
                      : null;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => void handleSeatDrop(event, seat)}
                        onClick={() => handleSeatClick(seat, occupant?.token ?? null)}
                        className={`min-h-[5.5rem] rounded-[18px] border px-3 py-3 text-left transition ${
                          occupant
                            ? "border-emerald-300/70 bg-emerald-50 text-emerald-900"
                            : selectedGuestToken
                              ? "border-[var(--app-accent,#b45309)] bg-amber-50"
                              : "border-[var(--app-line)] bg-white/80"
                        }`}
                        title={occupant ? `${occupant.nombre} · ${seatLabel(seat)}` : seatLabel(seat)}
                      >
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--app-muted)]">
                          A{seat.seat}
                        </p>
                        {occupant ? (
                          <>
                            <p className="mt-2 text-sm font-semibold leading-tight">{occupant.nombre}</p>
                            <p className="mt-1 text-xs text-[var(--app-muted)]">
                              {getGuestTypeLabel(occupant)}
                            </p>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--app-muted)]">
                            {selectedGuestToken ? "Tocar para asignar" : "Libre"}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="app-surface p-8 text-[var(--app-ink)]">
        <p className="app-kicker">Ceremonia</p>
        <h1 className="app-page-title mt-4">Organizador visual</h1>
        <p className="mt-3 text-[var(--app-muted)]">Cargando invitados reales y layout de ceremonia...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Ceremonia</p>
        <h1 className="app-page-title mt-4">Organizador visual de ceremonia</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Usa los mismos invitados confirmados del sistema que ya alimentan RSVP, invitados y mesas.
          Aquí solo decidimos su posición en el croquis de ceremonia.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Confirmados activos</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.totalConfirmados}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Asignados</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.totalAsignados}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Sin asignar</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.totalSinAsignar}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Izquierda</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.leftAssigned}/{metrics.leftCapacity}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Derecha</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.rightAssigned}/{metrics.rightCapacity}</p>
          </article>
        </div>
      </div>

      {notice ? (
        <div
          className={`app-panel p-4 text-sm ${
            notice.type === "error"
              ? "border-red-300/60 text-red-700"
              : notice.type === "warning"
                ? "border-amber-300/70 text-amber-800"
                : "border-emerald-300/60 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="app-panel space-y-2 p-4 text-sm text-amber-800">
          {warnings.map((warning, index) => (
            <p key={`${warning}-${index}`}>{warning}</p>
          ))}
        </div>
      ) : null}

      <div className="app-panel grid gap-4 p-5 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Filas izquierda</span>
          <input
            type="number"
            min="1"
            value={leftRowsDraft}
            onChange={(event) => setLeftRowsDraft(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Filas derecha</span>
          <input
            type="number"
            min="1"
            value={rightRowsDraft}
            onChange={(event) => setRightRowsDraft(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Asientos por fila</span>
          <input
            type="number"
            min="1"
            value={seatsPerRowDraft}
            onChange={(event) => setSeatsPerRowDraft(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          />
        </label>
        <button type="button" onClick={() => void handleSaveLayout()} className="app-button-primary lg:justify-self-end">
          Guardar layout
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside
          className="space-y-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => void handleTrayDrop(event)}
        >
          <section className="app-panel space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="app-section-heading">Bandeja de invitados</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  Misma base real de `Guest`. Arrastra o selecciona y toca un asiento.
                </p>
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
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nombre"
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                />

                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as CeremonyGuestFilter)}
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                >
                  <option value="sin_asignar">Sin asignar</option>
                  <option value="asignados">Asignados</option>
                  <option value="todos">Todos</option>
                </select>

                {selectedGuest ? (
                  <div className="rounded-[18px] border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Invitado seleccionado: <strong>{selectedGuest.nombre}</strong>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedGuest.ceremonySeat ? (
                        <button
                          type="button"
                          onClick={() => void handleUnassign(selectedGuest.token)}
                          className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs"
                        >
                          Devolver a sin asignar
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSelectedGuestToken(null)}
                        className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs"
                      >
                        Quitar selección
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {guestCards.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-[var(--app-line)] bg-white/50 px-4 py-6 text-sm text-[var(--app-muted)]">
                      No hay invitados para ese filtro.
                    </div>
                  ) : (
                    guestCards.map((guest) => {
                      const fullGuest = guests.find((entry) => entry.token === guest.token);
                      if (!fullGuest) return null;

                      return (
                        <article
                          key={guest.token}
                          draggable
                          onDragStart={(event) => handleDragStart(event, guest.token)}
                          className={`rounded-[20px] border px-4 py-3 shadow-[var(--app-shadow-soft)] ${
                            selectedGuestToken === guest.token
                              ? "border-amber-300/90 bg-amber-50"
                              : "border-[var(--app-line)] bg-white/82"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedGuestToken((current) =>
                                    current === guest.token ? null : guest.token
                                  )
                                }
                                className="text-left text-sm font-semibold"
                              >
                                {guest.nombre}
                              </button>
                              <p className="mt-1 text-xs text-[var(--app-muted)]">
                                {getGuestTypeLabel(fullGuest)} · {guest.estado}
                              </p>
                              <p className="mt-1 text-xs text-[var(--app-muted)]">
                                {guest.ceremonySeat ? `Asignado: ${seatLabel(guest.ceremonySeat)}` : "Sin asignar en ceremonia"}
                              </p>
                            </div>
                            {guest.ceremonySeat ? (
                              <button
                                type="button"
                                onClick={() => void handleUnassign(guest.token)}
                                className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs"
                              >
                                Quitar
                              </button>
                            ) : null}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[var(--app-line)] bg-white/50 px-4 py-6 text-sm text-[var(--app-muted)]">
                Arrastra aquí una tarjeta para devolverla a “sin asignar”.
              </div>
            )}
          </section>
        </aside>

        <section className="app-panel p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="app-section-heading">Croquis de ceremonia</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Estructura base con bancada izquierda, pasillo central y bancada derecha.
              </p>
            </div>
            <div className="rounded-full border border-[var(--app-line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
              {layout.centerAisleLabel}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)] xl:items-start">
            {renderSeatBlock("left")}

            <div className="flex min-h-[16rem] items-center justify-center rounded-[26px] border border-dashed border-[var(--app-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,247,243,0.92))] p-4">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  Pasillo
                </p>
                <p className="mt-3 text-sm text-[var(--app-muted)]">
                  Selecciona un invitado y toca un asiento libre.
                </p>
              </div>
            </div>

            {renderSeatBlock("right")}
          </div>
        </section>
      </div>
    </section>
  );
}
