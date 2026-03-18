import { useEffect, useMemo, useState } from "react";
import {
  clearAdminActivityHistory,
  filterTimelineItems,
  formatActivityDate,
  loadActivityDashboardData,
  type ActivityBlockSummary,
  type ActivityCategory,
  type ActivityPeriodFilter,
  type TimelineItem,
} from "../application/adminActivityService";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const COLLAPSE_STORAGE_KEY = "wedding.admin.activity.collapsed";

const categoryOptions: Array<{ value: "todas" | ActivityCategory; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "confirmaciones", label: "Confirmaciones" },
  { value: "alojamiento", label: "Alojamiento" },
  { value: "transporte", label: "Transporte" },
  { value: "musica", label: "Música" },
  { value: "chat", label: "Chat" },
  { value: "invitados", label: "Invitados" },
  { value: "mesas_ceremonia", label: "Mesas / ceremonia" },
  { value: "admin", label: "Admin" },
  { value: "otros", label: "Otros" },
];

function loadCollapsedState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveCollapsedState(next: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
}

function getBlockTone(block: ActivityCategory) {
  if (block === "confirmaciones") return "bg-emerald-100 text-emerald-800";
  if (block === "transporte" || block === "alojamiento") return "bg-amber-100 text-amber-800";
  if (block === "musica" || block === "chat") return "bg-sky-100 text-sky-800";
  if (block === "admin") return "bg-slate-200 text-slate-700";
  return "bg-[rgba(24,24,23,0.08)] text-[var(--app-ink)]";
}

function renderTimelineTable(items: TimelineItem[]) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--app-muted)]">No hay eventos en este bloque con los filtros actuales.</p>;
  }

  return (
    <div className="overflow-auto rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)]">
      <table className="w-full text-sm">
        <thead className="bg-[rgba(24,24,23,0.06)] text-left text-[var(--app-muted)]">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Detalle</th>
            <th className="px-4 py-3">Origen</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--app-line)] align-top">
              <td className="px-4 py-3 whitespace-nowrap">{formatActivityDate(item.timestamp)}</td>
              <td className="px-4 py-3">{item.actor}</td>
              <td className="px-4 py-3 capitalize">{item.category.replace(/_/g, " ")}</td>
              <td className="px-4 py-3">{item.detail}</td>
              <td className="px-4 py-3 capitalize">{item.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ActividadAdmin() {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [blocks, setBlocks] = useState<ActivityBlockSummary[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => loadCollapsedState());
  const [categoryFilter, setCategoryFilter] = useState<"todas" | ActivityCategory>("todas");
  const [periodFilter, setPeriodFilter] = useState<ActivityPeriodFilter>("todo");
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [metrics, setMetrics] = useState({
    confirmados: 0,
    rechazados: 0,
    totalPlazasTransporte: 0,
    totalConAlergias: 0,
  });

  async function loadData() {
    setLoading(true);
    const data = await loadActivityDashboardData();
    setTimeline(data.timeline);
    setBlocks(data.blocks);
    setMetrics(data.metrics);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateCollapsed(next: Record<string, boolean>) {
    setCollapsed(next);
    saveCollapsedState(next);
  }

  function toggleBlock(blockId: string) {
    updateCollapsed({
      ...collapsed,
      [blockId]: !collapsed[blockId],
    });
  }

  function expandAll() {
    updateCollapsed(Object.fromEntries(blocks.map((block) => [block.id, false])));
  }

  function collapseAll() {
    updateCollapsed(Object.fromEntries(blocks.map((block) => [block.id, true])));
  }

  const filteredBlocks = useMemo(() => {
    return blocks
      .map((block) => {
        const items = filterTimelineItems(block.items, {
          category: categoryFilter,
          period: periodFilter,
          onlyImportant,
        });

        return {
          ...block,
          items,
          count: items.length,
          lastEvent: items[0],
          collapsedHint: items[0]
            ? `${items[0].detail} · ${formatActivityDate(items[0].timestamp)}`
            : "Sin actividad con los filtros actuales",
        };
      })
      .filter((block) => block.id === "timeline" || block.count > 0);
  }, [blocks, categoryFilter, onlyImportant, periodFilter]);

  async function handleLimpiar() {
    const confirmar = window.confirm(
      "Se borrará el historial de eventos y logs, pero no las respuestas ni solicitudes de invitados. ¿Continuar?"
    );
    if (!confirmar) return;

    await clearAdminActivityHistory();
    setNotice({ type: "success", text: "Historial de actividad y logs limpiado." });
    await loadData();
  }

  return (
    <section className="space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6">
      <div className="app-surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="app-kicker">Actividad</p>
            <h1 className="app-page-title mt-4">Centro de control de actividad</h1>
            <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
              Sigue confirmaciones, logística, música, chat y otros cambios relevantes sin perderte en una pantalla infinita.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLimpiar()}
            className="rounded-full border border-red-300/70 px-4 py-2 text-sm text-red-700"
          >
            Borrar historial
          </button>
        </div>
      </div>

      {notice ? (
        <div
          className={`app-panel p-4 text-sm ${
            notice.type === "error" ? "border-red-300/60 text-red-700" : "border-emerald-300/60 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="app-surface-soft p-4">
          <p className="text-sm text-[var(--app-muted)]">Confirmaciones</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.confirmados}</p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">Invitados que asistirán</p>
        </article>
        <article className="app-surface-soft p-4">
          <p className="text-sm text-[var(--app-muted)]">Rechazos</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.rechazados}</p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">Invitados que no asistirán</p>
        </article>
        <article className="app-surface-soft p-4">
          <p className="text-sm text-[var(--app-muted)]">Plazas transporte</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.totalPlazasTransporte}</p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">Solicitadas por invitados</p>
        </article>
        <article className="app-surface-soft p-4">
          <p className="text-sm text-[var(--app-muted)]">RSVP con alergias</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.totalConAlergias}</p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">Dietas e intolerancias</p>
        </article>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={expandAll} className="app-button-secondary">
            Expandir todo
          </button>
          <button type="button" onClick={collapseAll} className="app-button-secondary">
            Contraer todo
          </button>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as "todas" | ActivityCategory)}
            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={(event) => setPeriodFilter(event.target.value as ActivityPeriodFilter)}
            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          >
            <option value="hoy">Hoy</option>
            <option value="ultimos_7_dias">Últimos 7 días</option>
            <option value="todo">Todo</option>
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={onlyImportant}
              onChange={(event) => setOnlyImportant(event.target.checked)}
            />
            Solo importante
          </label>
        </div>
      </section>

      {loading ? (
        <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">Cargando actividad…</div>
      ) : (
        <div className="space-y-4">
          {filteredBlocks.map((block) => {
            const isCollapsed = collapsed[block.id] ?? block.id !== "timeline";
            return (
              <section key={block.id} className="app-panel p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => toggleBlock(block.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{block.title}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getBlockTone(block.id)}`}>
                        {block.count}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--app-muted)]">
                      {isCollapsed ? block.collapsedHint : "Abierto para revisar el detalle."}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs">
                    {isCollapsed ? "Abrir" : "Cerrar"}
                  </span>
                </button>

                {!isCollapsed ? (
                  <div className="mt-5">
                    {renderTimelineTable(block.id === "timeline" ? block.items : block.items.slice(0, 50))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
