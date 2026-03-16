export type RsvpAttendance = "" | "si" | "no";

export interface RsvpPersonDetail {
  nombre: string;
  edad?: number;
  alergias: string[];
  intolerancias?: string;
  tipo?: "Adulto" | "Niño";
  guestToken?: string;
  accessEnabled?: boolean;
}

export interface GuestRsvp {
  guestToken: string;
  guestName: string;
  attending: RsvpAttendance;
  adultos: number;
  ninos: number;
  detalles: RsvpPersonDetail[];
  nota?: string;
  invitationToken?: string;
  invitationStatus?: "pendiente" | "respondida" | "confirmada" | "rechazada" | "modificada";
  rejectionReason?: string;
  timestamp: number;
}
