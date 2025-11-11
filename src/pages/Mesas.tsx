import { useEffect, useState } from "react";

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

export default function Mesas() {
  const [guests, setGuests] = useState<GuestCard[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

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
      }
    } catch (_e) { /* ignore */ }
  }, []);

  if (tables.length === 0 || guests.length === 0) {
    return (
      <section className="min-h-screen text-white px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Distribución de Mesas</h1>
        <p className="text-white/70">Todavía no se ha publicado la organización de mesas.</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen text-white px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Distribución de Mesas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables.map(t => {
          const assigned = guests.filter(g => g.tableId === t.id);
          const captain = assigned.find(g => g.id === t.captainId);
          return (
            <article key={t.id} className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t.name}</h2>
              {assigned.length === 0 ? (
                <p className="text-white/70 italic">No hay invitados asignados.</p>
              ) : (
                <ul className="space-y-2">
                  {assigned.map(g => (
                    <li key={g.id} className="flex items-center gap-2 text-sm opacity-90">
                      {g.fullName}
                      {captain && captain.id === g.id && (
                        <span className="text-yellow-400 text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 select-none">⭐ Capitán</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}