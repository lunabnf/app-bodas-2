import { Link } from "react-router-dom";
import { getActiveEventId } from "../services/eventScopeService";
import { getOwnerEventContext } from "../services/ownerEventContextService";
import { getOwnerEventById } from "../services/ownerEventsService";

export default function Resumen() {
  const activeEventId = getActiveEventId();
  const activeContext = getOwnerEventContext();
  const activeEvent = getOwnerEventById(activeEventId);
  const activeSlug = activeContext?.slug ?? activeEvent?.slug ?? "demo";

  return (
    <div className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-8">
        <p className="app-kicker">Overview</p>
        <h1 className="app-page-title mt-4">Resumen general de la boda</h1>
        <p className="mt-3 max-w-2xl text-[var(--app-muted)]">
          Un panel sereno, claro y centrado en lo importante: estado global, invitados, logística y próximos pasos.
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[var(--app-muted)]">
          EventID: {activeEventId} · Slug: /{activeSlug}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/resumen" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Estado general</h2>
          <p className="text-sm text-[var(--app-muted)]">Progreso global: 72% · Todo bajo control · 12 días para la boda</p>
          <div className="mt-4 h-2.5 w-full rounded-full bg-[rgba(24,24,23,0.08)]">
            <div className="h-2.5 w-[72%] rounded-full bg-[var(--app-ink)]" />
          </div>
        </Link>

        <Link to="/admin/invitados" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Invitados</h2>
          <p className="text-sm text-[var(--app-muted)]">Confirmados: 82 · Pendientes: 14 · Rechazados: 3</p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Adultos: 76 · Niños: 23 · Alergias: 7</p>
        </Link>

        <Link to="/admin/mesas" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Mesas y asientos</h2>
          <p className="text-sm text-[var(--app-muted)]">Mesas creadas: 12 / 15 necesarias</p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Invitados asignados: 95 / 110</p>
        </Link>

        <Link to="/admin/ceremonia" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Ceremonia</h2>
          <p className="text-sm text-[var(--app-muted)]">Asientos confirmados: 87 / 110</p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Faltan 23 confirmaciones.</p>
        </Link>

        <Link to="/admin/logistica" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Logística</h2>
          <p className="text-sm text-[var(--app-muted)]">Alojamientos confirmados: 45 / 50</p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Transportes organizados: 3 autobuses y 2 coches.</p>
        </Link>

        <Link to="/admin/checklist" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Checklist y agenda</h2>
          <p className="text-sm text-[var(--app-muted)]">Tareas completadas: 24 / 30 (80%)</p>
          <ul className="mt-2 list-disc list-inside text-sm text-[var(--app-muted)]">
            <li>Confirmar fotógrafo (mañana)</li>
            <li>Prueba de menú (jueves)</li>
            <li>Enviar lista final de mesas (sábado)</li>
          </ul>
        </Link>

        <Link to="/admin/presupuesto" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Presupuesto</h2>
          <p className="text-sm text-[var(--app-muted)]">Total estimado: 23.000 € · Gastado: 18.700 € · Restante: 4.300 €</p>
        </Link>

        <Link to="/admin/mensajes" className="app-surface-soft block p-6 transition hover:translate-y-[-1px]">
          <h2 className="text-xl font-semibold mb-2">Mensajes y canciones</h2>
          <p className="text-sm text-[var(--app-muted)]">Canciones más votadas: “Vivir así es morir de amor”, “Eros Ramazzotti – Fuego en el fuego”.</p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Mensajes recientes: “¡Qué ganas de que llegue el día!”</p>
        </Link>
      </div>

      <section className="app-surface p-8 text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.04em]">Todo listo para el gran día</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--app-muted)]">
          Vuestra boda está al 82% completada. Relajaos y disfrutad: el trabajo duro ya empieza a sentirse ligero.
        </p>
      </section>
    </div>
  );
}
