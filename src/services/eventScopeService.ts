import { getOwnerEventContext } from "./ownerEventContextService";
import { getAccessEventContext } from "./accessEventContextService";
import { findOwnerEventBySlug } from "./ownerEventsService";
import { getBrowserLocation, isBrowser } from "../lib/browser";
import { localStore } from "../lib/storage";

const AUTH_STORAGE_KEY = "wedding.auth";
const DEFAULT_EVENT_ID = "evt-demo";

type StoredAuth = {
  esOwner?: boolean;
  esSuperAdmin?: boolean;
  currentEventId?: string | null;
};

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStore.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function resolveEventIdFromRoute(): string | null {
  const location = getBrowserLocation();
  if (!location) return null;

  const match = location.pathname.match(/^\/(?:w|evento)\/([^/]+)/);
  const slug = match?.[1]?.trim().toLowerCase();
  if (!slug) return null;

  const event = findOwnerEventBySlug(slug);
  return event?.id ?? null;
}

export function getActiveEventId(): string {
  if (!isBrowser()) return DEFAULT_EVENT_ID;
  const auth = readStoredAuth();

  if (auth?.currentEventId) {
    return auth.currentEventId;
  }

  const ownerContext = getOwnerEventContext();
  if ((auth?.esOwner || auth?.esSuperAdmin) && ownerContext?.eventId) {
    return ownerContext.eventId;
  }

  const accessContext = getAccessEventContext();
  if (accessContext?.eventId) {
    return accessContext.eventId;
  }

  const routeEventId = resolveEventIdFromRoute();
  if (routeEventId) {
    return routeEventId;
  }

  return DEFAULT_EVENT_ID;
}

export function scopedStorageKey(baseKey: string): string {
  return `${baseKey}::${getActiveEventId()}`;
}

export function clearEventScopedStorage(eventId: string) {
  const suffix = `::${eventId}`;
  const keysToDelete = localStore.keys().filter((key) => key.endsWith(suffix));

  for (const key of keysToDelete) {
    localStore.removeItem(key);
  }
}
