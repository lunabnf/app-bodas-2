import { useEffect, useMemo, useState } from "react";
import type { BudgetComputedItem, BudgetDocument, BudgetItem } from "../domain/budget";
import {
  computeBudgetItems,
  computeBudgetSummary,
  createEmptyBudgetItem,
  getBudgetCategoryOptions,
  getBudgetDocument,
  getBudgetDynamicContext,
  getBudgetVariableSourceOptions,
  getGuestBudgetSnapshot,
  saveBudgetDocument,
  getBudgetVariableSourceLabel,
} from "../services/guestBudgetService";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const categoryOptions = getBudgetCategoryOptions();
const variableSourceOptions = getBudgetVariableSourceOptions();

function formatCurrency(value: number) {
  return `${value.toLocaleString("es-ES")} €`;
}

function ratioWidth(part: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.min((part / total) * 100, 100)}%`;
}

function getDeviationTone(value: number) {
  if (value > 0) return "text-red-700";
  if (value < 0) return "text-emerald-700";
  return "text-[var(--app-ink)]";
}

function getBudgetAlertLevel(item: BudgetComputedItem): "warning" | "danger" | null {
  if (item.currentAmountComputed > item.plannedAmountComputed) return "danger";
  if (item.pendingAmountComputed > 0 && item.paidAmount === 0) return "warning";
  return null;
}

function getBudgetAlertText(item: BudgetComputedItem): string | null {
  if (item.currentAmountComputed > item.plannedAmountComputed) {
    return `Se ha desviado ${formatCurrency(item.currentAmountComputed - item.plannedAmountComputed)} sobre lo previsto.`;
  }
  if (item.pendingAmountComputed > 0 && item.paidAmount === 0) {
    return `Aún no tiene pagos registrados y quedan ${formatCurrency(item.pendingAmountComputed)} por cubrir.`;
  }
  return null;
}

function updateItem(items: BudgetItem[], itemId: string, patch: Partial<BudgetItem>) {
  return items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
}

export default function Presupuesto() {
  const [document, setDocument] = useState<BudgetDocument>(() => getBudgetDocument());
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(() => getGuestBudgetSnapshot());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"todos" | BudgetItem["category"]>("todos");
  const [typeFilter, setTypeFilter] = useState<"todos" | BudgetItem["type"]>("todos");
  const [alertFilter, setAlertFilter] = useState<"todos" | "alertas">("todos");
  const [dynamicContext, setDynamicContext] = useState({
    confirmedAdults: 0,
    confirmedChildren: 0,
    confirmedGuests: 0,
    requestedTransportSeats: 0,
  });

  async function loadBudgetState() {
    setLoading(true);
    const [context] = await Promise.all([getBudgetDynamicContext()]);
    setDocument(getBudgetDocument());
    setSnapshot(getGuestBudgetSnapshot());
    setDynamicContext(context);
    setLoading(false);
  }

  useEffect(() => {
    void loadBudgetState();
  }, []);

  const computedItems = useMemo<BudgetComputedItem[]>(
    () => computeBudgetItems(document.items, dynamicContext),
    [document.items, dynamicContext]
  );

  const summary = useMemo(() => computeBudgetSummary(computedItems), [computedItems]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return computedItems.filter((item) => {
      if (categoryFilter !== "todos" && item.category !== categoryFilter) return false;
      if (typeFilter !== "todos" && item.type !== typeFilter) return false;
      if (alertFilter === "alertas" && !getBudgetAlertLevel(item)) return false;
      if (!normalizedQuery) return true;

      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.notes ?? "").toLowerCase().includes(normalizedQuery) ||
        (item.sourceLabel ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [alertFilter, categoryFilter, computedItems, search, typeFilter]);

  const alertItems = useMemo(
    () => computedItems.filter((item) => item.active && getBudgetAlertLevel(item) !== null).slice(0, 4),
    [computedItems]
  );

  const categorySummary = useMemo(() => {
    const map = new Map<
      BudgetItem["category"],
      { label: string; planned: number; current: number; paid: number; count: number }
    >();

    for (const item of computedItems.filter((entry) => entry.active)) {
      const label = categoryOptions.find((option) => option.value === item.category)?.label ?? item.category;
      const current = map.get(item.category) ?? { label, planned: 0, current: 0, paid: 0, count: 0 };
      current.planned += item.plannedAmountComputed;
      current.current += item.currentAmountComputed;
      current.paid += item.paidAmount;
      current.count += 1;
      map.set(item.category, current);
    }

    return Array.from(map.entries())
      .map(([category, values]) => ({ category, ...values }))
      .sort((left, right) => right.current - left.current);
  }, [computedItems]);

  const progressRatio = summary.currentEstimatedTotal > 0
    ? Math.min(summary.paidTotal / summary.currentEstimatedTotal, 1)
    : 0;

  const activeCount = useMemo(
    () => computedItems.filter((item) => item.active).length,
    [computedItems]
  );
  const inactiveCount = computedItems.length - activeCount;

  const sourceBreakdown = useMemo(() => {
    const rows = variableSourceOptions.map((option) => {
      const linkedItems = computedItems.filter(
        (item) => item.active && item.type === "variable" && item.variableConfig?.sourceType === option.value
      );
      const currentQuantity =
        option.value === "confirmedAdults"
          ? dynamicContext.confirmedAdults
          : option.value === "confirmedChildren"
            ? dynamicContext.confirmedChildren
            : option.value === "confirmedGuests"
              ? dynamicContext.confirmedGuests
              : dynamicContext.requestedTransportSeats;
      const currentAmount = linkedItems.reduce((sum, item) => sum + item.currentAmountComputed, 0);
      const plannedAmount = linkedItems.reduce((sum, item) => sum + item.plannedAmountComputed, 0);

      return {
        key: option.value,
        label: getBudgetVariableSourceLabel(option.value),
        currentQuantity,
        linkedItems: linkedItems.length,
        currentAmount,
        plannedAmount,
      };
    });

    return rows.filter((row) => row.linkedItems > 0);
  }, [computedItems, dynamicContext]);

  function persist(nextDocument: BudgetDocument, successText: string) {
    try {
      saveBudgetDocument(nextDocument);
      setDocument(getBudgetDocument());
      setNotice({ type: "success", text: successText });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el presupuesto.",
      });
    }
  }

  function handleAddItem() {
    const nextDocument: BudgetDocument = {
      ...document,
      items: [...document.items, createEmptyBudgetItem(document.items.length)],
      updatedAt: Date.now(),
    };
    persist(nextDocument, "Concepto añadido al presupuesto.");
  }

  function handleRemoveItem(itemId: string) {
    const nextDocument: BudgetDocument = {
      ...document,
      items: document.items
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({ ...item, order: index })),
      updatedAt: Date.now(),
    };
    persist(nextDocument, "Concepto eliminado.");
  }

  function handleMove(itemIndex: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= document.items.length) return;

    const nextItems = [...document.items];
    const currentItem = nextItems[itemIndex];
    const targetItem = nextItems[targetIndex];
    if (!currentItem || !targetItem) return;

    nextItems[itemIndex] = { ...targetItem, order: itemIndex };
    nextItems[targetIndex] = { ...currentItem, order: targetIndex };

    persist(
      {
        ...document,
        items: nextItems,
        updatedAt: Date.now(),
      },
      "Orden del presupuesto actualizado."
    );
  }

  function handleItemChange(itemId: string, patch: Partial<BudgetItem>) {
    setDocument((current) => ({
      ...current,
      items: updateItem(current.items, itemId, patch),
    }));
    setNotice(null);
  }

  function handleSaveAll() {
    persist(document, "Presupuesto guardado correctamente.");
  }

  if (loading) {
    return (
      <section className="space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6">
        <div className="app-surface p-8">
          <h1 className="app-page-title">Presupuesto</h1>
          <p className="mt-3 text-sm text-[var(--app-muted)]">Cargando presupuesto del evento…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6">
      <div className="app-surface p-8">
        <p className="app-kicker">Presupuesto</p>
        <h1 className="app-page-title mt-4">Control manual + dinámico de la boda</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Combina conceptos fijos con conceptos variables conectados a confirmaciones reales y solicitudes de transporte para ver lo previsto, lo pagado y cómo cambia el coste del evento.
        </p>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="app-surface-soft p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Previsto total</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.plannedTotal)}</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Base manual + cantidades planificadas.</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Total pagado</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.paidTotal)}</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Importe ya abonado o confirmado.</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Pendiente actual</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.pendingTotal)}</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Estimado actual menos pagos registrados.</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Estimado actual</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(summary.currentEstimatedTotal)}</p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Con asistentes y plazas de transporte actuales.</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Desviación</p>
          <p className={`mt-2 text-3xl font-semibold ${getDeviationTone(summary.deviationTotal)}`}>
            {summary.deviationTotal >= 0 ? "+" : ""}{formatCurrency(summary.deviationTotal)}
          </p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Diferencia entre previsto y estimado actual.</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Impacto confirmaciones</p>
          <p className={`mt-2 text-3xl font-semibold ${getDeviationTone(summary.dynamicImpact)}`}>
            {summary.dynamicImpact >= 0 ? "+" : ""}{formatCurrency(summary.dynamicImpact)}
          </p>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Cambio sobre la parte variable prevista.</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="app-panel space-y-4 p-5 sm:p-6">
          <div>
            <p className="app-kicker">Correlación</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Cómo se mueve el total</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Cada edición de un concepto impacta directamente en los totales superiores. Los conceptos variables además se recalculan con datos reales de invitados y transporte.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--app-ink)]">Previsto vs actual</p>
                <p className="text-sm text-[var(--app-muted)]">
                  {formatCurrency(summary.plannedTotal)} vs {formatCurrency(summary.currentEstimatedTotal)}
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(24,24,23,0.08)]">
                <div
                  className={`h-full rounded-full ${summary.currentEstimatedTotal > summary.plannedTotal ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: ratioWidth(summary.currentEstimatedTotal, Math.max(summary.plannedTotal, summary.currentEstimatedTotal)) }}
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--app-ink)]">Pagado vs pendiente</p>
                <p className="text-sm text-[var(--app-muted)]">
                  {formatCurrency(summary.paidTotal)} pagados · {formatCurrency(summary.pendingTotal)} pendientes
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(24,24,23,0.08)]">
                <div
                  className="h-full rounded-full bg-[var(--app-ink)]"
                  style={{ width: ratioWidth(summary.paidTotal, summary.currentEstimatedTotal) }}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Conceptos activos</p>
                <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
              </article>
              <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Variables activas</p>
                <p className="mt-2 text-2xl font-semibold">{computedItems.filter((item) => item.active && item.type === "variable").length}</p>
              </article>
              <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Inactivos</p>
                <p className="mt-2 text-2xl font-semibold">{inactiveCount}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="app-panel space-y-4 p-5 sm:p-6">
          <div>
            <p className="app-kicker">Origen de datos</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Trazabilidad dinámica</h2>
          </div>

          {sourceBreakdown.length > 0 ? (
            <div className="space-y-3">
              {sourceBreakdown.map((source) => (
                <article key={source.key} className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-ink)]">{source.label}</p>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        Cantidad actual: {source.currentQuantity} · Conceptos ligados: {source.linkedItems}
                      </p>
                    </div>
                    <div className="text-right text-sm text-[var(--app-muted)]">
                      <p>Previsto {formatCurrency(source.plannedAmount)}</p>
                      <p>Actual {formatCurrency(source.currentAmount)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4 text-sm text-[var(--app-muted)]">
              Aún no hay conceptos variables activos ligados a fuentes dinámicas.
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="app-panel space-y-4 p-5 sm:p-6">
          <div>
            <p className="app-kicker">Lectura rápida</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Estado del presupuesto</h2>
          </div>

          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--app-muted)]">Pagado frente a estimado actual</p>
              <p className="text-sm font-semibold text-[var(--app-ink)]">
                {Math.round(progressRatio * 100)}%
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(24,24,23,0.08)]">
              <div
                className="h-full rounded-full bg-[var(--app-ink)] transition-all"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[var(--app-muted)]">
              {formatCurrency(summary.paidTotal)} pagados de {formatCurrency(summary.currentEstimatedTotal)} estimados.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {categorySummary.slice(0, 4).map((category) => {
              const ratio = category.current > 0 ? Math.min(category.paid / category.current, 1) : 0;
              return (
                <article key={category.category} className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
                  <p className="text-sm font-semibold text-[var(--app-ink)]">{category.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    {category.count} concepto(s)
                  </p>
                  <p className="mt-3 text-sm text-[var(--app-muted)]">
                    Actual {formatCurrency(category.current)}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(24,24,23,0.08)]">
                    <div className="h-full rounded-full bg-[var(--app-ink)]" style={{ width: `${ratio * 100}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="app-panel space-y-4 p-5 sm:p-6">
          <div>
            <p className="app-kicker">Alertas</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Puntos que revisar</h2>
          </div>

          {alertItems.length > 0 ? (
            <div className="space-y-3">
              {alertItems.map((item) => {
                const level = getBudgetAlertLevel(item);
                const text = getBudgetAlertText(item);
                return (
                  <article
                    key={item.id}
                    className={`rounded-[22px] border px-4 py-4 ${
                      level === "danger"
                        ? "border-red-300/70 bg-red-50/80"
                        : "border-amber-300/70 bg-amber-50/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--app-ink)]">{item.name}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        level === "danger" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {level === "danger" ? "Desviado" : "Pendiente"}
                      </span>
                    </div>
                    {text ? <p className="mt-2 text-sm text-[var(--app-muted)]">{text}</p> : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[22px] border border-emerald-300/70 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-800">
              No hay alertas destacadas ahora mismo. El presupuesto está alineado con lo previsto o controlado por pagos registrados.
            </div>
          )}
        </section>
      </div>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="app-kicker">Impacto real</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Confirmaciones y costes variables</h2>
          </div>
          <button type="button" onClick={() => void loadBudgetState()} className="app-button-secondary">
            Recalcular ahora
          </button>
        </div>

          <div className="grid gap-3 md:grid-cols-4">
          <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Adultos confirmados</p>
            <p className="mt-2 text-2xl font-semibold">{snapshot.adultosConfirmados}</p>
          </article>
          <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Niños confirmados</p>
            <p className="mt-2 text-2xl font-semibold">{snapshot.ninosConfirmados}</p>
          </article>
          <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Total actual</p>
            <p className="mt-2 text-2xl font-semibold">{snapshot.totalConfirmados}</p>
          </article>
          <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Plazas solicitadas</p>
            <p className="mt-2 text-2xl font-semibold">{dynamicContext.requestedTransportSeats}</p>
          </article>
          </div>

          <div className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4 text-sm text-[var(--app-muted)]">
          Parte variable prevista: <strong className="text-[var(--app-ink)]">{formatCurrency(summary.dynamicPlannedTotal)}</strong>
          {" · "}
          Parte variable actual: <strong className="text-[var(--app-ink)]">{formatCurrency(summary.dynamicCurrentTotal)}</strong>
          {" · "}
          Snapshot asistentes actualizado: <strong className="text-[var(--app-ink)]">{new Date(snapshot.updatedAt).toLocaleString()}</strong>
        </div>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleAddItem} className="app-button-secondary">
            Añadir concepto
          </button>
          <button type="button" onClick={handleSaveAll} className="app-button-primary">
            Guardar presupuesto
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_180px_160px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar concepto o nota"
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as "todos" | BudgetItem["category"])}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          >
            <option value="todos">Todas las categorías</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as "todos" | BudgetItem["type"])}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          >
            <option value="todos">Todos los tipos</option>
            <option value="fixed">Fijos</option>
            <option value="variable">Variables</option>
          </select>
          <select
            value={alertFilter}
            onChange={(event) => setAlertFilter(event.target.value as "todos" | "alertas")}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          >
            <option value="todos">Todo</option>
            <option value="alertas">Solo alertas</option>
          </select>
        </div>
        <p className="text-sm text-[var(--app-muted)]">
          La tabla se recalcula al instante mientras editas. `Previsto`, `Actual`, `Pagado` y `Pendiente` están correlacionados entre sí y con el resumen superior.
        </p>
      </section>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
            No hay conceptos que coincidan con los filtros actuales.
          </div>
        ) : filteredItems.map((item) => {
          const index = computedItems.findIndex((entry) => entry.id === item.id);
          const alertLevel = getBudgetAlertLevel(item);
          const alertText = getBudgetAlertText(item);
          return (
          <article key={item.id} className="app-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{item.name || "Nuevo concepto"}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      item.type === "variable" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.type === "variable" ? "Variable" : "Fijo"}
                  </span>
                  {!item.active ? (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-700">
                      Inactivo
                    </span>
                  ) : null}
                  {alertLevel ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      alertLevel === "danger" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {alertLevel === "danger" ? "Desviado" : "Revisar"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-[var(--app-muted)]">
                  Previsto: {formatCurrency(item.plannedAmountComputed)} ·
                  Actual: {formatCurrency(item.currentAmountComputed)} ·
                  Pagado: {formatCurrency(item.paidAmount)} ·
                  Pendiente: {formatCurrency(item.pendingAmountComputed)}
                </p>
                {alertText ? (
                  <p className="mt-2 text-sm text-[var(--app-muted)]">{alertText}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleMove(index, "up")} className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs">
                  Subir
                </button>
                <button type="button" onClick={() => handleMove(index, "down")} className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs">
                  Bajar
                </button>
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="rounded-full border border-red-300/70 px-3 py-1 text-xs text-red-700">
                  Eliminar
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-[var(--app-muted)]">Concepto</span>
                <input
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                  value={item.name}
                  onChange={(event) => handleItemChange(item.id, { name: event.target.value })}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-[var(--app-muted)]">Categoría</span>
                <select
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                  value={item.category}
                  onChange={(event) =>
                    handleItemChange(item.id, { category: event.target.value as BudgetItem["category"] })
                  }
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm text-[var(--app-muted)]">Tipo</span>
                <select
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                  value={item.type}
                  onChange={(event) =>
                    handleItemChange(
                      item.id,
                      event.target.value === "variable"
                        ? {
                            type: "variable",
                            variableConfig:
                              item.variableConfig ?? {
                                sourceType: "confirmedGuests",
                                unitPrice: 0,
                                plannedQuantity: dynamicContext.confirmedGuests,
                              },
                          }
                        : {
                            type: "fixed",
                          }
                    )
                  }
                >
                  <option value="fixed">Fijo</option>
                  <option value="variable">Variable</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm text-[var(--app-muted)]">Pagado</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                  value={item.paidAmount}
                  onChange={(event) => handleItemChange(item.id, { paidAmount: Number(event.target.value) || 0 })}
                />
              </label>

              {item.type === "fixed" ? (
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Importe previsto</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                    value={item.plannedAmount}
                    onChange={(event) => handleItemChange(item.id, { plannedAmount: Number(event.target.value) || 0 })}
                  />
                </label>
              ) : (
                <>
                  <label className="space-y-1">
                    <span className="text-sm text-[var(--app-muted)]">Origen dinámico</span>
                    <select
                      className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                      value={item.variableConfig?.sourceType ?? "confirmedGuests"}
                      onChange={(event) =>
                        handleItemChange(item.id, {
                          variableConfig: {
                            sourceType: event.target.value as NonNullable<BudgetItem["variableConfig"]>["sourceType"],
                            unitPrice: item.variableConfig?.unitPrice ?? 0,
                            plannedQuantity: item.variableConfig?.plannedQuantity ?? 0,
                          },
                        })
                      }
                    >
                      {variableSourceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm text-[var(--app-muted)]">Precio unitario</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                      value={item.variableConfig?.unitPrice ?? 0}
                      onChange={(event) =>
                        handleItemChange(item.id, {
                          variableConfig: {
                            sourceType: item.variableConfig?.sourceType ?? "confirmedGuests",
                            unitPrice: Number(event.target.value) || 0,
                            plannedQuantity: item.variableConfig?.plannedQuantity ?? 0,
                          },
                        })
                      }
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm text-[var(--app-muted)]">Cantidad prevista</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                      value={item.variableConfig?.plannedQuantity ?? 0}
                      onChange={(event) =>
                        handleItemChange(item.id, {
                          variableConfig: {
                            sourceType: item.variableConfig?.sourceType ?? "confirmedGuests",
                            unitPrice: item.variableConfig?.unitPrice ?? 0,
                            plannedQuantity: Number(event.target.value) || 0,
                          },
                        })
                      }
                    />
                  </label>

                  <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.68)] px-4 py-3 text-sm text-[var(--app-muted)]">
                    Base actual: <strong className="text-[var(--app-ink)]">{item.currentQuantity ?? 0}</strong>
                    {" · "}
                    Base prevista: <strong className="text-[var(--app-ink)]">{item.plannedQuantity ?? 0}</strong>
                    {item.sourceLabel ? ` · ${item.sourceLabel}` : ""}
                  </div>
                </>
              )}

              <label className="space-y-1 lg:col-span-2">
                <span className="text-sm text-[var(--app-muted)]">Notas</span>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
                  value={item.notes ?? ""}
                  onChange={(event) => handleItemChange(item.id, { notes: event.target.value })}
                />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--app-muted)]">
              <input
                type="checkbox"
                checked={item.active}
                onChange={() => handleItemChange(item.id, { active: !item.active })}
              />
              <label>Concepto activo</label>
            </div>
          </article>
        );
        })}
      </div>
    </section>
  );
}
