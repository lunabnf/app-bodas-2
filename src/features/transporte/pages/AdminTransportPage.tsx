import { useEffect, useMemo, useState } from "react";
import type { GuestTransportRequest, TransportNotice, TransportTrip } from "../types";
import {
  guardarAvisoTransporte,
  guardarSolicitudTransporte,
  guardarTransporte,
  obtenerAvisosTransporte,
  obtenerSolicitudesTransporte,
  obtenerTransportes,
} from "../../../services/transporteService";
import { deriveCarpoolOffers, deriveTransportDashboardStats, deriveTransportIncidents, getTripRemainingSeats, sortNotices } from "../utils";
import { TransportKpiCard } from "../components/TransportKpiCard";
import { TransportStatusBadge } from "../components/TransportStatusBadge";

function createEmptyTrip(): TransportTrip {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    nombre: "",
    origen: "",
    destino: "",
    fecha: "",
    horaSalida: "",
    horaLlegadaEstimada: "",
    hora: "",
    tipoTransporte: "bus",
    plazasDisponibles: 0,
    plazasOcupadas: 0,
    capacidad: 0,
    requiereReserva: true,
    puntoEncuentro: "",
    responsable: "",
    contacto: "",
    observaciones: "",
    notas: "",
    estado: "borrador",
  };
}

function createEmptyNotice(): TransportNotice {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    mensaje: "",
    tipo: "info",
    fechaHora: new Date().toISOString().slice(0, 16),
  };
}

function updateTripOptionalNumber(
  current: TransportTrip,
  value: string
): TransportTrip {
  const parsed = value ? Number(value) : NaN;
  if (!Number.isFinite(parsed)) {
    const { precioOpcional: _precioOpcional, ...rest } = current;
    return rest;
  }
  return {
    ...current,
    precioOpcional: parsed,
  };
}

function updateNoticeRelatedTrip(
  current: TransportNotice,
  value: string
): TransportNotice {
  if (!value) {
    const { trayectoRelacionado: _trayectoRelacionado, ...rest } = current;
    return rest;
  }
  return {
    ...current,
    trayectoRelacionado: value,
  };
}

