import { useEffect, useMemo, useState, ChangeEvent } from "react";

type Item = {
  id: string;
  time: string; // HH:MM
  title: string;
  notes?: string;
};

const KEY = "program_schedule_v1";

function load(): Item[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Item[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(items: Item[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function isTimeValid(v: string) {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v.trim());
}

export default function Programa() {
  const [items, setItems] = useState<Item[]>(() => load());
  const [form, setForm] = useState<{ time: string; title: string; notes: string }>({ time: "", title: "", notes: "" });

  // Persistencia
  useEffect(() => { save(items); }, [items]);

  // Orden por hora ascendente conservando orden de inserción para igualdades
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => a.time.localeCompare(b.time));
  }, [items]);

  function addItem() {
    if (!form.title.trim()) return;
    if (!isTimeValid(form.time)) return;
    const it: Item = { id: crypto.randomUUID(), time: form.time.trim(), title: form.title.trim(), notes: form.notes.trim() || undefined };
    setItems((prev) => [...prev, it]);
    setForm({ time: "", title: "", notes: "" });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateField(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[idx];
      copy[idx] = copy[j];
      copy[j] = tmp;
      return copy;
    });
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "programa-boda.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data)) {
          // sanitizar mínimo
          const parsed: Item[] = data
            .filter((x) => x && typeof x === "object")
            .map((x: Record<string, unknown>) => {
              const id = x["id"];
              const time = x["time"];
              const title = x["title"];
              const notes = x["notes"];

              return {
                id: typeof id === "string" && id.length > 0 ? id : crypto.randomUUID(),
                time: typeof time === "string" && time.length > 0 ? time : "00:00",
                title: typeof title === "string" ? title : "",
                notes:
                  typeof notes === "string"
                    ? notes
                    : notes != null
                    ? String(notes)
                    : undefined,
              };
            });
          setItems(parsed);
        }
      } catch { /* noop */ }
    };
    reader.readAsText(file);
    // reset input para poder volver a importar el mismo fichero si se quiere
    e.currentTarget.value = "";
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Programa de la boda</h1>
        <p className="text-sm text-neutral-400">Edita aquí los hitos y horarios de la ceremonia y celebración. Se guarda automáticamente en este dispositivo.</p>
      </header>

      {/* Formulario de alta */}
      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <h2 className="font-semibold mb-3">Añadir hito</h2>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <input
            placeholder="HH:MM"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="sm:col-span-1 w-full p-2 bg-neutral-800 rounded"
          />
          <input
            placeholder="Título (p. ej. Llegada invitados)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="sm:col-span-3 w-full p-2 bg-neutral-800 rounded"
          />
          <input
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="sm:col-span-2 w-full p-2 bg-neutral-800 rounded"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={addItem}
            disabled={!isTimeValid(form.time) || !form.title.trim()}
            className="px-3 py-2 bg-white text-black rounded disabled:opacity-40"
          >
            Añadir
          </button>
          <span className="text-xs text-neutral-400 self-center">Formato de hora 24h: HH:MM</span>
        </div>
      </div>

      {/* Lista editable */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-neutral-400">Aún no hay hitos. Añade el primero arriba.</p>
        ) : (
          sorted.map((it, idx) => (
            <div key={it.id} className="rounded-xl border border-white/10 p-3 bg-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                {/* Hora */}
                <input
                  value={it.time}
                  onChange={(e) => updateField(it.id, { time: e.target.value })}
                  className="sm:col-span-2 w-full p-2 bg-neutral-800 rounded"
                  aria-label="Hora"
                />
                {/* Título */}
                <input
                  value={it.title}
                  onChange={(e) => updateField(it.id, { title: e.target.value })}
                  className="sm:col-span-5 w-full p-2 bg-neutral-800 rounded"
                  aria-label="Título"
                />
                {/* Notas */}
                <input
                  value={it.notes ?? ""}
                  onChange={(e) => updateField(it.id, { notes: e.target.value })}
                  className="sm:col-span-3 w-full p-2 bg-neutral-800 rounded"
                  aria-label="Notas"
                />
                {/* Acciones */}
                <div className="sm:col-span-2 flex gap-2 justify-end">
                  <button onClick={() => move(it.id, -1)} disabled={idx === 0} title="Subir" className="px-2 py-1 bg-neutral-800 rounded disabled:opacity-40">▲</button>
                  <button onClick={() => move(it.id, 1)} disabled={idx === sorted.length - 1} title="Bajar" className="px-2 py-1 bg-neutral-800 rounded disabled:opacity-40">▼</button>
                  <button onClick={() => removeItem(it.id)} title="Eliminar" className="px-2 py-1 bg-red-500/90 text-white rounded">✕</button>
                </div>
              </div>
              {!isTimeValid(it.time) && (
                <p className="text-xs text-red-400 mt-1">Hora inválida. Usa HH:MM en formato 24h.</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Utilidades */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button onClick={exportJSON} className="px-3 py-2 bg-neutral-800 rounded">Exportar JSON</button>
        <label className="px-3 py-2 bg-neutral-800 rounded cursor-pointer">
          Importar JSON
          <input type="file" accept="application/json" className="hidden" onChange={onImport} />
        </label>
        <button onClick={() => setItems([])} className="px-3 py-2 bg-neutral-800 rounded">Vaciar</button>
      </div>
    </section>
  );
}