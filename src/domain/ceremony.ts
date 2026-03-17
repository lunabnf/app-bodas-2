import type { CeremonySeatAssignment, CeremonySeatSide, Guest } from "./guest";

export type CeremonyLayoutType = "two_blocks_center_aisle";

export type CeremonyLayout = {
  layoutType: CeremonyLayoutType;
  leftRows: number;
  rightRows: number;
  seatsPerRow: number;
  centerAisleLabel?: string;
  updatedAt: number;
};

export type CeremonySeat = CeremonySeatAssignment & {
  id: string;
  guestToken: string | null;
  state: "libre" | "ocupado";
};

export type CeremonyGuestStatus = "confirmado" | "cancelado";

export type CeremonyGuestCard = {
  token: Guest["token"];
  nombre: Guest["nombre"];
  tipo: Guest["tipo"];
  estado: CeremonyGuestStatus;
  mesa?: Guest["mesa"];
  ceremonySeat?: CeremonySeatAssignment;
};

export type CeremonyWorkspace = {
  layout: CeremonyLayout;
  guests: Guest[];
  warnings: string[];
};

export type CeremonyGuestFilter = "sin_asignar" | "asignados" | "todos";

export function buildCeremonySeatId(side: CeremonySeatSide, row: number, seat: number) {
  return `${side}-${row}-${seat}`;
}
