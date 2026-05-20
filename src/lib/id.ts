export function createId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") {
    return randomUUID.call(globalThis.crypto);
  }

  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
