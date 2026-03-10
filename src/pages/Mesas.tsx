import { useEffect, useState } from "react";
import type { Guest } from "../domain/guest";
import type { Table } from "../domain/table";
import { obtenerInvitados } from "../services/invitadosService";
import { obtenerMesas } from "../services/mesasService";

export default function Mesas() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    void (async () => {
      const [storedGuests, storedTables] = await Promise.all([
        obtenerInvitados(),
        obtenerMesas(),
      ]);
      setGuests(storedGuests);
      setTables(storedTables);
    })();
  }, []);

  if (tables.length === 0 || guests.length === 0) {
    return (
      <section className="px-4 py-4 text-white sm:px-6">
        <h1 className="mb-4 text-2xl font-semibold sm:text-3xl">Distribución de Mesas</h1>
        <p className="text-white/70">Todavía no se ha publicado la organización de mesas.</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-4 text-white sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">Distribución de Mesas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables.map(t => {
          const assigned = guests.filter(g => g.mesa === t.id);
          const captain = assigned.find(g => g.token === t.captainToken);
          return (
            <article key={t.id} className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t.nombre}</h2>
              {assigned.length === 0 ? (
                <p className="text-white/70 italic">No hay invitados asignados.</p>
              ) : (
                <ul className="space-y-2">
                  {assigned.map(g => (
                    <li key={g.token} className="flex items-center gap-2 text-sm opacity-90">
                      {g.nombre}
                      {captain && captain.token === g.token && (
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
