import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

export type AccessEventContext = {
  eventId: string;
  slug: string;
  coupleLabel: string;
};

const ACCESS_EVENT_CONTEXT_KEY = "wedding.accessEvent";

const accessEventContextSchema = z.object({
  eventId: z.string(),
  slug: z.string(),
  coupleLabel: z.string(),
});

export function getAccessEventContext(): AccessEventContext | null {
  return readStorageWithSchema<AccessEventContext | null>(
    ACCESS_EVENT_CONTEXT_KEY,
    accessEventContextSchema.nullable(),
    null
  );
}

export function setAccessEventContext(context: AccessEventContext) {
  writeStorage(ACCESS_EVENT_CONTEXT_KEY, context);
}

export function clearAccessEventContext() {
  localStorage.removeItem(ACCESS_EVENT_CONTEXT_KEY);
}
