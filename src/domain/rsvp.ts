export type RsvpAttendance = "" | "si" | "no";

export interface RsvpPersonDetail {
  nombre: string;
  edad?: number;
  alergias: string[];
  intolerancias?: string;
}

export interface GuestRsvp {
  guestToken: string;
  guestName: string;
  attending: RsvpAttendance;
  adultos: number;
  ninos: number;
  detalles: RsvpPersonDetail[];
  nota?: string;
  timestamp: number;
}
