import { z } from "zod";
import {
  transportNoticeSchema,
} from "../domain/schemas";
import type { TransportNotice, TransportOption, TransportRequest, TransportTrip, TransportType } from "../domain/transport";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";
import {
  transportNoticesMock,
  transportRequestsMock,
  transportTripsMock,
} from "../features/transporte/mockData";

const TRANSPORT_OPTIONS_KEY = "wedding.transportes";
const TRANSPORT_REQUESTS_KEY = "wedding.transportes.requests";
const TRANSPORT_NOTICES_KEY = "wedding.transportes.notices";

const transportTypes: TransportType[] = ["bus", "microbus", "transfer", "coche_compartido", "otro"];

function normalizeTransportType(value?: string): TransportType {
  return transportTypes.includes(value as TransportType) ? (value as TransportType) : "otro";
}

function normalizeTrip(raw: Partial<TransportTrip>, index: number): TransportTrip {
  const capacidad =
    typeof raw.capacidad === "number"
      ? raw.capacidad
      : typeof raw.plazasDisponibles === "number"
        ? raw.plazasDisponibles
        : 0;
  const plazasOcupadas = typeof raw.plazasOcupadas === "number" ? raw.plazasOcupadas : 0;

  return {
    id: raw.id?.trim() || `trip-${index + 1}`,
    titulo: raw.titulo?.trim() || raw.nombre?.trim() || `Trayecto ${index + 1}`,
    nombre: raw.nombre?.trim() || raw.titulo?.trim() || `Trayecto ${index + 1}`,
    origen: raw.origen?.trim() || "",
    destino: raw.destino?.trim() || "",
    fecha: raw.fecha?.trim() || "",
    horaSalida: raw.horaSalida?.trim() || raw.hora?.trim() || "",
    horaLlegadaEstimada: raw.horaLlegadaEstimada?.trim() || "",
    hora: raw.hora?.trim() || raw.horaSalida?.trim() || "",
    tipoTransporte: normalizeTransportType(raw.tipoTransporte),
    plazasDisponibles: typeof raw.plazasDisponibles === "number" ? raw.plazasDisponibles : capacidad,
    plazasOcupadas,
    capacidad,
    requiereReserva: raw.requiereReserva ?? true,
    ...(typeof raw.precioOpcional === "number" ? { precioOpcional: raw.precioOpcional } : {}),
    puntoEncuentro: raw.puntoEncuentro?.trim() || "",
    responsable: raw.responsable?.trim() || "",
    contacto: raw.contacto?.trim() || "",
    observaciones: raw.observaciones?.trim() || raw.notas?.trim() || "",
    notas: raw.notas?.trim() || raw.observaciones?.trim() || "",
    estado: raw.estado ?? "activo",
  };
}

function normalizeRequest(raw: Partial<TransportRequest>, index: number): TransportRequest {
  const seats = typeof raw.seats === "number" ? raw.seats : typeof raw.peopleCount === "number" ? raw.peopleCount : 1;
  return {
    id: raw.id?.trim() || `transport-request-${index + 1}`,
    guestToken: raw.guestToken?.trim() || "",
    guestName: raw.guestName?.trim() || "Invitado",
    transportId: raw.transportId?.trim() || raw.assignedTripId?.trim() || "",
    seats,
    ...(raw.notes?.trim() ? { notes: raw.notes.trim() } : {}),
    needsTransport: raw.needsTransport ?? Boolean(raw.transportId),
    direction: raw.direction ?? "ida",
    origin: raw.origin?.trim() || "",
    peopleCount: typeof raw.peopleCount === "number" ? raw.peopleCount : seats,
    reducedMobility: raw.reducedMobility ?? false,
    childSeat: raw.childSeat ?? false,
    ...(raw.comments?.trim() ? { comments: raw.comments.trim() } : {}),
    status: raw.status ?? (raw.transportId ? "solicitado" : "pendiente"),
    ...(raw.assignedTripId?.trim() ? { assignedTripId: raw.assignedTripId.trim() } : {}),
    hasCarOffer: raw.hasCarOffer ?? false,
    offeredSeats: typeof raw.offeredSeats === "number" ? raw.offeredSeats : 0,
    ...(raw.approximateSchedule?.trim() ? { approximateSchedule: raw.approximateSchedule.trim() } : {}),
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  };
}

