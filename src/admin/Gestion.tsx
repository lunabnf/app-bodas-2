import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  filterTimelineItems,
  formatActivityDate,
  loadActivityDashboardData,
  type TimelineItem,
} from "../application/adminActivityService";
import { loadWeddingInsights, type WeddingInsights } from "../application/weddingInsightsService";
import type {
  GestionRelatedModule,
  GestionTask,
  GestionTaskCategory,
  GestionTaskPriority,
} from "../domain/gestion";
import { getActiveEventId } from "../services/eventScopeService";
import {
  createEmptyGestionTask,
  getGestionBaseDates,
  getGestionCategoryOptions,
  getGestionDocument,
  getGestionModuleOptions,
  getGestionModulePath,
  getGestionOpeningLeadDays,
  getGestionPhaseLabel,
  getGestionPriorityOptions,
  moveGestionTask,
  saveGestionDocument,
} from "../services/gestionTasksService";
import { getOwnerEventContext } from "../services/ownerEventContextService";
import { getOwnerEventById } from "../services/ownerEventsService";

type GestionTab = "general" | "agenda" | "checklist";

type GestionProps = {
  initialTab?: GestionTab;
};

type QuickAlert = {
  title: string;
  count: number;
  description: string;
  to: string;
};

type ChecklistStateFilter = "todas" | "pendientes" | "completadas" | "vencidas";

const TAB_OPTIONS: Array<{ id: GestionTab; label: string; description: string }> = [
  { id: "general", label: "General", description: "Estado rápido y puntos que revisar." },
  { id: "agenda", label: "Agenda", description: "Planificación temporal e hitos clave." },
  { id: "checklist", label: "Check-list", description: "Seguimiento rápido de tareas y progreso." },
];

const phaseOrder = ["pre_apertura", "apertura", "post_apertura", "recta_final"] as const;

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCompactCurrency(value: number) {
  return `${Math.round(value).toLocaleString("es-ES")} €`;
}

function getTaskTone(task: GestionTask) {
  if (task.completed) return "done";
  if (!task.dueDate) return "neutral";
  const due = new Date(`${task.dueDate}T23:59:59`).getTime();
  if (Number.isNaN(due)) return "neutral";
  if (due < Date.now()) return "late";
  return "neutral";
}

function getTaskStatusLabel(task: GestionTask) {
  const tone = getTaskTone(task);
  if (tone === "done") return "Completada";
  if (tone === "late") return "Vencida";
  return "Pendiente";
}

function getPriorityBadge(priority: GestionTaskPriority) {
  if (priority === "alta") return "Alta";
  if (priority === "baja") return "Baja";
  return "Media";
}

function toneClasses(tone: "done" | "late" | "neutral") {
  if (tone === "done") return "border-[rgba(47,106,72,0.16)] bg-[rgba(84,153,111,0.07)]";
  if (tone === "late") return "border-[rgba(180,78,40,0.18)] bg-[rgba(210,126,88,0.08)]";
  return "border-[var(--app-line)] bg-[rgba(255,255,255,0.72)]";
}

