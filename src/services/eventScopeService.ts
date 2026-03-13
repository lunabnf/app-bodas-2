import { getOwnerEventContext } from "./ownerEventContextService";
import { getAccessEventContext } from "./accessEventContextService";

const AUTH_STORAGE_KEY = "wedding.auth";
const DEFAULT_EVENT_ID = "evt-demo";

type StoredAuth = {
  esOwner?: boolean;
  esSuperAdmin?: boolean;
  currentEventId?: string | null;
};

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function getActiveEventId(): string {
  if (typeof window === "undefined") return DEFAULT_EVENT_ID;
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
  return DEFAULT_EVENT_ID;
}

export function scopedStorageKey(baseKey: string): string {
  return `${baseKey}::${getActiveEventId()}`;
}

export function clearEventScopedStorage(eventId: string) {
  if (typeof window === "undefined") return;
  const suffix = `::${eventId}`;
  const keysToDelete: string[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    if (key.endsWith(suffix)) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    localStorage.removeItem(key);
  }
}
