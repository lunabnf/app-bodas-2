import { useEffect, useMemo, useState } from "react";

// Tipos compartibles con ConfirmarAsistencia
type GuestCard = {
  id: string;
  fullName: string;
  type: "adulto" | "niño";
  allergies?: string;
  tableId: string | null;
};

type Table = {
  id: string;
  name: string;
  capacity: number;
  captainId: string | null;
};

function uuid(): string {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Mesas() {
  const [guests, setGuests] = useState<GuestCard[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [numTables, setNumTables] = useState<number>(0);
  const [defaultCap, setDefaultCap] = useState<number>(8);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const g = localStorage.getItem("wedding.guests");
      if (g) setGuests(JSON.parse(g));
    } catch (_e) { /* ignore */ }
    try {
      const t = localStorage.getItem("wedding.tables");
      if (t) {
        const parsed = JSON.parse(t) as Table[];
        setTables(parsed);
        setNumTables(parsed.length);
      }
    } catch (_e) { /* ignore */ }
  }, []);

  // Persistir cambios de mesas
  useEffect(() => {
    try { localStorage.setItem("wedding.tables", JSON.stringify(tables)); } catch (_e) { /* ignore */ }
  }, [tables]);

  // Persistir cambios de asignaciones de invitados
  useEffect(() => {
    try { localStorage.setItem("wedding.guests", JSON.stringify(guests)); } catch (_e) { /* ignore */ }
  }, [guests]);

  const unassigned = useMemo(() => guests.filter(g => !g.tableId), [guests]);

  // Crear/actualizar número de mesas con capacidad por defecto
  function applyTables() {
    setTables(prev => {
      const copy = [...prev];
      if (numTables > copy.length) {
        while (copy.length < numTables) copy.push({ id: uuid(), name: `Mesa ${copy.length + 1}`, capacity: Math.max(1, defaultCap), captainId: null });
      } else if (numTables < copy.length) {
        // si reducimos, desasignamos invitados que estaban en mesas que se eliminan
        const toRemove = new Set(copy.slice(numTables).map(t => t.id));
        setGuests(g => g.map(gu => toRemove.has(gu.tableId || "") ? { ...gu, tableId: null } : gu));
        copy.length = Math.max(numTables, 0);
      }
      return copy;
    });
  }

  function renameTable(id: string, name: string) {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, name } : t)));
  }

  function setCapacity(id: string, cap: number) {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, capacity: Math.max(1, cap) } : t)));
  }

  function setCaptain(id: string, guestId: string | null) {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, captainId: guestId } : t)));
  }

  function assignGuest(guestId: string, tableId: string | null) {
    setGuests(prev => prev.map(g => (g.id === guestId ? { ...g, tableId } : g)));
  }

  function removeGuest(guestId: string) {
    // Desasignar invitado
    setGuests(prev => prev.map(g => (g.id === guestId ? { ...g, tableId: null } : g)));
    // Si era capitán de alguna mesa, limpiarlo
    setTables(prev => prev.map(t => (t.captainId === guestId ? { ...t, captainId: null } : t)));
  }

  function clearAll() {
    setGuests(prev => prev.map(g => ({ ...g, tableId: null })));
    setTables(prev => prev.map(t => ({ ...t, captainId: null })));
  }

  function autoDistribute() {
    // Reparte en orden llenando hasta capacidad
    const order = [...guests].sort((a, b) => (a.type === "adulto" ? 0 : 1) - (b.type === "adulto" ? 0 : 1));
    const caps = new Map(tables.map(t => [t.id, t.capacity]));
    const next = guests.map(g => ({ ...g, tableId: null as string | null }));
    for (const g of order) {
      for (const t of tables) {
        const used = next.filter(x => x.tableId === t.id).length;
        const cap = caps.get(t.id) ?? 0;
        if (used < cap) { (next.find(x => x.id === g.id) as GuestCard).tableId = t.id; break; }
      }
    }
    setGuests(next);
  }

  return (
    <section className="min-h-screen text-white px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Organización de mesas</h1>

      {/* Panel de control */}
      <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Nº de mesas
            <input type="number" min={0} value={numTables} onChange={e => setNumTables(Math.max(0, Number(e.target.value || 0)))} className="mt-1 block w-28 rounded-md bg-black/30 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-white/30"/>
          </label>
          <label className="text-sm">
            Capacidad por mesa
            <input type="number" min={1} value={defaultCap} onChange={e => setDefaultCap(Math.max(1, Number(e.target.value || 1)))} className="mt-1 block w-28 rounded-md bg-black/30 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-white/30"/>
          </label>
          <button onClick={applyTables} className="px-3 py-2 rounded-md bg-white/15 hover:bg-white/25 border border-white/20">Aplicar</button>
          <button onClick={autoDistribute} className="px-3 py-2 rounded-md bg-pink-500 hover:bg-pink-400">Distribución automática</button>
          <button onClick={clearAll} className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20">Desasignar todos</button>
        </div>
        <div className="text-sm opacity-80">
          Invitados cargados: <b>{guests.length}</b>. Sin asignar: <b>{unassigned.length}</b>.
        </div>
      </div>

      {/* Invitados sin asignar */}
      {unassigned.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Sin asignar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {unassigned.map(g => (
              <div key={g.id} className="rounded-lg border border-white/15 bg-white/5 backdrop-blur-md p-3">
                <div className="text-sm font-medium">{g.fullName}</div>
                <div className="text-xs opacity-80 mb-2">{g.type === "adulto" ? "Adulto" : "Niño/a"}{g.allergies ? ` · ${g.allergies}` : ""}</div>
                <select
                  className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-sm"
                  onChange={(e) => assignGuest(g.id, e.target.value || null)}
                  defaultValue=""
                >
                  <option value="" disabled>Asignar a mesa…</option>
                  {tables.map(t => {
                    const used = guests.filter(x => x.tableId === t.id).length;
                    const full = used >= t.capacity;
                    return (
                      <option key={t.id} value={full ? "" : t.id} disabled={full}>
                        {t.name} ({used}/{t.capacity})
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tables.map(t => {
          const assigned = guests.filter(g => g.tableId === t.id);
          return (
            <article key={t.id} className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  className="flex-1 rounded-md bg-black/30 border border-white/20 p-2 text-white"
                  value={t.name}
                  onChange={e => renameTable(t.id, e.target.value)}
                />
                <label className="text-xs">
                  Aforo
                  <input
                    type="number"
                    min={1}
                    className="ml-2 w-20 rounded-md bg-black/30 border border-white/20 p-1"
                    value={t.capacity}
                    onChange={e => setCapacity(t.id, Math.max(1, Number(e.target.value || 1)))}
                  />
                </label>
              </div>
              <div className="mb-3">
                <label className="text-xs block mb-1">Capitán de mesa</label>
                <select
                  className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-sm"
                  value={t.captainId ?? ""}
                  onChange={(e) => setCaptain(t.id, e.target.value || null)}
                >
                  <option value="">Elegir capitán…</option>
                  {assigned.map(g => (
                    <option key={g.id} value={g.id}>{g.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm opacity-80 mb-2">Asignados: {assigned.length}/{t.capacity}</div>
              <ul className="space-y-2">
                {assigned.map(g => (
                  <li key={g.id} className="flex items-center justify-between rounded-lg bg-black/30 border border-white/10 px-2 py-1">
                    <div>
                      <div className="text-sm flex items-center gap-2">
                        {g.fullName}
                        {t.captainId === g.id && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30">⭐ Capitán</span>}
                      </div>
                      {g.allergies && <div className="text-[11px] opacity-80">{g.allergies}</div>}
                    </div>
                    <button onClick={() => removeGuest(g.id)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Quitar</button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs opacity-75">
                <b>¿Qué hace el capitán de mesa?</b> Es la persona de referencia para coordinar su mesa: ayuda a sentar y organizar a los comensales, canaliza peticiones al servicio, anima a cumplir los tiempos (entrada, brindis, fotos) y colabora con los novios o el equipo para avisos.
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}