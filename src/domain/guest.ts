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
}

export type GuestSession = Pick<
  Guest,
  "token" | "nombre" | "mesa" | "esAdulto" | "edad" | "grupoTipo" | "tipo"
>;