export default function AdminTransportPage() {
  const [trips, setTrips] = useState<TransportTrip[]>([]);
  const [requests, setRequests] = useState<GuestTransportRequest[]>([]);
  const [notices, setNotices] = useState<TransportNotice[]>([]);
  const [tripDraft, setTripDraft] = useState<TransportTrip>(createEmptyTrip());
  const [noticeDraft, setNoticeDraft] = useState<TransportNotice>(createEmptyNotice());
  const [query, setQuery] = useState("");

  useEffect(() => {
    void (async () => {
      const [loadedTrips, loadedRequests, loadedNotices] = await Promise.all([
        obtenerTransportes(),
        obtenerSolicitudesTransporte(),
        obtenerAvisosTransporte(),
      ]);
      setTrips(loadedTrips);
      setRequests(loadedRequests);
      setNotices(loadedNotices);
    })();
  }, []);

  const stats = useMemo(() => deriveTransportDashboardStats(trips, requests), [trips, requests]);
  const incidents = useMemo(() => deriveTransportIncidents(trips, requests), [trips, requests]);
  const carpoolOffers = useMemo(() => deriveCarpoolOffers(requests), [requests]);
  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return requests.filter((request) =>
      normalized.length === 0 ||
      request.guestName.toLowerCase().includes(normalized) ||
      request.origin.toLowerCase().includes(normalized)
    );
  }, [requests, query]);

  async function handleSaveTrip() {
    const nextTrip: TransportTrip = {
      ...tripDraft,
      nombre: tripDraft.titulo.trim() || tripDraft.nombre.trim() || "Trayecto",
      hora: tripDraft.horaSalida,
      capacidad: tripDraft.plazasDisponibles,
      notas: tripDraft.observaciones,
    };
    await guardarTransporte(nextTrip);
    const loadedTrips = await obtenerTransportes();
    setTrips(loadedTrips);
    setTripDraft(createEmptyTrip());
  }

  async function handleSaveNotice() {
    await guardarAvisoTransporte(noticeDraft);
    setNotices(await obtenerAvisosTransporte());
    setNoticeDraft(createEmptyNotice());
  }

  async function handleRequestStatus(request: GuestTransportRequest, status: GuestTransportRequest["status"]) {
    await guardarSolicitudTransporte({
      ...request,
      status,
      updatedAt: Date.now(),
    });
    setRequests(await obtenerSolicitudesTransporte());
  }

  return (
    <section className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Desplazamientos</p>
        <h1 className="app-page-title mt-4">Centro de coordinación del transporte</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Gestiona trayectos oficiales, detecta demanda real y coordina coches compartidos desde una sola vista.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TransportKpiCard label="Invitados que necesitan transporte" value={stats.guestsNeedTransport} />
        <TransportKpiCard label="Transporte resuelto" value={stats.guestsResolved} />
        <TransportKpiCard label="Sin resolver" value={stats.guestsUnresolved} />
        <TransportKpiCard label="Ofrecen coche" value={stats.carpoolDrivers} />
        <TransportKpiCard label="Trayectos activos" value={stats.activeTrips} />
        <TransportKpiCard label="Plazas totales / ocupadas" value={`${stats.totalSeats} / ${stats.occupiedSeats}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="app-panel space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="app-section-heading">Trayectos oficiales</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">Crea rutas públicas listas para reservar.</p>
            </div>
            <button type="button" onClick={() => setTripDraft(createEmptyTrip())} className="app-button-secondary">
              Crear trayecto
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input className="w-full p-3" placeholder="Título" value={tripDraft.titulo} onChange={(e) => setTripDraft({ ...tripDraft, titulo: e.target.value })} />
            <select className="w-full p-3" value={tripDraft.tipoTransporte} onChange={(e) => setTripDraft({ ...tripDraft, tipoTransporte: e.target.value as TransportTrip["tipoTransporte"] })}>
              <option value="bus">Bus</option>
              <option value="microbus">Microbús</option>
              <option value="transfer">Transfer</option>
              <option value="coche_compartido">Coche compartido</option>
              <option value="otro">Otro</option>
            </select>
            <input className="w-full p-3" placeholder="Origen" value={tripDraft.origen} onChange={(e) => setTripDraft({ ...tripDraft, origen: e.target.value })} />
            <input className="w-full p-3" placeholder="Destino" value={tripDraft.destino} onChange={(e) => setTripDraft({ ...tripDraft, destino: e.target.value })} />
            <input className="w-full p-3" type="date" value={tripDraft.fecha} onChange={(e) => setTripDraft({ ...tripDraft, fecha: e.target.value })} />
            <input className="w-full p-3" type="time" value={tripDraft.horaSalida} onChange={(e) => setTripDraft({ ...tripDraft, horaSalida: e.target.value })} />
            <input className="w-full p-3" type="time" value={tripDraft.horaLlegadaEstimada} onChange={(e) => setTripDraft({ ...tripDraft, horaLlegadaEstimada: e.target.value })} />
            <input className="w-full p-3" type="number" min="0" placeholder="Plazas" value={tripDraft.plazasDisponibles || ""} onChange={(e) => setTripDraft({ ...tripDraft, plazasDisponibles: Number(e.target.value || 0) })} />
            <input className="w-full p-3" placeholder="Punto de encuentro" value={tripDraft.puntoEncuentro} onChange={(e) => setTripDraft({ ...tripDraft, puntoEncuentro: e.target.value })} />
            <input className="w-full p-3" placeholder="Responsable" value={tripDraft.responsable} onChange={(e) => setTripDraft({ ...tripDraft, responsable: e.target.value })} />
            <input className="w-full p-3" placeholder="Contacto" value={tripDraft.contacto} onChange={(e) => setTripDraft({ ...tripDraft, contacto: e.target.value })} />
            <input className="w-full p-3" placeholder="Precio opcional" value={tripDraft.precioOpcional ?? ""} onChange={(e) => setTripDraft((current) => updateTripOptionalNumber(current, e.target.value))} />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={tripDraft.requiereReserva} onChange={(e) => setTripDraft({ ...tripDraft, requiereReserva: e.target.checked })} />
              Requiere reserva
            </label>
            <select className="w-full p-3" value={tripDraft.estado} onChange={(e) => setTripDraft({ ...tripDraft, estado: e.target.value as TransportTrip["estado"] })}>
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="completo">Completo</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <textarea className="w-full p-3 md:col-span-2" rows={3} placeholder="Observaciones" value={tripDraft.observaciones} onChange={(e) => setTripDraft({ ...tripDraft, observaciones: e.target.value })} />
            <button type="button" onClick={() => void handleSaveTrip()} className="app-button-primary md:col-span-2">
              Guardar trayecto
            </button>
          </div>

          <div className="space-y-3">
            {trips.map((trip) => (
              <article key={trip.id} className="app-surface-soft p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{trip.titulo}</h3>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{trip.origen} {"->"} {trip.destino}</p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{trip.fecha} · {trip.horaSalida} · {getTripRemainingSeats(trip)} plazas libres</p>
                  </div>
                  <TransportStatusBadge tone={trip.estado} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <section className="app-panel space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="app-section-heading">Avisos</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">Mensajes visibles para invitados.</p>
            </div>
            <input className="w-full p-3" placeholder="Título" value={noticeDraft.titulo} onChange={(e) => setNoticeDraft({ ...noticeDraft, titulo: e.target.value })} />
            <textarea className="w-full p-3" rows={3} placeholder="Mensaje" value={noticeDraft.mensaje} onChange={(e) => setNoticeDraft({ ...noticeDraft, mensaje: e.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <select className="w-full p-3" value={noticeDraft.tipo} onChange={(e) => setNoticeDraft({ ...noticeDraft, tipo: e.target.value as TransportNotice["tipo"] })}>
                <option value="info">Info</option>
                <option value="importante">Importante</option>
                <option value="urgente">Urgente</option>
              </select>
              <input className="w-full p-3" type="datetime-local" value={noticeDraft.fechaHora} onChange={(e) => setNoticeDraft({ ...noticeDraft, fechaHora: e.target.value })} />
            </div>
            <select className="w-full p-3" value={noticeDraft.trayectoRelacionado ?? ""} onChange={(e) => setNoticeDraft((current) => updateNoticeRelatedTrip(current, e.target.value))}>
              <option value="">Sin trayecto relacionado</option>
              {trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.titulo}</option>)}
            </select>
            <button type="button" onClick={() => void handleSaveNotice()} className="app-button-primary">Guardar aviso</button>
            <div className="space-y-3">
              {sortNotices(notices).map((notice) => (
                <article key={notice.id} className="app-surface-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{notice.titulo}</h3>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">{notice.mensaje}</p>
                    </div>
                    <TransportStatusBadge tone={notice.tipo} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="app-panel p-5 sm:p-6">
            <h2 className="app-section-heading">Incidencias</h2>
            <div className="mt-4 space-y-3">
              {incidents.length === 0 ? (
                <p className="text-sm text-[var(--app-muted)]">No hay incidencias abiertas.</p>
              ) : (
                incidents.map((incident) => (
                  <div key={incident} className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {incident}
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </div>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h2 className="app-section-heading">Solicitudes de invitados</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">Estado por invitado y necesidades especiales.</p>
          </div>
          <input
            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
            placeholder="Buscar invitado u origen"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredRequests.map((request) => (
            <article key={request.id} className="app-surface-soft p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{request.guestName}</h3>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">
                    {request.needsTransport ? "Necesita transporte" : "No necesita transporte"} · {request.direction}
                  </p>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">
                    {request.origin || "Origen no indicado"} · {request.peopleCount} persona(s)
                  </p>
                </div>
                <TransportStatusBadge tone={request.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                {request.reducedMobility ? <span className="rounded-full border border-[var(--app-line)] px-3 py-2">Movilidad reducida</span> : null}
                {request.childSeat ? <span className="rounded-full border border-[var(--app-line)] px-3 py-2">Silla infantil</span> : null}
                {request.hasCarOffer ? <span className="rounded-full border border-[var(--app-line)] px-3 py-2">Ofrece {request.offeredSeats} plazas</span> : null}
              </div>

              {request.comments || request.notes ? (
                <p className="mt-3 text-sm text-[var(--app-muted)]">{request.comments ?? request.notes}</p>
              ) : null}

              <div className="mt-4">
                <select
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                  value={request.status}
                  onChange={(event) => void handleRequestStatus(request, event.target.value as GuestTransportRequest["status"])}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="solicitado">Solicitado</option>
                  <option value="asignado">Asignado</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="sin_solucion">Sin solución</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <h2 className="app-section-heading">Coches compartidos</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {carpoolOffers.map((offer) => (
            <article key={offer.id} className="app-surface-soft p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{offer.driverName}</h3>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">{offer.origin} · {offer.direction}</p>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">{offer.freeSeats} plaza(s) libres</p>
                </div>
                <TransportStatusBadge tone="ofrezco_plazas" />
              </div>
              {offer.approximateSchedule ? <p className="mt-3 text-sm text-[var(--app-muted)]">{offer.approximateSchedule}</p> : null}
              {offer.comments ? <p className="mt-1 text-sm text-[var(--app-muted)]">{offer.comments}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
