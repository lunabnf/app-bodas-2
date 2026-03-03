import type { z } from "zod";

export function readStorageWithSchema<T>(
  key: string,
  schema: z.ZodTypeAny,
  fallback: T
): T {
  const raw = localStorage.getItem(key);
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

  localStorage.removeItem(key);
  return fallback;
}

export function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
