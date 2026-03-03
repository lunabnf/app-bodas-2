export function readStorageWithSchema(key, schema, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw)
        return fallback;
    try {
        const parsed = JSON.parse(raw);
        const result = schema.safeParse(parsed);
        if (result.success) {
            return result.data;
        }
    }
    catch {
        // Fall through to cleanup.
    }
    localStorage.removeItem(key);
    return fallback;
}
export function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