function normalizeNotice(raw: Partial<TransportNotice>, index: number): TransportNotice {
  return {
    id: raw.id?.trim() || `transport-notice-${index + 1}`,
    titulo: raw.titulo?.trim() || `Aviso ${index + 1}`,
    mensaje: raw.mensaje?.trim() || "",
    tipo: raw.tipo ?? "info",
    fechaHora: raw.fechaHora?.trim() || new Date().toISOString().slice(0, 16),
    ...(raw.trayectoRelacionado?.trim() ? { trayectoRelacionado: raw.trayectoRelacionado.trim() } : {}),
  };
}

function ensureSeededStore<T>(key: string, seed: T[], normalize: (entry: T, index: number) => T): T[] {
  const scopedKey = scopedStorageKey(key);
  const existing = readStorageWithSchema<unknown[]>(scopedKey, z.array(z.unknown()), []);
  if (existing.length > 0) {
    const normalizedExisting = existing.map((entry, index) => normalize(entry as T, index));
    writeStorage(scopedKey, normalizedExisting);
    return normalizedExisting;
  }

  const normalizedSeed = seed.map(normalize);
  writeStorage(scopedKey, normalizedSeed);
  return normalizedSeed;
}

export async function obtenerTransportes(): Promise<TransportOption[]> {
  if (!supabaseConfig.enabled) {
    return ensureSeededStore(
      TRANSPORT_OPTIONS_KEY,
      transportTripsMock,
      normalizeTrip
    );
  }

  return [];
}

export async function guardarTransportes(lista: TransportOption[]) {
  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(TRANSPORT_OPTIONS_KEY), lista.map(normalizeTrip));
    return true;
  }

  return true;
}

export async function guardarTransporte(item: TransportTrip) {
  const current = await obtenerTransportes();
  const index = current.findIndex((entry) => entry.id === item.id);
  const updated = [...current];
  const normalized = normalizeTrip(item, current.length);
  if (index === -1) updated.push(normalized);
  else updated[index] = normalized;
  return guardarTransportes(updated);
}

export async function borrarTransporte(id: string) {
  if (!supabaseConfig.enabled) {
    const lista = await obtenerTransportes();
    const nueva = lista.filter((t) => t.id !== id);
    writeStorage(scopedStorageKey(TRANSPORT_OPTIONS_KEY), nueva);
    return true;
  }

  return true;
}

export async function obtenerSolicitudesTransporte(): Promise<TransportRequest[]> {
  if (!supabaseConfig.enabled) {
    return ensureSeededStore(
      TRANSPORT_REQUESTS_KEY,
      transportRequestsMock,
      normalizeRequest
    ).filter((request) => request.guestToken.length > 0);
  }

  return [];
}

export async function obtenerSolicitudesTransportePorInvitado(
  guestToken: string
): Promise<TransportRequest[]> {
  const requests = await obtenerSolicitudesTransporte();
  return requests.filter((request) => request.guestToken === guestToken);
}

export async function guardarSolicitudTransporte(request: TransportRequest) {
  const requests = await obtenerSolicitudesTransporte();
  const index = requests.findIndex((item) => item.guestToken === request.guestToken);
  const updated = [...requests];
  const normalized = normalizeRequest(request, requests.length);

  if (index === -1) {
    updated.push(normalized);
  } else {
    updated[index] = normalized;
  }

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(TRANSPORT_REQUESTS_KEY), updated);
    return true;
  }

  return true;
}

export async function borrarSolicitudTransporte(guestToken: string, transportId?: string) {
  const requests = await obtenerSolicitudesTransporte();
  const updated = requests.filter((item) =>
    transportId
      ? !(item.guestToken === guestToken && item.transportId === transportId)
      : item.guestToken !== guestToken
  );

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(TRANSPORT_REQUESTS_KEY), updated);
    return true;
  }

  return true;
}

export async function obtenerAvisosTransporte(): Promise<TransportNotice[]> {
  if (!supabaseConfig.enabled) {
    return ensureSeededStore(
      TRANSPORT_NOTICES_KEY,
      transportNoticesMock,
      normalizeNotice
    );
  }

  return [];
}

export async function guardarAvisosTransporte(lista: TransportNotice[]) {
  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(TRANSPORT_NOTICES_KEY), lista.map(normalizeNotice));
    return true;
  }

  return true;
}

export async function guardarAvisoTransporte(item: TransportNotice) {
  const current = await obtenerAvisosTransporte();
  const index = current.findIndex((entry) => entry.id === item.id);
  const updated = [...current];
  const normalized = normalizeNotice(item, current.length);
  if (index === -1) updated.push(normalized);
  else updated[index] = normalized;
  return guardarAvisosTransporte(updated);
}
