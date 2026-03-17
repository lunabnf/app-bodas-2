export type TransportType =
  | "bus"
  | "microbus"
  | "transfer"
  | "coche_compartido"
  | "otro";

export type TransportTripState = "borrador" | "activo" | "completo" | "cancelado";
export type TripDirection = "ida" | "vuelta" | "ambas";
export type GuestTransportState =
  | "pendiente"
  | "solicitado"
  | "asignado"
  | "resuelto"
  | "sin_solucion";
export type TransportNoticeType = "info" | "importante" | "urgente";
export type GuestTransportStatus =
  | "no_respondido"
  | "no_necesito"
  | "he_solicitado"
  | "tengo_plaza_asignada"
  | "ofrezco_plazas";

export interface TransportTrip {
  id: string;
  titulo: string;
  nombre: string;
  origen: string;
  destino: string;
  fecha: string;
  horaSalida: string;
  horaLlegadaEstimada: string;
  hora: string;
  tipoTransporte: TransportType;
  plazasDisponibles: number;
  plazasOcupadas: number;
  capacidad: number;
  requiereReserva: boolean;
  precioOpcional?: number;
  puntoEncuentro: string;
  responsable: string;
  contacto: string;
  observaciones: string;
  notas: string;
  estado: TransportTripState;
}

export interface GuestTransportRequest {
  id: string;
  guestToken: string;
  guestName: string;
  transportId: string;
  seats: number;
  notes?: string;
  needsTransport: boolean;
  direction: TripDirection;
  origin: string;
  peopleCount: number;
  reducedMobility: boolean;
  childSeat: boolean;
  comments?: string;
  status: GuestTransportState;
  assignedTripId?: string;
  hasCarOffer: boolean;
  offeredSeats: number;
  approximateSchedule?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CarpoolOffer {
  id: string;
  driverName: string;
  origin: string;
  direction: TripDirection;
  offeredSeats: number;
  occupiedSeats: number;
  freeSeats: number;
  approximateSchedule?: string;
  comments?: string;
  guestToken: string;
}

export interface TransportNotice {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TransportNoticeType;
  fechaHora: string;
  trayectoRelacionado?: string;
}

export interface TransportDashboardStats {
  guestsNeedTransport: number;
  guestsResolved: number;
  guestsUnresolved: number;
  carpoolDrivers: number;
  activeTrips: number;
  totalSeats: number;
  occupiedSeats: number;
}

export type TransportOption = TransportTrip;
export type TransportRequest = GuestTransportRequest;
