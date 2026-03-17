import { z } from "zod";
import { lodgingOptionSchema, lodgingRequestSchema } from "../domain/schemas";
import type { LodgingOption, LodgingRequest, LodgingType } from "../domain/lodging";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

const LODGING_OPTIONS_KEY = "wedding.alojamientos";
const LODGING_REQUESTS_KEY = "wedding.alojamientos.requests";
const lodgingOptionsSchema = z.array(lodgingOptionSchema);
const lodgingRequestsSchema = z.array(lodgingRequestSchema);

const lodgingTypeOptions: LodgingType[] = ["hotel", "hostal", "apartamento", "casa_rural", "otro"];

function normalizeLodgingType(value?: string): LodgingType {
  return lodgingTypeOptions.includes(value as LodgingType) ? (value as LodgingType) : "hotel";
}

function normalizeOption(raw: Partial<LodgingOption>, index: number): LodgingOption {
  return {
    id: raw.id?.trim() || `lodging-${index + 1}`,
    nombre: raw.nombre?.trim() || `Alojamiento ${index + 1}`,
    tipo: normalizeLodgingType(raw.tipo),
    descripcion: raw.descripcion?.trim() || raw.notas?.trim() || "",
    direccion: raw.direccion?.trim() || "",
    municipio: raw.municipio?.trim() || "",
    ...(typeof raw.distanciaKm === "number" ? { distanciaKm: raw.distanciaKm } : {}),
    telefono: raw.telefono?.trim() || "",
    email: raw.email?.trim() || "",
    webUrl: raw.webUrl?.trim() || "",
    bookingUrl: raw.bookingUrl?.trim() || raw.link?.trim() || "",
    ...(typeof raw.precioDesde === "number" ? { precioDesde: raw.precioDesde } : {}),
    images: Array.isArray(raw.images) ? raw.images.filter(Boolean) : [],
    visible: raw.visible ?? true,
    destacado: raw.destacado ?? false,
    ...(raw.sourceUrl?.trim() ? { sourceUrl: raw.sourceUrl.trim() } : {}),
    ...(raw.notas?.trim() ? { notas: raw.notas.trim() } : {}),
    ...(raw.notasPrivadas?.trim() ? { notasPrivadas: raw.notasPrivadas.trim() } : {}),
    ...(raw.link?.trim() ? { link: raw.link.trim() } : {}),
  };
}

function normalizeRequest(raw: Partial<LodgingRequest>, index: number): LodgingRequest {
  const accommodationId = raw.accommodationId ?? raw.lodgingId ?? null;
  const comment = raw.comment?.trim() || raw.notes?.trim() || "";
  const interested =
    raw.interested ??
    Boolean(raw.needsLodging && accommodationId);

  return {
    id: raw.id?.trim() || `lodging-request-${index + 1}`,
    guestToken: raw.guestToken?.trim() || "",
    guestName: raw.guestName?.trim() || "Invitado",
    accommodationId,
    ...(raw.lodgingId !== undefined ? { lodgingId: raw.lodgingId } : accommodationId !== null ? { lodgingId: accommodationId } : {}),
    interested,
    needsLodging: raw.needsLodging ?? interested,
    ...(typeof raw.persons === "number" && raw.persons > 0 ? { persons: raw.persons } : {}),
    ...(comment ? { comment } : {}),
    ...(raw.notes?.trim() ? { notes: raw.notes.trim() } : comment ? { notes: comment } : {}),
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  };
}

function readLocalOptions(): LodgingOption[] {
  const raw = readStorageWithSchema<unknown[]>(
    scopedStorageKey(LODGING_OPTIONS_KEY),
    z.array(z.unknown()),
    []
  );
  const normalized = raw.map((item, index) => normalizeOption((item ?? {}) as Partial<LodgingOption>, index));
  writeStorage(scopedStorageKey(LODGING_OPTIONS_KEY), normalized);
  return normalized;
}

