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
      const [storedGuests, storedTables] = await Promise.all([obtenerInvitados(), obtenerMesas()]);
      setGuests(storedGuests);
      setTables(storedTables);
    })();
  }, []);

  if (tables.length === 0 || guests.length === 0) {
    return (
      <section className="space-y-6 px-4 py-4 sm:px-6">
        <div className="app-surface p-6 sm:p-8">
          <p className="app-kicker">Participación</p>
          <h1 className="app-page-title mt-4">Distribución de mesas</h1>
          <p className="mt-3 app-subtitle">Todavía no se ha publicado la organización de mesas.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Participación</p>
        <h1 className="app-page-title mt-4">Distribución de mesas</h1>
        <p className="mt-3 app-subtitle">Consulta la ubicación de invitados y responsables de cada mesa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => {
          const assigned = guests.filter((guest) => guest.mesa === table.id);
          const captain = assigned.find((guest) => guest.token === table.captainToken);

          return (
            <article key={table.id} className="app-surface-soft p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[var(--app-ink)]">{table.nombre}</h2>

              {assigned.length === 0 ? (
                <p className="mt-3 text-sm italic text-[var(--app-muted)]">No hay invitados asignados.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {assigned.map((guest) => (
                    <li key={guest.token} className="flex items-center gap-2 text-sm text-[var(--app-muted)]">
                      <span>{guest.nombre}</span>
                      {captain && captain.token === guest.token ? (
                        <span className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-2 py-0.5 text-xs font-medium text-[var(--app-ink)]">
                          Capitán
                        </span>
                      ) : null}
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
