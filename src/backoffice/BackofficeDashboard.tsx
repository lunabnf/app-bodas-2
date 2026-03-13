import { useMemo, useState } from "react";
import {
  clearAnalyticsSnapshot,
  getAnalyticsSnapshot,
} from "../services/backofficeAnalyticsService";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function BackofficeDashboard() {
  const [refreshToken, setRefreshToken] = useState(0);

  const snapshot = useMemo(() => getAnalyticsSnapshot(), [refreshToken]);
  const latestVisit = snapshot.sessions[0];
  const actionsInLatestHour = snapshot.sessions.reduce((sum, session) => {
    return (
      sum +
      session.actions.filter((action) => Date.now() - new Date(action.at).getTime() <= 60 * 60 * 1000).length
    );
  }, 0);

  function reloadAnalytics() {
    setRefreshToken((prev) => prev + 1);
  }

  function clearAnalytics() {
    clearAnalyticsSnapshot();
    reloadAnalytics();
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="app-kicker">Dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Resumen interno</h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Analítica temporal local de visitas y navegación por sesión.
          </p>
        </div>
        <button type="button" className="app-button-secondary" onClick={reloadAnalytics}>
          Actualizar
        </button>
        <button type="button" className="app-button-secondary" onClick={clearAnalytics}>
          Limpiar datos
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Visitas registradas</p>
          <p className="mt-2 text-2xl font-semibold">{snapshot.totalVisits}</p>
        </article>
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Acciones registradas</p>
          <p className="mt-2 text-2xl font-semibold">{snapshot.totalActions}</p>
        </article>
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Acciones última hora</p>
          <p className="mt-2 text-2xl font-semibold">{actionsInLatestHour}</p>
        </article>
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Última visita</p>
          <p className="mt-2 text-sm font-semibold">
            {latestVisit ? formatDate(latestVisit.lastAt) : "Sin datos"}
          </p>
        </article>
      </div>

      <article className="app-surface p-5 sm:p-6">
        <h3 className="text-lg font-semibold">Detalle por visita</h3>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          Cada visita agrupa acciones de navegación de una sesión de navegador.
        </p>

        <div className="mt-4 space-y-4">
          {snapshot.sessions.length === 0 ? (
            <p className="text-sm text-[var(--app-muted)]">Todavía no hay visitas registradas.</p>
          ) : (
            snapshot.sessions.slice(0, 20).map((session) => (
              <div key={session.id} className="app-surface-soft p-4">
                <p className="text-sm font-semibold">Visita: {session.id}</p>
                <p className="mt-1 text-xs text-[var(--app-muted)]">
                  Inicio: {formatDate(session.startedAt)} · Última acción: {formatDate(session.lastAt)}
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-[var(--app-muted)]">
                        <th className="py-1 pr-3 font-medium">Hora</th>
                        <th className="py-1 pr-3 font-medium">Acción</th>
                        <th className="py-1 font-medium">Ruta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.actions.slice(-30).map((action) => (
                        <tr key={action.id} className="border-t border-[var(--app-line)]">
                          <td className="py-2 pr-3">{formatDate(action.at)}</td>
                          <td className="py-2 pr-3">Navegación</td>
                          <td className="py-2 font-mono text-xs sm:text-sm">{action.path}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