function readLocalRequests(): LodgingRequest[] {
  const raw = readStorageWithSchema<unknown[]>(
    scopedStorageKey(LODGING_REQUESTS_KEY),
    z.array(z.unknown()),
    []
  );
  const normalized = raw
    .map((item, index) => normalizeRequest((item ?? {}) as Partial<LodgingRequest>, index))
    .filter((item) => item.guestToken.length > 0);
  writeStorage(scopedStorageKey(LODGING_REQUESTS_KEY), normalized);
  return normalized;
}

export function createEmptyLodgingOptionDraft(): LodgingOption {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    tipo: "hotel",
    descripcion: "",
    direccion: "",
    municipio: "",
    telefono: "",
    email: "",
    webUrl: "",
    bookingUrl: "",
    images: [],
    visible: true,
    destacado: false,
    notas: "",
    notasPrivadas: "",
  };
}

export function hydrateLodgingDraftFromUrl(url: string): Partial<LodgingOption> {
  const trimmed = url.trim();
  if (!trimmed) return {};

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");
    const hostName = host.split(".")[0]?.replace(/[-_]+/g, " ") || "Alojamiento";
    const segments = parsed.pathname.split("/").filter(Boolean);
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : undefined;
    const pathName = lastSegment
      ?.replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char: string) => char.toUpperCase());

    return {
      sourceUrl: trimmed,
      bookingUrl: trimmed,
      webUrl: `${parsed.protocol}//${parsed.host}`,
      nombre: pathName || hostName.replace(/\b\w/g, (char) => char.toUpperCase()),
    };
  } catch {
    return {
      sourceUrl: trimmed,
      bookingUrl: trimmed,
    };
  }
}

export async function obtenerAlojamientos(): Promise<LodgingOption[]> {
  if (!supabaseConfig.enabled) {
    return readLocalOptions();
  }

  return [];
}

export async function guardarAlojamientos(lista: LodgingOption[]) {
  const normalized = lista.map((item, index) => normalizeOption(item, index));
  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(LODGING_OPTIONS_KEY), normalized);
    return true;
  }

  return true;
}

export async function guardarAlojamiento(item: LodgingOption) {
  const current = await obtenerAlojamientos();
  const index = current.findIndex((entry) => entry.id === item.id);
  const updated = [...current];
  const normalizedItem = normalizeOption(item, current.length);

  if (index === -1) updated.push(normalizedItem);
  else updated[index] = normalizedItem;

  return guardarAlojamientos(updated);
}

export async function borrarAlojamiento(id: string) {
  if (!supabaseConfig.enabled) {
    const lista = await obtenerAlojamientos();
    const nueva = lista.filter((a) => a.id !== id);
    writeStorage(scopedStorageKey(LODGING_OPTIONS_KEY), nueva);
    return true;
  }

  return true;
}

export async function obtenerSolicitudesAlojamiento(): Promise<LodgingRequest[]> {
  if (!supabaseConfig.enabled) {
    return readLocalRequests();
  }

  return [];
}

export async function obtenerSolicitudAlojamientoPorInvitado(
  guestToken: string
): Promise<LodgingRequest | null> {
  const requests = await obtenerSolicitudesAlojamiento();
  return requests.find((request) => request.guestToken === guestToken && request.needsLodging) ?? null;
}

export async function obtenerInteresesAlojamientoPorInvitado(
  guestToken: string
): Promise<LodgingRequest[]> {
  const requests = await obtenerSolicitudesAlojamiento();
  return requests.filter((request) => request.guestToken === guestToken && request.interested);
}

export async function guardarSolicitudAlojamiento(request: LodgingRequest) {
  const requests = await obtenerSolicitudesAlojamiento();
  const index = requests.findIndex((item) => item.id === request.id);
  const updated = [...requests];
  const normalized = normalizeRequest(request, requests.length);

  if (index === -1) {
    updated.push(normalized);
  } else {
    updated[index] = normalized;
  }

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(LODGING_REQUESTS_KEY), updated);
    return true;
  }

  return true;
}

export async function borrarInteresAlojamiento(id: string) {
  const requests = await obtenerSolicitudesAlojamiento();
  const updated = requests.filter((item) => item.id !== id);

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(LODGING_REQUESTS_KEY), updated);
    return true;
  }

  return true;
}
