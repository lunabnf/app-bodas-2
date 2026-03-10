import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

export type OwnerEventContext = {
  eventId: string;
  coupleLabel: string;
  slug: string;
};

const OWNER_EVENT_CONTEXT_KEY = "owner.currentEvent";

const ownerEventContextSchema = z.object({
  eventId: z.string(),
  coupleLabel: z.string(),
  slug: z.string(),
});

export function getOwnerEventContext(): OwnerEventContext | null {
  return readStorageWithSchema<OwnerEventContext | null>(
    OWNER_EVENT_CONTEXT_KEY,
    ownerEventContextSchema.nullable(),
    null
  );
}

export function setOwnerEventContext(context: OwnerEventContext) {
  writeStorage(OWNER_EVENT_CONTEXT_KEY, context);
}

export function clearOwnerEventContext() {
  localStorage.removeItem(OWNER_EVENT_CONTEXT_KEY);
}
