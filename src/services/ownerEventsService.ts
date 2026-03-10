import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

export type OwnerEventPlan = "free" | "pro" | "premium";
export type OwnerEventStatus = "draft" | "active" | "paused";

export type OwnerEvent = {
  id: string;
  coupleLabel: string;
  slug: string;
  plan: OwnerEventPlan;
  status: OwnerEventStatus;
  adminEmail: string;
  adminPassword: string;
  createdAt: number;
  updatedAt: number;
};

const OWNER_EVENTS_KEY = "owner.events";

const ownerEventSchema = z.object({
  id: z.string(),
  coupleLabel: z.string(),
  slug: z.string(),
  plan: z.enum(["free", "pro", "premium"]),
  status: z.enum(["draft", "active", "paused"]),
  adminEmail: z.string().optional(),
  adminPassword: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const ownerEventsSchema = z.array(ownerEventSchema);

const defaultEvents: OwnerEvent[] = [
  {
    id: "evt-demo",
    coupleLabel: "Boda Demo",
    slug: "demo",
    plan: "free",
    status: "active",
    adminEmail: "demo@demo.com",
    adminPassword: "demo",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function withDefaultEvents(events: OwnerEvent[]): OwnerEvent[] {
  if (events.length > 0) {
    const normalized = events.map((event) => ({
      ...event,
      adminEmail: event.adminEmail ?? `novios@${event.slug}.com`,
      adminPassword: event.adminPassword ?? "demo1234",
    }));
    writeStorage(OWNER_EVENTS_KEY, normalized);
    return normalized;
  }
  writeStorage(OWNER_EVENTS_KEY, defaultEvents);
  return defaultEvents;
}

export function listOwnerEvents(): OwnerEvent[] {
  const events = readStorageWithSchema<OwnerEvent[]>(
    OWNER_EVENTS_KEY,
    ownerEventsSchema,
    defaultEvents
  );
  return withDefaultEvents(events);
}

export function getOwnerEventById(eventId: string): OwnerEvent | null {
  const events = listOwnerEvents();
  return events.find((event) => event.id === eventId) ?? null;
}

export function createOwnerEvent(input: {
  coupleLabel: string;
  plan: OwnerEventPlan;
  slug?: string;
  adminEmail?: string;
  adminPassword?: string;
}): OwnerEvent {
  const now = Date.now();
  const current = listOwnerEvents();
  const baseSlug = slugify(input.slug ?? input.coupleLabel) || "nueva-boda";

  let slug = baseSlug;
  let counter = 2;
  while (current.some((event) => event.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const nextEvent: OwnerEvent = {
    id: crypto.randomUUID(),
    coupleLabel: input.coupleLabel.trim(),
    slug,
    plan: input.plan,
    status: "draft",
    adminEmail: input.adminEmail?.trim().toLowerCase() || `novios@${slug}.com`,
    adminPassword: input.adminPassword?.trim() || "demo1234",
    createdAt: now,
    updatedAt: now,
  };

  const next = [nextEvent, ...current];
  writeStorage(OWNER_EVENTS_KEY, next);
  return nextEvent;
}

export function updateOwnerEventStatus(eventId: string, status: OwnerEventStatus): OwnerEvent[] {
  const current = listOwnerEvents();
  const next = current.map((event) =>
    event.id === eventId ? { ...event, status, updatedAt: Date.now() } : event
  );
  writeStorage(OWNER_EVENTS_KEY, next);
  return next;
}

export function duplicateOwnerEvent(eventId: string): OwnerEvent | null {
  const current = listOwnerEvents();
  const source = current.find((event) => event.id === eventId);
  if (!source) return null;

  const now = Date.now();
  const baseSlug = slugify(`${source.slug}-copy`) || "boda-copia";
  let slug = baseSlug;
  let counter = 2;
  while (current.some((event) => event.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const duplicated: OwnerEvent = {
    ...source,
    id: crypto.randomUUID(),
    coupleLabel: `${source.coupleLabel} (Copia)`,
    slug,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  const next = [duplicated, ...current];
  writeStorage(OWNER_EVENTS_KEY, next);
  return duplicated;
}

export function deleteOwnerEvent(eventId: string): OwnerEvent[] {
  const current = listOwnerEvents();
  const filtered = current.filter((event) => event.id !== eventId);
  const next = withDefaultEvents(filtered);
  writeStorage(OWNER_EVENTS_KEY, next);
  return next;
}

export function findOwnerEventBySlug(slug: string): OwnerEvent | null {
  const normalizedSlug = slugify(slug);
  if (!normalizedSlug) return null;
  return listOwnerEvents().find((event) => event.slug === normalizedSlug) ?? null;
}

export function validateOwnerEventAdminAccess(input: {
  slug: string;
  email: string;
  password: string;
}): OwnerEvent | null {
  const event = findOwnerEventBySlug(input.slug);
  if (!event) return null;

  if (
    event.adminEmail.toLowerCase() !== input.email.trim().toLowerCase() ||
    event.adminPassword !== input.password
  ) {
    return null;
  }

  return event;
}
