import type {
  CarpoolOffer,
  GuestTransportRequest,
  GuestTransportStatus,
  TransportDashboardStats,
  TransportNotice,
  TransportTrip,
} from "./types";

export function getTripRemainingSeats(trip: TransportTrip) {
  return Math.max(0, trip.plazasDisponibles - trip.plazasOcupadas);
}

export function deriveTransportDashboardStats(
  trips: TransportTrip[],
  requests: GuestTransportRequest[]
): TransportDashboardStats {
  const needTransport = requests.filter((request) => request.needsTransport);
  const resolved = needTransport.filter(
    (request) => request.status === "asignado" || request.status === "resuelto"
  );
  const unresolved = needTransport.filter(
    (request) => request.status === "pendiente" || request.status === "solicitado" || request.status === "sin_solucion"
  );

  return {
    guestsNeedTransport: needTransport.length,
    guestsResolved: resolved.length,
    guestsUnresolved: unresolved.length,
    carpoolDrivers: requests.filter((request) => request.hasCarOffer && request.offeredSeats > 0).length,
    activeTrips: trips.filter((trip) => trip.estado === "activo").length,
    totalSeats: trips.reduce((sum, trip) => sum + trip.plazasDisponibles, 0),
    occupiedSeats: trips.reduce((sum, trip) => sum + trip.plazasOcupadas, 0),
  };
}

export function deriveCarpoolOffers(requests: GuestTransportRequest[]): CarpoolOffer[] {
  return requests
    .filter((request) => request.hasCarOffer && request.offeredSeats > 0)
    .map((request) => ({
      id: `carpool-${request.id}`,
      driverName: request.guestName,
      origin: request.origin,
      direction: request.direction,
      offeredSeats: request.offeredSeats,
      occupiedSeats: 0,
      freeSeats: request.offeredSeats,
      ...(request.approximateSchedule ? { approximateSchedule: request.approximateSchedule } : {}),
      ...(request.comments ? { comments: request.comments } : {}),
      guestToken: request.guestToken,
    }));
}

export function deriveTransportIncidents(trips: TransportTrip[], requests: GuestTransportRequest[]) {
  const issues: string[] = [];

  const unresolvedGuests = requests.filter(
    (request) =>
      request.needsTransport &&
      (request.status === "pendiente" || request.status === "solicitado" || request.status === "sin_solucion")
  );
  if (unresolvedGuests.length > 0) {
    issues.push(`${unresolvedGuests.length} invitado(s) necesitan transporte y siguen sin resolver.`);
  }

  const fullTrips = trips.filter((trip) => trip.estado === "completo" || getTripRemainingSeats(trip) === 0);
  if (fullTrips.length > 0) {
    issues.push(`${fullTrips.length} trayecto(s) están completos o sin plazas libres.`);
  }

  const specialNeeds = requests.filter(
    (request) => request.needsTransport && (request.reducedMobility || request.childSeat) && request.status !== "resuelto"
  );
  if (specialNeeds.length > 0) {
    issues.push(`${specialNeeds.length} solicitud(es) con movilidad reducida o silla infantil siguen pendientes.`);
  }

  return issues;
}

export function getGuestTransportStatus(request: GuestTransportRequest | null): GuestTransportStatus {
  if (!request) return "no_respondido";
  if (request.hasCarOffer && request.offeredSeats > 0) return "ofrezco_plazas";
  if (!request.needsTransport) return "no_necesito";
  if (request.status === "asignado" || request.status === "resuelto") return "tengo_plaza_asignada";
  return "he_solicitado";
}

export function sortTripsForGuests(trips: TransportTrip[]) {
  return [...trips].sort((a, b) => {
    const dateCompare = a.fecha.localeCompare(b.fecha);
    if (dateCompare !== 0) return dateCompare;
    return a.horaSalida.localeCompare(b.horaSalida);
  });
}

export function sortNotices(notices: TransportNotice[]) {
  return [...notices].sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
}
