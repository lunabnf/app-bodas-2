import { getWeddingProgram } from "../services/programaService";

export default function Programa() {
  const eventos = getWeddingProgram();

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Programa</p>
        <h1 className="app-page-title mt-4">Programa del día</h1>
        <p className="mt-3 app-subtitle">
          Horario principal del evento para que todos sepan qué ocurre y en qué momento.
        </p>
      </div>

      {eventos.length === 0 ? (
        <div className="app-surface-soft p-6">
          <p className="text-sm text-[var(--app-muted)]">No hay eventos configurados aún.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {eventos.map((ev) => (
            <li key={ev.id} className="app-surface-soft p-5 sm:p-6">
              <p className="text-base font-semibold text-[var(--app-ink)] sm:text-lg">
                {ev.hora} · {ev.titulo}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--app-muted)]">{ev.descripcion}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
