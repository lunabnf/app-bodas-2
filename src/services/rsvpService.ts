import { z } from "zod";
import { guestRsvpSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import type { GuestRsvp } from "../domain/rsvp";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

const RSVP_COLLECTION_KEY = "wedding.rsvps";
const guestRsvpsSchema = z.array(guestRsvpSchema);

function readAllLocalRsvps(): GuestRsvp[] {
  const scopedCollectionKey = scopedStorageKey(RSVP_COLLECTION_KEY);
  const collection = readStorageWithSchema<GuestRsvp[]>(
    scopedCollectionKey,
    guestRsvpsSchema,
    []
  );
  const migrated = [...collection];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith("wedding.rsvp.")) continue;

    const guestToken = key.replace("wedding.rsvp.", "");
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as {
        guestName?: string;
        attending: GuestRsvp["attending"];
        adultos: number;
        ninos: number;
        detalles: GuestRsvp["detalles"];
        nota?: string;
        timestamp: number;
      };

      if (!migrated.find((item) => item.guestToken === guestToken)) {
        migrated.push({
          guestToken,
          guestName: parsed.guestName ?? "",
          attending: parsed.attending,
          adultos: parsed.adultos,
          ninos: parsed.ninos,
          detalles: parsed.detalles,
          ...(parsed.nota ? { nota: parsed.nota } : {}),
          timestamp: parsed.timestamp,
        });
      }

      localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  }

  if (migrated.length !== collection.length) {
    writeStorage(scopedCollectionKey, migrated);
  }

  return migrated;
}

export async function guardarRSVP(data: GuestRsvp) {
  const all = await obtenerTodosLosRSVP();
  const index = all.findIndex((item) => item.guestToken === data.guestToken);
  const updated = [...all];

  if (index === -1) {
    updated.push(data);
  } else {
    updated[index] = data;
  }

  if (!supabaseConfig.enabled) {
    writeStorage(scopedStorageKey(RSVP_COLLECTION_KEY), updated);
    return true;
  }

  return true;
}

export async function obtenerRSVP(guestToken: string) {
  if (!supabaseConfig.enabled) {
    const all = readAllLocalRsvps();
    return all.find((item) => item.guestToken === guestToken) ?? null;
  }

  return null;
}

export async function obtenerTodosLosRSVP(): Promise<GuestRsvp[]> {
  if (!supabaseConfig.enabled) {
    return readAllLocalRsvps();
  }

  return [];
}

export async function borrarRSVP(guestToken: string) {
  if (!supabaseConfig.enabled) {
    const all = readAllLocalRsvps();
    const updated = all.filter((item) => item.guestToken !== guestToken);
    writeStorage(scopedStorageKey(RSVP_COLLECTION_KEY), updated);
    return true;
  }

  return true;
}
