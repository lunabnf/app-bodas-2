import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createOwnerEvent,
  deleteOwnerEvent,
  duplicateOwnerEvent,
  listOwnerEvents,
  updateOwnerEventStatus,
  type OwnerEvent,
  type OwnerEventPlan,
  type OwnerEventStatus,
} from "../services/ownerEventsService";
import {
  clearOwnerEventContext,
  getOwnerEventContext,
  setOwnerEventContext,
} from "../services/ownerEventContextService";
import { clearEventScopedStorage } from "../services/eventScopeService";

const planLabel: Record<OwnerEventPlan, string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
};

const statusLabel: Record<OwnerEventStatus, string> = {
  draft: "Borrador",
  active: "Activa",
  paused: "Pausada",
};

function nextStatus(current: OwnerEventStatus): OwnerEventStatus {
  if (current === "draft") return "active";
  if (current === "active") return "paused";
  return "active";
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OwnerEvent[]>(() => listOwnerEvents());
  const [coupleLabel, setCoupleLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<OwnerEventPlan>("free");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    const total = events.length;
    const active = events.filter((event) => event.status === "active").length;
    const paused = events.filter((event) => event.status === "paused").length;
    return { total, active, paused };
  }, [events]);

  function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    const normalized = coupleLabel.trim();
    if (!normalized) {
      setError("Indica un nombre para la boda.");
      return;
    }

    createOwnerEvent({
      coupleLabel: normalized,
      slug,
      plan,
      adminEmail,
      adminPassword,
    });
    setEvents(listOwnerEvents());
    setCoupleLabel("");
    setSlug("");
    setPlan("free");
    setAdminEmail("");
    setAdminPassword("");
    setError("");
  }

  function handleToggleStatus(event: OwnerEvent) {
    const status = nextStatus(event.status);
    setEvents(updateOwnerEventStatus(event.id, status));
  }

  function handleOpenEventAdmin(event: OwnerEvent) {
    setOwnerEventContext({
      eventId: event.id,
      coupleLabel: event.coupleLabel,
      slug: event.slug,
    });
    navigate("/admin/resumen");
  }

  function handleDuplicateEvent(event: OwnerEvent) {
    duplicateOwnerEvent(event.id);
    setEvents(listOwnerEvents());
  }

  function handleDeleteEvent(event: OwnerEvent) {
    const confirmed = window.confirm(
      `Se eliminará la boda "${event.coupleLabel}" y sus datos locales asociados. ¿Continuar?`
    );
    if (!confirmed) return;

    const activeContext = getOwnerEventContext();
    setEvents(deleteOwnerEvent(event.id));
    clearEventScopedStorage(event.id);
    if (activeContext?.eventId === event.id) {
      clearOwnerEventContext();
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="app-kicker">Paso 1 completado</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Panel Owner inicial</h2>
        <p className="mt-3 text-sm text-[var(--app-muted)]">
          Ya puedes crear bodas y abrir su panel admin con contexto, sin tocar código.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="app-surface p-5">
          <h3 className="text-lg font-semibold">Bodas totales</h3>
          <p className="mt-2 text-sm text-[var(--app-muted)]">{counts.total}</p>
        </article>
        <article className="app-surface p-5">
          <h3 className="text-lg font-semibold">Activas</h3>
          <p className="mt-2 text-sm text-[var(--app-muted)]">{counts.active}</p>
        </article>
        <article className="app-surface p-5">
          <h3 className="text-lg font-semibold">Pausadas</h3>
          <p className="mt-2 text-sm text-[var(--app-muted)]">{counts.paused}</p>
        </article>
      </div>

      <form onSubmit={handleCreateEvent} className="app-surface grid gap-4 p-5 sm:grid-cols-3">
        <input
          className="w-full p-3"
          placeholder="Nombre boda (ej. Ana y Luis)"
          value={coupleLabel}
          onChange={(e) => setCoupleLabel(e.target.value)}
        />
        <input
          className="w-full p-3"
          placeholder="Slug (opcional)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <select className="w-full p-3" value={plan} onChange={(e) => setPlan(e.target.value as OwnerEventPlan)}>
          <option value="free">Plan Free</option>
          <option value="pro">Plan Pro</option>
          <option value="premium">Plan Premium</option>
        </select>
        <input
          className="w-full p-3 sm:col-span-2"
          placeholder="Email novios (opcional)"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
        />
        <input
          className="w-full p-3"
          type="password"
          placeholder="Contrasena novios (opcional)"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
        <button className="app-button-primary w-full" type="submit">
          Crear boda
        </button>
        {error ? <p className="text-sm text-red-400 sm:col-span-3">{error}</p> : null}
      </form>

      <div className="grid gap-4">
        {events.map((event) => (
          <article key={event.id} className="app-surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{event.coupleLabel}</h3>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  `/{event.slug}` · {planLabel[event.plan]} · {statusLabel[event.status]}
                </p>
                <p className="mt-1 text-xs text-[var(--app-muted)]">
                  Acceso novios: {event.adminEmail} / {event.adminPassword}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="app-button-secondary"
                  onClick={() => handleToggleStatus(event)}
                >
                  Cambiar estado
                </button>
                <button
                  type="button"
                  className="app-button-secondary"
                  onClick={() => handleDuplicateEvent(event)}
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  className="app-button-secondary"
                  onClick={() => handleDeleteEvent(event)}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="app-button-primary"
                  onClick={() => handleOpenEventAdmin(event)}
                >
                  Abrir panel de esta boda
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
