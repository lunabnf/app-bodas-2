import { z } from "zod";
import type { Guest } from "../domain/guest";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";

const STORAGE_KEY = "wedding.guest-budget";

const guestBudgetSnapshotSchema = z.object({
  adultosConfirmados: z.number(),
  ninosConfirmados: z.number(),
  totalConfirmados: z.number(),
  costeAdulto: z.number(),
  costeNino: z.number(),
  totalEstimado: z.number(),
  updatedAt: z.number(),
});

export type GuestBudgetSnapshot = z.infer<typeof guestBudgetSnapshotSchema>;

const DEFAULT_ADULT_COST = 120;
const DEFAULT_CHILD_COST = 60;

function computeFromGuests(guests: Guest[]): GuestBudgetSnapshot {
  const adultosConfirmados = guests.filter(
    (guest) => guest.estado === "confirmado" && guest.tipo === "Adulto" && guest.personaEstado !== "cancelada"
  ).length;

  const ninosConfirmados = guests.filter(
    (guest) => guest.estado === "confirmado" && guest.tipo === "Niño" && guest.personaEstado !== "cancelada"
  ).length;

  const totalEstimado = adultosConfirmados * DEFAULT_ADULT_COST + ninosConfirmados * DEFAULT_CHILD_COST;

  return {
    adultosConfirmados,
    ninosConfirmados,
    totalConfirmados: adultosConfirmados + ninosConfirmados,
    costeAdulto: DEFAULT_ADULT_COST,
    costeNino: DEFAULT_CHILD_COST,
    totalEstimado,
    updatedAt: Date.now(),
  };
}

export function getGuestBudgetSnapshot(): GuestBudgetSnapshot {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  const fallback = computeFromGuests([]);
  return readStorageWithSchema(scopedKey, guestBudgetSnapshotSchema, fallback);
}

export function recalculateGuestBudgetSnapshot(guests: Guest[]): GuestBudgetSnapshot {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  const next = computeFromGuests(guests);
  writeStorage(scopedKey, next);
  return next;
}
