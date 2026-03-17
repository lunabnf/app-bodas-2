export type GuestGroupType =
  | "familia_novia"
  | "familia_novio"
  | "amigos_novia"
  | "amigos_novio"
  | "amigos_comunes"
  | "amigos_trabajo"
  | "amigos_pueblo"
  | "proveedores"
  | "otros";

export type GuestStatus = "confirmado" | "pendiente" | "rechazado";
export type GuestType = "Adulto" | "Niño";
export type InvitationRole = "titular" | "acompanante";
export type PersonStatus = "creada" | "confirmada" | "cancelada" | "incompleta";
export type GuestAccessState =
  | "no_permitido"
  | "permitido"
  | "codigo_disponible"
  | "activado"
  | "bloqueado";
export type AssignmentState = "sin_asignar" | "asignada";
export type MenuState = "sin_definir" | "adulto" | "infantil" | "especial";
export type CeremonySeatSide = "left" | "right";

export interface CeremonySeatAssignment {
  side: CeremonySeatSide;
  row: number;
  seat: number;
}

export interface Guest {
  id: string;
  token: string;
  nombre: string;
  tipo: GuestType;
  grupo: string;
  grupoTipo: GuestGroupType;
  estado: GuestStatus;
  mesa?: string;
  esAdulto?: boolean;
  edad?: number;
  invitationToken?: string;
  invitationRole?: InvitationRole;
  personaEstado?: PersonStatus;
  accessState?: GuestAccessState;
  assignmentState?: AssignmentState;
  menuEstado?: MenuState;
  alergias?: string[];
  intolerancias?: string;
  notaPrivada?: string;
  ceremonySeat?: CeremonySeatAssignment;
}

export type GuestSession = Pick<
  Guest,
  "token" | "nombre" | "mesa" | "esAdulto" | "edad" | "grupoTipo" | "tipo"
>;
