import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadWeddingInsights, type WeddingInsights } from "../application/weddingInsightsService";
import { getActiveEventId } from "../services/eventScopeService";
import { getOwnerEventContext } from "../services/ownerEventContextService";
import { getOwnerEventById } from "../services/ownerEventsService";

export default function Resumen() {
  const { slug } = useParams();
  const activeEventId = getActiveEventId();
  const activeContext = getOwnerEventContext();
  const activeEvent = getOwnerEventById(activeEventId);
  const activeSlug = activeContext?.slug ?? activeEvent?.slug ?? "demo";
  const adminBasePath = slug ? `/w/${slug}/admin` : "/w/demo/admin";

  const [insights, setInsights] = useState<WeddingInsights | null>(null);

  useEffect(() => {
    void loadWeddingInsights().then(setInsights);
  }, []);

  return (
    <div className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Overview</p>
        <h1 className="app-page-title mt-4">Resumen general de la boda</h1>
        <p className="mt-3 max-w-2xl text-[var(--app-muted)]">
          Métricas sincronizadas automáticamente con RSVP, asistentes reales, mesas y presupuesto.
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[var(--app-muted)]">
          EventID: {activeEventId} · Slug: /{activeSlug}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to={`${adminBasePath}/invitados`} className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Invitados y asistencia</h2>
          <p className="text-sm text-[var(--app-muted)]">
            Confirmados: {insights?.confirmados ?? 0} · Pendientes: {insights?.pendientes ?? 0} · Rechazados: {insights?.rechazados ?? 0}
          </p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Adultos: {insights?.adultosConfirmados ?? 0} · Niños: {insights?.ninosConfirmados ?? 0}
          </p>
        </Link>

        <Link to={`${adminBasePath}/mesas`} className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Mesas y asignaciones</h2>
          <p className="text-sm text-[var(--app-muted)]">
            Mesas con asignación: {insights?.mesasAsignadas ?? 0} / {insights?.mesasTotal ?? 0}
          </p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Confirmados sin mesa: {insights?.sinMesa ?? 0}</p>
        </Link>

        <Link to={`${adminBasePath}/ceremonia`} className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Ceremonia</h2>
          <p className="text-sm text-[var(--app-muted)]">
            Asistencia prevista para ceremonia: {insights?.confirmados ?? 0} personas
          </p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Adultos: {insights?.adultosConfirmados ?? 0} · Niños: {insights?.ninosConfirmados ?? 0}</p>
        </Link>

        <Link to={`${adminBasePath}/presupuesto`} className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Presupuesto dinámico</h2>
          <p className="text-sm text-[var(--app-muted)]">
            Total asistentes confirmados: {insights?.presupuesto.totalConfirmados ?? 0}
          </p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Estimado automático por asistentes: {(insights?.presupuesto.totalEstimado ?? 0).toLocaleString()} €
          </p>
        </Link>

        <Link to={`${adminBasePath}/actividad`} className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Actividad reciente</h2>
          <p className="text-sm text-[var(--app-muted)]">
            Eventos últimas 24h: {insights?.actividadReciente ?? 0}
          </p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            RSVP respondidos: {insights?.rsvpRespondidos ?? 0}
          </p>
        </Link>
      </div>
    </div>
  );
}
