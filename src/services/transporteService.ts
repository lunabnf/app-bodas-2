import { z } from "zod";
import { transportOptionSchema, transportRequestSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import type { TransportOption, TransportRequest } from "../domain/transport";
import { supabaseConfig } from "./supabaseConfig";

const TRANSPORT_OPTIONS_KEY = "wedding.transportes";
const TRANSPORT_REQUESTS_KEY = "wedding.transportes.requests";
const transportOptionsSchema = z.array(transportOptionSchema);
const transportRequestsSchema = z.array(transportRequestSchema);

export async function obtenerTransportes(): Promise<TransportOption[]> {
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<TransportOption[]>(
      TRANSPORT_OPTIONS_KEY,
      transportOptionsSchema,
      []
    );
  }

  return [];
}

export async function guardarTransportes(lista: TransportOption[]) {
  if (!supabaseConfig.enabled) {
    writeStorage(TRANSPORT_OPTIONS_KEY, lista);
    return true;
  }

  return true;
}

export async function borrarTransporte(id: string) {
  if (!supabaseConfig.enabled) {
    const lista = readStorageWithSchema<TransportOption[]>(
      TRANSPORT_OPTIONS_KEY,
      transportOptionsSchema,
      []
    );
    const nueva = lista.filter((t) => t.id !== id);
    writeStorage(TRANSPORT_OPTIONS_KEY, nueva);
    return true;
  }

  return true;
}

export async function obtenerSolicitudesTransporte(): Promise<TransportRequest[]> {
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<TransportRequest[]>(
      TRANSPORT_REQUESTS_KEY,
      transportRequestsSchema,
      []
    );
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
  const index = requests.findIndex(
    (item) => item.guestToken === request.guestToken && item.transportId === request.transportId
  );
  const updated = [...requests];

  if (index === -1) {
    updated.push(request);
  } else {
    updated[index] = request;
  }

  if (!supabaseConfig.enabled) {
    writeStorage(TRANSPORT_REQUESTS_KEY, updated);
    return true;
  }

  return true;
}

export async function borrarSolicitudTransporte(guestToken: string, transportId: string) {
  const requests = await obtenerSolicitudesTransporte();
  const updated = requests.filter(
    (item) => !(item.guestToken === guestToken && item.transportId === transportId)
  );

  if (!supabaseConfig.enabled) {
    writeStorage(TRANSPORT_REQUESTS_KEY, updated);
    return true;
  }

  return true;
}
