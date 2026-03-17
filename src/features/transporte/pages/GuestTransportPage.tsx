import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  borrarSolicitudTransporte,
  guardarSolicitudTransporte,
  obtenerAvisosTransporte,
  obtenerSolicitudesTransportePorInvitado,
  obtenerTransportes,
} from "../../../services/transporteService";
import { useAuth } from "../../../store/useAuth";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../../../services/devAccessService";
import type { GuestTransportRequest, TransportNotice, TransportTrip } from "../types";
import { getGuestTransportStatus, getTripRemainingSeats, sortNotices, sortTripsForGuests } from "../utils";
import { TransportStatusBadge } from "../components/TransportStatusBadge";

function createEmptyRequest(guestToken: string, guestName: string): GuestTransportRequest {
  return {
    id: `transport-profile-${guestToken}`,
    guestToken,
    guestName,
    transportId: "",
    seats: 1,
    needsTransport: true,
    direction: "ida",
    origin: "",
    peopleCount: 1,
    reducedMobility: false,
    childSeat: false,
    status: "pendiente",
    hasCarOffer: false,
    offeredSeats: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default function GuestTransportPage() {
  const { slug } = useParams();
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);

  const [trips, setTrips] = useState<TransportTrip[]>([]);
  const [notices, setNotices] = useState<TransportNotice[]>([]);
  const [guestRequests, setGuestRequests] = useState<GuestTransportRequest[]>([]);
  const [form, setForm] = useState<GuestTransportRequest | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const [loadedTrips, loadedNotices] = await Promise.all([
        obtenerTransportes(),
        obtenerAvisosTransporte(),
      ]);
      setTrips(sortTripsForGuests(loadedTrips.filter((trip) => trip.estado === "activo" || trip.estado === "completo")));
      setNotices(sortNotices(loadedNotices));

      if (!effectiveGuest) return;
      const existing = await obtenerSolicitudesTransportePorInvitado(effectiveGuest.token);
      setGuestRequests(existing);
      const profile = existing.find((entry) => entry.id === `transport-profile-${effectiveGuest.token}`) ?? existing[0];
      setForm(profile ?? createEmptyRequest(effectiveGuest.token, effectiveGuest.nombre));
    })();
  }, [effectiveGuest]);

  const currentStatus = useMemo(() => {
    if (!form) return "no_respondido" as const;
    return getGuestTransportStatus(form);
  }, [form]);

  function getTripRequest(tripId: string) {
    return guestRequests.find((entry) => entry.transportId === tripId && entry.needsTransport);
  }

  async function handleSaveProfile() {
    if (!form || !effectiveGuest) return;
    const next = { ...form, updatedAt: Date.now() };
    await guardarSolicitudTransporte(next);
    setForm(next);
    setGuestRequests(await obtenerSolicitudesTransportePorInvitado(effectiveGuest.token));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function handleTripReservation(trip: TransportTrip) {
    if (!effectiveGuest || !form) return;
    const tripRequest: GuestTransportRequest = {
      ...form,
      id: `${effectiveGuest.token}-${trip.id}`,
      transportId: trip.id,
      seats: Math.max(1, form.peopleCount),
      needsTransport: true,
      status: getTripRemainingSeats(trip) > 0 ? "solicitado" : "sin_solucion",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await guardarSolicitudTransporte(tripRequest);
    setGuestRequests(await obtenerSolicitudesTransportePorInvitado(effectiveGuest.token));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function handleCancelTrip(tripId: string) {
    if (!effectiveGuest) return;
    await borrarSolicitudTransporte(effectiveGuest.token, tripId);
    setGuestRequests(await obtenerSolicitudesTransportePorInvitado(effectiveGuest.token));
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Información</p>
        <h1 className="app-page-title mt-4">Desplazamientos</h1>
        <p className="mt-3 app-subtitle">
          Indica si necesitas transporte, ofrece plazas si vienes en coche y revisa los trayectos oficiales disponibles.
        </p>
      </div>

      <section className="app-panel p-5 sm:p-6">
        <h2 className="app-section-heading">Mi situación</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <TransportStatusBadge tone={currentStatus} />
          {saved ? <p className="text-sm text-emerald-600">Cambios guardados.</p> : null}
        </div>
      </section>

      {form && effectiveGuest ? (
        <section className="app-panel space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="app-section-heading">Mi formulario de transporte</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Campo preparado para enlazar en el futuro con alojamientos y origen del invitado.
            </p>
          </div>

          {DEV_OPEN_PUBLIC_WEDDING && !invitado ? (
            <p className="text-sm text-[var(--app-muted)]">
              Modo desarrollo activo: simulando respuesta de invitado.
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">Necesito transporte</span>
              <select className="w-full p-3" value={form.needsTransport ? "si" : "no"} onChange={(e) => setForm({ ...form, needsTransport: e.target.value === "si", status: e.target.value === "si" ? "pendiente" : "resuelto" })}>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">Trayecto</span>
              <select className="w-full p-3" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as GuestTransportRequest["direction"] })}>
                <option value="ida">Ida</option>
                <option value="vuelta">Vuelta</option>
                <option value="ambas">Ambas</option>
              </select>
            </label>
            <input className="w-full p-3" placeholder="Salgo desde" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            <input className="w-full p-3" type="number" min="1" placeholder="Cuántas personas somos" value={form.peopleCount} onChange={(e) => setForm({ ...form, peopleCount: Math.max(1, Number(e.target.value || 1)), seats: Math.max(1, Number(e.target.value || 1)) })} />
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm">
              <input type="checkbox" checked={form.hasCarOffer} onChange={(e) => setForm({ ...form, hasCarOffer: e.target.checked })} />
              Tengo coche y ofrezco plazas
            </label>
            <input className="w-full p-3" type="number" min="0" placeholder="Plazas ofrecidas" value={form.offeredSeats} onChange={(e) => setForm({ ...form, offeredSeats: Math.max(0, Number(e.target.value || 0)) })} disabled={!form.hasCarOffer} />
            <input className="w-full p-3" placeholder="Horario aproximado" value={form.approximateSchedule ?? ""} onChange={(e) => setForm({ ...form, approximateSchedule: e.target.value })} disabled={!form.hasCarOffer} />
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm">
              <input type="checkbox" checked={form.reducedMobility} onChange={(e) => setForm({ ...form, reducedMobility: e.target.checked })} />
              Movilidad reducida
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm">
              <input type="checkbox" checked={form.childSeat} onChange={(e) => setForm({ ...form, childSeat: e.target.checked })} />
              Necesito silla infantil
            </label>
            <textarea className="w-full p-3 lg:col-span-2" rows={3} placeholder="Comentarios" value={form.comments ?? ""} onChange={(e) => setForm({ ...form, comments: e.target.value, notes: e.target.value })} />
          </div>

          <button type="button" onClick={() => void handleSaveProfile()} className="app-button-primary">
            Guardar mi situación
          </button>
        </section>
      ) : (
        <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
          Identifícate como invitado para indicar tu situación de transporte.
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="app-section-heading">Opciones disponibles</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Trayectos activos publicados por los novios.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {trips.map((trip) => {
            const tripRequest = getTripRequest(trip.id);
            const remaining = getTripRemainingSeats(trip);
            return (
              <article key={trip.id} className="app-surface-soft p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{trip.titulo}</h3>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{trip.origen} {"->"} {trip.destino}</p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{trip.fecha} · {trip.horaSalida}</p>
                  </div>
                  <TransportStatusBadge tone={trip.estado} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  <span className="rounded-full border border-[var(--app-line)] px-3 py-2">{remaining} plazas restantes</span>
                  <span className="rounded-full border border-[var(--app-line)] px-3 py-2">{trip.requiereReserva ? "Requiere reserva" : "Acceso libre"}</span>
                  {typeof trip.precioOpcional === "number" ? <span className="rounded-full border border-[var(--app-line)] px-3 py-2">{trip.precioOpcional} EUR</span> : null}
                </div>
                {trip.observaciones ? <p className="mt-4 text-sm text-[var(--app-muted)]">{trip.observaciones}</p> : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {tripRequest ? (
                    <>
                      <button type="button" onClick={() => void handleCancelTrip(trip.id)} className="app-button-secondary">
                        Cancelar solicitud
                      </button>
                      <p className="text-sm text-[var(--app-muted)]">Solicitud activa para este trayecto.</p>
                    </>
                  ) : remaining > 0 ? (
                    <button type="button" onClick={() => void handleTripReservation(trip)} className="app-button-primary">
                      Solicitar plaza
                    </button>
                  ) : (
                    <button type="button" disabled className="app-button-secondary opacity-60">
                      Completo
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="app-section-heading">Mis avisos</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Información útil y cambios de última hora.</p>
        </div>
        <div className="space-y-3">
          {notices.map((notice) => (
            <article key={notice.id} className="app-surface-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{notice.titulo}</h3>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">{notice.mensaje}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">{notice.fechaHora}</p>
                </div>
                <TransportStatusBadge tone={notice.tipo} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
