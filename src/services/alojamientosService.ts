import { z } from "zod";
import { lodgingOptionSchema, lodgingRequestSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import type { LodgingOption, LodgingRequest } from "../domain/lodging";
import { supabaseConfig } from "./supabaseConfig";

const LODGING_OPTIONS_KEY = "wedding.alojamientos";
const LODGING_REQUESTS_KEY = "wedding.alojamientos.requests";
const lodgingOptionsSchema = z.array(lodgingOptionSchema);
const lodgingRequestsSchema = z.array(lodgingRequestSchema);

export async function obtenerAlojamientos(): Promise<LodgingOption[]> {
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<LodgingOption[]>(
      LODGING_OPTIONS_KEY,
      lodgingOptionsSchema,
      []
    );
  }

  return [];
}

export async function guardarAlojamientos(lista: LodgingOption[]) {
  if (!supabaseConfig.enabled) {
    writeStorage(LODGING_OPTIONS_KEY, lista);
    return true;
  }

  return true;
}

export async function borrarAlojamiento(id: string) {
  if (!supabaseConfig.enabled) {
    const lista = readStorageWithSchema<LodgingOption[]>(
      LODGING_OPTIONS_KEY,
      lodgingOptionsSchema,
      []
    );
    const nueva = lista.filter((a) => a.id !== id);
    writeStorage(LODGING_OPTIONS_KEY, nueva);
    return true;
  }

  return true;
}

export async function obtenerSolicitudesAlojamiento(): Promise<LodgingRequest[]> {
  if (!supabaseConfig.enabled) {
    return readStorageWithSchema<LodgingRequest[]>(
      LODGING_REQUESTS_KEY,
      lodgingRequestsSchema,
      []
    );
  }

  return [];
}

export async function obtenerSolicitudAlojamientoPorInvitado(
  guestToken: string
): Promise<LodgingRequest | null> {
  const requests = await obtenerSolicitudesAlojamiento();
  return requests.find((request) => request.guestToken === guestToken) ?? null;
}

export async function guardarSolicitudAlojamiento(request: LodgingRequest) {
  const requests = await obtenerSolicitudesAlojamiento();
  const index = requests.findIndex((item) => item.guestToken === request.guestToken);
  const updated = [...requests];

  if (index === -1) {
    updated.push(request);
  } else {
    updated[index] = request;
  }

  if (!supabaseConfig.enabled) {
    writeStorage(LODGING_REQUESTS_KEY, updated);
    return true;
  }

  return true;
}
