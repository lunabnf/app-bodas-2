export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getBrowserLocation(): Location | null {
  return isBrowser() ? window.location : null;
}

export function getDocumentRoot(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.documentElement;
}

export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return typeof document === "undefined" ? null : document.getElementById(id) as T | null;
}

export function createBrowserElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K
): HTMLElementTagNameMap[K] | null {
  return typeof document === "undefined" ? null : document.createElement(tagName);
}

export function scrollWindowToTop(): void {
  if (!isBrowser()) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function confirmDialog(message: string): boolean {
  return isBrowser() ? window.confirm(message) : false;
}
