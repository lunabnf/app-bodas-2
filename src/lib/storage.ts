import type { z } from "zod";

type BrowserStorageKind = "local" | "session";

function getBrowserStorage(kind: BrowserStorageKind): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function createStorageAdapter(kind: BrowserStorageKind) {
  return {
    getItem(key: string): string | null {
      return getBrowserStorage(kind)?.getItem(key) ?? null;
    },
    setItem(key: string, value: string): void {
      getBrowserStorage(kind)?.setItem(key, value);
    },
    removeItem(key: string): void {
      getBrowserStorage(kind)?.removeItem(key);
    },
    key(index: number): string | null {
      return getBrowserStorage(kind)?.key(index) ?? null;
    },
    length(): number {
      return getBrowserStorage(kind)?.length ?? 0;
    },
    keys(): string[] {
      const storage = getBrowserStorage(kind);
      if (!storage) return [];

      const keys: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key) keys.push(key);
      }
      return keys;
    },
  };
}

export const localStore = createStorageAdapter("local");
export const sessionStore = createStorageAdapter("session");

export function readStorageWithSchema<T>(
  key: string,
  schema: z.ZodTypeAny,
  fallback: T
): T {
  const raw = localStore.getItem(key);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = schema.safeParse(parsed);

    if (result.success) {
      return result.data as T;
    }
  } catch {
    // Fall through to cleanup.
  }

  localStore.removeItem(key);
  return fallback;
}

export function writeStorage<T>(key: string, value: T) {
  localStore.setItem(key, JSON.stringify(value));
}