export default function Gestion({ initialTab = "general" }: GestionProps) {
  const { slug } = useParams();
  const activeEventId = getActiveEventId();
  const activeContext = getOwnerEventContext();
  const activeEvent = getOwnerEventById(activeEventId);
  const activeSlug = activeContext?.slug ?? activeEvent?.slug ?? "demo";
  const adminBasePath = slug ? `/w/${slug}/admin` : "/w/demo/admin";

  const [tab, setTab] = useState<GestionTab>(initialTab);
  const [insights, setInsights] = useState<WeddingInsights | null>(null);
  const [recentActivity, setRecentActivity] = useState<TimelineItem[]>([]);
  const [guestOpeningDate, setGuestOpeningDate] = useState<string>("");
  const [tasks, setTasks] = useState<GestionTask[]>([]);
  const [agendaNotice, setAgendaNotice] = useState<string>("");
  const [checklistCategoryFilter, setChecklistCategoryFilter] = useState<GestionTaskCategory | "todas">("todas");
  const [checklistStateFilter, setChecklistStateFilter] = useState<ChecklistStateFilter>("pendientes");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<GestionTaskCategory>("otros");
  const [newTaskPriority, setNewTaskPriority] = useState<GestionTaskPriority>("media");

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [nextInsights, activityData] = await Promise.all([
        loadWeddingInsights(),
        loadActivityDashboardData(),
      ]);
      const gestionDocument = getGestionDocument();

      if (!mounted) return;

      setInsights(nextInsights);
      setGuestOpeningDate(gestionDocument.guestOpeningDate ?? "");
      setTasks(gestionDocument.tasks);
      setRecentActivity(
        filterTimelineItems(activityData.timeline, {
          category: "todas",
          period: "ultimos_7_dias",
          onlyImportant: true,
        }).slice(0, 5)
      );
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const baseDates = useMemo(() => getGestionBaseDates(), []);
  const openingLeadDays = useMemo(() => getGestionOpeningLeadDays(), []);

  function persistTasks(nextTasks: GestionTask[], message?: string, nextOpeningDate = guestOpeningDate) {
    setTasks(nextTasks);
    setGuestOpeningDate(nextOpeningDate);
    saveGestionDocument({
      ...(nextOpeningDate ? { guestOpeningDate: nextOpeningDate } : {}),
      tasks: nextTasks,
      updatedAt: Date.now(),
    });
    if (message) setAgendaNotice(message);
  }

  function handleTaskChange(taskId: string, patch: Partial<GestionTask>) {
    const nextTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      const completedAt =
        patch.completed === true && !task.completed
          ? Date.now()
          : patch.completed === false
            ? undefined
            : task.completedAt;

      return {
        ...task,
        ...patch,
        ...(completedAt ? { completedAt } : {}),
      };
    });
    persistTasks(nextTasks);
  }

  function handleDeleteTask(taskId: string) {
    persistTasks(
      tasks.filter((task) => task.id !== taskId).map((task, index) => ({ ...task, order: index })),
      "Tarea eliminada."
    );
  }

  function handleMoveTask(taskId: string, direction: "up" | "down") {
    persistTasks(moveGestionTask(tasks, taskId, direction), "Orden actualizado.");
  }

  function handleRelatedModuleChange(taskId: string, value: string) {
    const nextTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      if (!value) {
        const nextTask = { ...task };
        delete nextTask.relatedModule;
        return nextTask;
      }
      return {
        ...task,
        relatedModule: value as GestionRelatedModule,
      };
    });
    persistTasks(nextTasks);
  }

  function handleAddManualTask() {
    if (!newTaskTitle.trim()) return;
    const nextTask: GestionTask = {
      ...createEmptyGestionTask(tasks.length),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      phase: "post_apertura",
    };
    persistTasks([...tasks, nextTask], "Tarea añadida.");
    setNewTaskTitle("");
    setNewTaskCategory("otros");
    setNewTaskPriority("media");
  }

  function handleGuestOpeningDateChange(value: string) {
    persistTasks(tasks, "Fecha de apertura actualizada.", value);
  }

  const progress = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const overdue = tasks.filter((task) => !task.completed && getTaskTone(task) === "late").length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      overdue,
      percent: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
    };
  }, [tasks]);

  const nextCriticalTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completed)
        .sort((a, b) => {
          const priorityWeight = { alta: 0, media: 1, baja: 2 };
          const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99") || a.order - b.order;
        })
        .slice(0, 4),
    [tasks]
  );

  const tasksByPhaseSummary = useMemo(
    () =>
      phaseOrder.map((phase) => {
        const items = tasks.filter((task) => task.phase === phase);
        return {
          id: phase,
          title: getGestionPhaseLabel(phase),
          total: items.length,
          completed: items.filter((task) => task.completed).length,
          overdue: items.filter((task) => !task.completed && getTaskTone(task) === "late").length,
        };
      }),
    [tasks]
  );

  const quickAlerts: QuickAlert[] = insights
    ? [
        {
          title: "Invitados pendientes",
          count: insights.pendientes,
          description: "Faltan respuestas por revisar.",
          to: `${adminBasePath}/invitados`,
        },
        {
          title: "Mesas sin cerrar",
          count: insights.sinMesa,
          description: "Confirmados sin mesa asignada.",
          to: `${adminBasePath}/mesas`,
        },
        {
          title: "Ceremonia por asignar",
          count: insights.ceremoniaSinAsignar,
          description: "Invitados aún sin asiento de ceremonia.",
          to: `${adminBasePath}/ceremonia`,
        },
        {
          title: "Presupuesto pendiente",
          count: Math.round(insights.presupuestoResumen.summary.pendingTotal),
          description: "Importe que sigue pendiente de cubrir o pagar.",
          to: `${adminBasePath}/presupuesto`,
        },
      ]
    : [];

  const agendaByPhase = useMemo(
    () =>
      phaseOrder.map((phase) => ({
        id: phase,
        title: getGestionPhaseLabel(phase),
        items: tasks
          .filter((task) => task.phase === phase)
          .sort((a, b) => (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99") || a.order - b.order),
      })),
    [tasks]
  );

  const checklistItems = useMemo(() => {
    return tasks.filter((task) => {
      if (checklistCategoryFilter !== "todas" && task.category !== checklistCategoryFilter) return false;
      if (checklistStateFilter === "pendientes") return !task.completed;
      if (checklistStateFilter === "completadas") return task.completed;
      if (checklistStateFilter === "vencidas") return !task.completed && getTaskTone(task) === "late";
      return true;
    });
  }, [tasks, checklistCategoryFilter, checklistStateFilter]);

  const categoryOptions = getGestionCategoryOptions();
  const priorityOptions = getGestionPriorityOptions();
  const moduleOptions = getGestionModuleOptions();
  const totalGuests = insights?.totalInvitados ?? 0;
  const rsvpResponses = insights?.rsvpRespondidos ?? 0;
  const rsvpProgress = totalGuests === 0 ? 0 : Math.min(100, Math.round((rsvpResponses / totalGuests) * 100));
  const assignedGuests = Math.max((insights?.confirmados ?? 0) - (insights?.sinMesa ?? 0), 0);
  const dashboardModules = [
    {
      label: "Invitados",
      eyebrow: "Lista principal",
      metric: totalGuests.toLocaleString("es-ES"),
      description:
        totalGuests > 0
          ? `${insights?.confirmados ?? 0} confirmados y ${insights?.pendientes ?? 0} pendientes`
          : "Añade la lista de personas que compartirán vuestro día.",
      to: `${adminBasePath}/invitados`,
      action: totalGuests > 0 ? "Gestionar invitados" : "Añadir invitados",
    },
    {
      label: "Confirmaciones RSVP",
      eyebrow: "Respuestas",
      metric: `${rsvpProgress}%`,
      description:
        totalGuests > 0
          ? `${rsvpResponses} respuestas recibidas de ${totalGuests} invitados`
          : "Las respuestas aparecerán aquí cuando prepares las invitaciones.",
      to: `${adminBasePath}/invitados`,
      action: "Revisar confirmaciones",
    },
    {
      label: "Mesas",
      eyebrow: "Organización",
      metric: `${assignedGuests}/${insights?.confirmados ?? 0}`,
      description:
        (insights?.sinMesa ?? 0) > 0
          ? `${insights?.sinMesa ?? 0} confirmados todavía necesitan mesa`
          : "Todos los invitados confirmados tienen mesa asignada.",
      to: `${adminBasePath}/mesas`,
      action: "Organizar mesas",
    },
    {
      label: "Música",
      eyebrow: "Participación",
      metric: (insights?.musica.propuestas ?? 0).toLocaleString("es-ES"),
      description:
        (insights?.musica.propuestas ?? 0) > 0
          ? `${insights?.musica.votosTotales ?? 0} votos entre las propuestas`
          : "Todavía no hay canciones propuestas por los invitados.",
      to: `${adminBasePath}/musica`,
      action: "Abrir música",
    },
    {
      label: "Alojamiento",
      eyebrow: "Logística",
      metric: (insights?.alojamiento.invitadosInteresados ?? 0).toLocaleString("es-ES"),
      description:
        (insights?.alojamiento.invitadosInteresados ?? 0) > 0
          ? `${insights?.alojamiento.personasPotenciales ?? 0} personas potenciales`
          : "Publica opciones cómodas para quienes vienen de fuera.",
      to: `${adminBasePath}/alojamientos`,
      action: "Gestionar alojamiento",
    },
    {
      label: "Programa de la boda",
      eyebrow: "Experiencia",
      metric: `${insights?.programa.visibles ?? 0}/${insights?.programa.total ?? 0}`,
      description: insights?.programa.publicado
        ? "El programa está publicado para los invitados."
        : "Completa y publica los momentos importantes del día.",
      to: `${adminBasePath}/programa`,
      action: "Editar programa",
    },
    {
      label: "Ajustes de la boda",
      eyebrow: "Personalización",
      metric: insights?.publicacion.mesasPublicadas ? "En directo" : "Privado",
      description: "Revisa la identidad, la visibilidad y las opciones de la web.",
      to: `${adminBasePath}/ajustes`,
      action: "Abrir ajustes",
    },
  ];

  return (
    <div className="space-y-6 text-[var(--app-ink)]">
      <section className="app-surface overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">Panel de novios</p>
            <h1 className="app-page-title mt-4">Todo lo importante, en calma.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)] sm:text-lg">
              Una vista sencilla para saber cómo avanza la boda y entrar directamente en lo que necesita atención.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.74)] px-4 py-2.5 text-sm text-[var(--app-muted)] lg:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#5f8069]" />
            <span className="font-medium text-[var(--app-ink)]">{activeEvent?.coupleLabel ?? activeContext?.coupleLabel ?? "Boda activa"}</span>
            <span className="hidden sm:inline">/{activeSlug}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-2 rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.54)] p-2 md:grid-cols-3">
          {TAB_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-[18px] border px-4 py-3 text-left transition sm:px-5 sm:py-4 ${
                tab === item.id
                  ? "border-[#181817] bg-[#181817] text-[#f8f7f3] shadow-[0_12px_28px_rgba(24,24,23,0.14)]"
                  : "border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.72)]"
              }`}
            >
              <p className="font-semibold">{item.label}</p>
              <p className={`mt-1 hidden text-sm sm:block ${tab === item.id ? "text-[#d8d6cf]" : "text-[var(--app-muted)]"}`}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {tab === "general" ? (
        <div className="space-y-8">
          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-kicker">Vista general</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">La boda, de un vistazo</h2>
              </div>
              <p className="text-sm text-[var(--app-muted)]">
                Apertura prevista: <span className="font-medium text-[var(--app-ink)]">{formatDate(guestOpeningDate)}</span>
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {!insights ? (
                Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="app-surface-soft min-h-56 animate-pulse p-6">
                    <div className="h-3 w-24 rounded-full bg-[rgba(24,24,23,0.08)]" />
                    <div className="mt-8 h-10 w-20 rounded-xl bg-[rgba(24,24,23,0.08)]" />
                    <div className="mt-5 h-4 w-full rounded-full bg-[rgba(24,24,23,0.06)]" />
                    <div className="mt-2 h-4 w-2/3 rounded-full bg-[rgba(24,24,23,0.06)]" />
                  </div>
                ))
              ) : (
                dashboardModules.map((item, index) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`group app-surface-soft flex min-h-56 flex-col justify-between p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--app-line-strong)] hover:shadow-[0_22px_48px_rgba(53,52,48,0.09)] ${
                      index === 0 ? "md:col-span-2 xl:col-span-1" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">{item.eyebrow}</p>
                          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{item.label}</h3>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.75)] text-lg transition group-hover:bg-[#181817] group-hover:text-[#f8f7f3]">
                          &rarr;
                        </span>
                      </div>
                      <p className="mt-7 text-4xl font-semibold tracking-[-0.055em]">{item.metric}</p>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--app-muted)]">{item.description}</p>
                    </div>
                    <p className="mt-6 text-sm font-semibold">{item.action}</p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.85fr)]">
            <div className="app-surface-soft p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="app-kicker">Prioridades</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Qué falta por revisar</h2>
                </div>
                <Link to={`${adminBasePath}/actividad`} className="app-button-secondary inline-flex">
                  Ver actividad
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                {quickAlerts.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 transition hover:translate-y-[-1px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-[var(--app-muted)]">{item.description}</p>
                      </div>
                      <p className="text-2xl font-semibold tracking-[-0.04em]">
                        {item.count.toLocaleString("es-ES")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="app-surface-soft p-6">
                <p className="app-kicker">Próximas tareas</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Siguiente foco</h2>
                <div className="mt-5 space-y-3">
                  {nextCriticalTasks.length > 0 ? nextCriticalTasks.map((task) => (
                    <article key={task.id} className={`rounded-[20px] border p-4 ${toneClasses(getTaskTone(task))}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{task.title}</p>
                          <p className="mt-1 text-sm text-[var(--app-muted)]">
                            {getGestionPhaseLabel(task.phase)} · {formatDate(task.dueDate)} · Prioridad {getPriorityBadge(task.priority)}
                          </p>
                        </div>
                        <button type="button" onClick={() => setTab("agenda")} className="app-button-secondary inline-flex">
                          Abrir
                        </button>
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[var(--app-muted)]">
                      No hay tareas pendientes. La organización va al día.
                    </div>
                  )}
                </div>
              </div>

              <div className="app-surface-soft p-6">
                <p className="app-kicker">Check-list</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Avance de tareas</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-4xl font-semibold tracking-[-0.05em]">{progress.percent}%</p>
                      <p className="text-sm text-[var(--app-muted)]">{progress.completed} de {progress.total} tareas completadas</p>
                    </div>
                    <button type="button" className="app-button-secondary inline-flex" onClick={() => setTab("checklist")}>
                      Abrir check-list
                    </button>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[rgba(24,24,23,0.08)]">
                    <div className="h-full rounded-full bg-[var(--app-ink)]" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <p className="text-sm text-[var(--app-muted)]">
                    {progress.pending} pendientes · {progress.overdue} vencidas
                  </p>
                </div>
              </div>

              <div className="app-surface-soft p-6">
                <p className="app-kicker">Actividad reciente</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Últimos hitos</h2>
                <div className="mt-5 space-y-3">
                  {recentActivity.length > 0 ? recentActivity.map((item) => (
                    <article key={item.id} className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{item.actor}</p>
                        <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                          {formatActivityDate(item.timestamp)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--app-muted)]">{item.detail}</p>
                    </article>
                  )) : (
                    <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[var(--app-muted)]">
                      Sin actividad reciente destacable.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "agenda" ? (
        <div className="space-y-6">
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="app-surface-soft p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="app-kicker">Agenda</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Planificación por fases</h2>
                  <p className="mt-2 text-sm text-[var(--app-muted)]">
                    La agenda usa una plantilla inicial por evento y un hito de apertura a invitados calculado según el plan contratado.
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--app-muted)]">
                  <p className="font-semibold text-[var(--app-ink)]">Fecha boda</p>
                  <p className="mt-1">{formatDate(baseDates.weddingDate)}</p>
                </div>
              </div>

              {agendaNotice ? (
                <div className="mt-4 rounded-[18px] border border-[rgba(47,106,72,0.18)] bg-[rgba(84,153,111,0.08)] px-4 py-3 text-sm text-[var(--app-muted)]">
                  {agendaNotice}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="text-sm text-[var(--app-muted)]">Apertura a invitados</p>
                  <input
                    type="date"
                    value={guestOpeningDate}
                    onChange={(event) => handleGuestOpeningDateChange(event.target.value)}
                    className="mt-3 w-full p-3"
                  />
                  <p className="mt-2 text-sm text-[var(--app-muted)]">
                    Referencia por plan: {openingLeadDays} días antes.
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="text-sm text-[var(--app-muted)]">Ventana activa</p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{formatDate(baseDates.weddingDate)}</p>
                  <p className="mt-2 text-sm text-[var(--app-muted)]">
                    La boda está programada para esta fecha y ordena automáticamente la recta final.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {tasksByPhaseSummary.map((phase) => (
                  <article key={phase.id} className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
                    <p className="text-sm text-[var(--app-muted)]">{phase.title}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{phase.completed}/{phase.total}</p>
                    <p className="mt-2 text-sm text-[var(--app-muted)]">
                      {phase.overdue} vencidas · {Math.max(phase.total - phase.completed, 0)} activas
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="app-surface-soft p-6">
              <p className="app-kicker">Añadir tarea</p>
              <div className="mt-4 space-y-3">
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder="Ej. Revisar seating con padres"
                  className="w-full p-3"
                />
                <select
                  value={newTaskCategory}
                  onChange={(event) => setNewTaskCategory(event.target.value as GestionTaskCategory)}
                  className="w-full p-3"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(event) => setNewTaskPriority(event.target.value as GestionTaskPriority)}
                  className="w-full p-3"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Prioridad {option.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleAddManualTask} className="app-button-primary w-full">
                  Añadir tarea manual
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {agendaByPhase.map((phase) => (
              <div key={phase.id} className="app-surface-soft p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="app-kicker">{phase.title}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{phase.items.length} tareas</h3>
                    <p className="mt-2 text-sm text-[var(--app-muted)]">
                      {phase.items.filter((task) => task.completed).length} completadas · {phase.items.filter((task) => !task.completed && getTaskTone(task) === "late").length} vencidas
                    </p>
                  </div>
                  {phase.id === "apertura" ? (
                    <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-sm text-[var(--app-muted)]">
                      Apertura prevista: {formatDate(guestOpeningDate)}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3">
                  {phase.items.length > 0 ? phase.items.map((task) => (
                    <article key={task.id} className={`rounded-[22px] border p-4 ${toneClasses(getTaskTone(task))}`}>
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem_12rem_auto]">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.65)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
                              {getTaskStatusLabel(task)}
                            </span>
                            <span className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.65)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
                              Prioridad {getPriorityBadge(task.priority)}
                            </span>
                          </div>
                          <input
                            value={task.title}
                            onChange={(event) => handleTaskChange(task.id, { title: event.target.value })}
                            className="w-full p-3 text-lg font-semibold"
                          />
                          <div className="grid gap-3 md:grid-cols-2">
                            <select
                              value={task.category}
                              onChange={(event) => handleTaskChange(task.id, { category: event.target.value as GestionTaskCategory })}
                              className="w-full p-3"
                            >
                              {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={task.priority}
                              onChange={(event) => handleTaskChange(task.id, { priority: event.target.value as GestionTaskPriority })}
                              className="w-full p-3"
                            >
                              {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  Prioridad {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={task.notes ?? ""}
                            onChange={(event) => handleTaskChange(task.id, { notes: event.target.value })}
                            placeholder="Notas internas o contexto de la tarea"
                            className="w-full p-3"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm text-[var(--app-muted)]">Fecha</label>
                          <input
                            type="date"
                            value={task.dueDate ?? ""}
                            onChange={(event) => handleTaskChange(task.id, { dueDate: event.target.value })}
                            className="w-full p-3"
                          />
                          <label className="block text-sm text-[var(--app-muted)]">Fase</label>
                          <select
                            value={task.phase}
                            onChange={(event) => handleTaskChange(task.id, { phase: event.target.value as GestionTask["phase"] })}
                            className="w-full p-3"
                          >
                            {phaseOrder.map((phaseOption) => (
                              <option key={phaseOption} value={phaseOption}>
                                {getGestionPhaseLabel(phaseOption)}
                              </option>
                            ))}
                          </select>
                          <label className="block text-sm text-[var(--app-muted)]">Módulo relacionado</label>
                          <select
                            value={task.relatedModule ?? ""}
                            onChange={(event) => handleRelatedModuleChange(task.id, event.target.value)}
                            className="w-full p-3"
                          >
                            <option value="">Sin enlace directo</option>
                            {moduleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-3 py-3 text-sm">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(event) => handleTaskChange(task.id, { completed: event.target.checked })}
                            />
                            Completada
                          </label>
                          <Link
                            to={getGestionModulePath(task.relatedModule, adminBasePath)}
                            className="app-button-secondary inline-flex w-full justify-center"
                          >
                            Abrir módulo
                          </Link>
                        </div>

                        <div className="flex flex-row gap-2 xl:flex-col">
                          <button type="button" onClick={() => handleMoveTask(task.id, "up")} className="app-button-secondary inline-flex justify-center">
                            Subir
                          </button>
                          <button type="button" onClick={() => handleMoveTask(task.id, "down")} className="app-button-secondary inline-flex justify-center">
                            Bajar
                          </button>
                          <button type="button" onClick={() => handleDeleteTask(task.id)} className="app-button-secondary inline-flex justify-center">
                            Borrar
                          </button>
                        </div>
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[var(--app-muted)]">
                      No hay tareas en esta fase todavía.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : null}

      {tab === "checklist" ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <article className="app-surface-soft p-5">
              <p className="text-sm text-[var(--app-muted)]">Progreso</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{progress.percent}%</p>
              <p className="mt-2 text-sm text-[var(--app-muted)]">Tareas completadas</p>
            </article>
            <article className="app-surface-soft p-5">
              <p className="text-sm text-[var(--app-muted)]">Pendientes</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{progress.pending}</p>
              <p className="mt-2 text-sm text-[var(--app-muted)]">Por revisar o ejecutar</p>
            </article>
            <article className="app-surface-soft p-5">
              <p className="text-sm text-[var(--app-muted)]">Vencidas</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{progress.overdue}</p>
              <p className="mt-2 text-sm text-[var(--app-muted)]">Con fecha ya superada</p>
            </article>
            <article className="app-surface-soft p-5">
              <p className="text-sm text-[var(--app-muted)]">Completadas</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{progress.completed}</p>
              <p className="mt-2 text-sm text-[var(--app-muted)]">Cerradas con la misma base de Agenda</p>
            </article>
          </section>

          <section className="app-surface-soft p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="app-kicker">Check-list</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Vista ejecutiva de tareas</h2>
              </div>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                <select
                  value={checklistStateFilter}
                  onChange={(event) => setChecklistStateFilter(event.target.value as ChecklistStateFilter)}
                  className="w-full p-3"
                >
                  <option value="todas">Todos los estados</option>
                  <option value="pendientes">Solo pendientes</option>
                  <option value="completadas">Solo completadas</option>
                  <option value="vencidas">Solo vencidas</option>
                </select>
                <select
                  value={checklistCategoryFilter}
                  onChange={(event) => setChecklistCategoryFilter(event.target.value as GestionTaskCategory | "todas")}
                  className="w-full p-3"
                >
                  <option value="todas">Todas las categorías</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[rgba(24,24,23,0.08)]">
              <div className="h-full rounded-full bg-[var(--app-ink)]" style={{ width: `${progress.percent}%` }} />
            </div>

            <div className="mt-5 space-y-3">
              {checklistItems.map((task) => (
                <article key={task.id} className={`rounded-[22px] border p-4 ${toneClasses(getTaskTone(task))}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="flex min-w-0 items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(event) => handleTaskChange(task.id, { completed: event.target.checked })}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <p className={`font-semibold ${task.completed ? "line-through opacity-60" : ""}`}>{task.title}</p>
                        <p className="mt-1 text-sm text-[var(--app-muted)]">
                          {getGestionPhaseLabel(task.phase)} · {formatDate(task.dueDate)} · Prioridad {getPriorityBadge(task.priority)} · {getTaskStatusLabel(task)}
                        </p>
                      </div>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={getGestionModulePath(task.relatedModule, adminBasePath)} className="app-button-secondary inline-flex">
                        Abrir módulo
                      </Link>
                      <button type="button" onClick={() => setTab("agenda")} className="app-button-secondary inline-flex">
                        Ver en Agenda
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {checklistItems.length === 0 ? (
                <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 text-sm text-[var(--app-muted)]">
                  No hay tareas para este filtro.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
