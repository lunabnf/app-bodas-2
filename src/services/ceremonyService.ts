import { ceremonyLayoutSchema } from "../domain/schemas";
import type { CeremonyLayout } from "../domain/ceremony";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";

const CEREMONY_LAYOUT_KEY = "wedding.ceremony.layout";

export const defaultCeremonyLayout: CeremonyLayout = {
  layoutType: "two_blocks_center_aisle",
  leftRows: 6,
  rightRows: 6,
  seatsPerRow: 8,
  centerAisleLabel: "Pasillo central",
  updatedAt: Date.now(),
};

export function getCeremonyLayout(): CeremonyLayout {
  const stored = readStorageWithSchema<CeremonyLayout | null>(
    scopedStorageKey(CEREMONY_LAYOUT_KEY),
    ceremonyLayoutSchema.nullable(),
    null
  );

  if (!stored) {
    writeStorage(scopedStorageKey(CEREMONY_LAYOUT_KEY), defaultCeremonyLayout);
    return defaultCeremonyLayout;
  }

  return {
    ...defaultCeremonyLayout,
    ...stored,
  };
}

export function saveCeremonyLayout(layout: CeremonyLayout) {
  writeStorage(scopedStorageKey(CEREMONY_LAYOUT_KEY), layout);
}
