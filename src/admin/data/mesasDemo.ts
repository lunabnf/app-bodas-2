import type { Guest } from "../../domain/guest";
import type { Table } from "../../domain/table";

export const invitadosDemo: Guest[] = [
  {
    id: "1",
    token: "demo-ana-luna",
    nombre: "Ana Luna",
    tipo: "Adulto",
    grupo: "Familia",
    grupoTipo: "familia_novia",
    estado: "confirmado",
    mesa: "1",
    esAdulto: true,
  },
  {
    id: "2",
    token: "demo-carlos-ruiz",
    nombre: "Carlos Ruiz",
    tipo: "Adulto",
    grupo: "Amigos",
    grupoTipo: "amigos_comunes",
    estado: "confirmado",
    mesa: "2",
    esAdulto: true,
  },
  {
    id: "3",
    token: "demo-maria-perez",
    nombre: "María Pérez",
    tipo: "Adulto",
    grupo: "Amigos",
    grupoTipo: "amigos_novia",
    estado: "pendiente",
    esAdulto: true,
  },
];

export const mesasDemo: Table[] = [
  { id: "1", nombre: "Mesa 1", capacidad: 10, invitadosTokens: ["demo-ana-luna"], captainToken: null },
  { id: "2", nombre: "Mesa 2", capacidad: 10, invitadosTokens: ["demo-carlos-ruiz"], captainToken: null },
  { id: "3", nombre: "Mesa 3", capacidad: 10, invitadosTokens: [], captainToken: null },
];
