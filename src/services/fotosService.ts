import { z } from "zod";
import type { GuestPhoto } from "../domain/photo";
import { guestPhotoSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";
import { supabaseConfig } from "./supabaseConfig";

const GUEST_PHOTOS_KEY = "wedding.fotos.invitados";
const guestPhotoListSchema = z.array(guestPhotoSchema);

function normalizePhoto(raw: Partial<GuestPhoto>, index: number): GuestPhoto | null {
  if (!raw.dataUrl?.trim()) return null;

  return {
    id: raw.id?.trim() || `guest-photo-${index + 1}`,
    name: raw.name?.trim() || `Foto ${index + 1}`,
    type: raw.type?.trim() || "image/jpeg",
    size: typeof raw.size === "number" ? Math.max(raw.size, 0) : 0,
    dataUrl: raw.dataUrl.trim(),
    uploadedByName: raw.uploadedByName?.trim() || "Invitado",
    ...(raw.uploadedByToken?.trim() ? { uploadedByToken: raw.uploadedByToken.trim() } : {}),
    createdAt: raw.createdAt ?? Date.now(),
  };
}

function readLocalPhotos(): GuestPhoto[] {
  const raw = readStorageWithSchema<unknown[]>(
    scopedStorageKey(GUEST_PHOTOS_KEY),
    z.array(z.unknown()),
    []
  );

  const normalized = raw
    .map((item, index) => normalizePhoto((item ?? {}) as Partial<GuestPhoto>, index))
    .filter((item): item is GuestPhoto => item !== null)
    .sort((a, b) => b.createdAt - a.createdAt);

  writeStorage(scopedStorageKey(GUEST_PHOTOS_KEY), normalized);
  return normalized;
}

export async function obtenerFotosInvitados(): Promise<GuestPhoto[]> {
  if (!supabaseConfig.enabled) {
    return readLocalPhotos();
  }

  return [];
}

export async function guardarFotoInvitado(photo: GuestPhoto): Promise<boolean> {
  const current = await obtenerFotosInvitados();
  const normalized = normalizePhoto(photo, current.length);
  if (!normalized) return false;

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(GUEST_PHOTOS_KEY), [normalized, ...current]);
    return true;
  }

  return true;
}

export async function borrarFotoInvitado(photoId: string): Promise<boolean> {
  const current = await obtenerFotosInvitados();
  const next = current.filter((photo) => photo.id !== photoId);

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(GUEST_PHOTOS_KEY), next);
    return true;
  }

  return true;
}
