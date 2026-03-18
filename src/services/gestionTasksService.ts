import type {
  GestionDocument,
  GestionRelatedModule,
  GestionTask,
  GestionTaskCategory,
  GestionTaskPhase,
  GestionTaskPriority,
} from "../domain/gestion";
import { gestionDocumentSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey, getActiveEventId } from "./eventScopeService";
import { getOwnerEventById } from "./ownerEventsService";
import { getWeddingSettings } from "./weddingSettingsService";

const GESTION_STORAGE_KEY = "wedding.gestion";

type TemplateSeed = {
  title: string;
  category: GestionTaskCategory;
  phase: GestionTaskPhase;
  priority: GestionTaskPriority;
  relatedModule?: GestionRelatedModule;
  dueOffsetDaysFromWedding?: number;
  dueOffsetDaysFromOpening?: number;
  notes?: string;
};

const phaseLabels: Record<GestionTaskPhase, string> = {
  pre_apertura: "Antes de abrir a invitados",
  apertura: "Apertura a invitados",
  post_apertura: "Después de la apertura",
  recta_final: "Recta final",
};

const categoryLabels: Record<GestionTaskCategory, string> = {
  planificacion: "Planificación",
  invitados: "Invitados",
  programa: "Programa",
  logistica: "Logística",
  presupuesto: "Presupuesto",
  proveedores: "Proveedores",
  ceremonia: "Ceremonia",
  otros: "Otros",
};

const priorityLabels: Record<GestionTaskPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const moduleLabels: Record<GestionRelatedModule, string> = {
  invitados: "Invitados",
  mesas: "Mesas",
  ceremonia: "Ceremonia",
  programa: "Programa",
  alojamientos: "Alojamientos",
  desplazamientos: "Desplazamientos",
  presupuesto: "Presupuesto",
  actividad: "Actividad",
  ajustes: "Ajustes",
  musica: "Música",
  chat: "Chat",
  archivos: "Archivos",
};

function generateId() {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function addDays(baseDate: string | undefined, offset: number): string | undefined {
  if (!baseDate) return undefined;
  const parsed = new Date(`${baseDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  parsed.setDate(parsed.getDate() + offset);
  return parsed.toISOString().slice(0, 10);
}

function getOpeningLeadDays(): number {
  const eventId = getActiveEventId();
  const event = getOwnerEventById(eventId);
  switch (event?.plan) {
    case "premium":
      return 110;
    case "pro":
      return 70;
    default:
      return 45;
  }
}

export function getGestionOpeningLeadDays(): number {
  return getOpeningLeadDays();
}

function getBaseDates() {
  const settings = getWeddingSettings();
  const weddingDate = normalizeDate(settings.fecha);
  const openingLeadDays = getOpeningLeadDays();
  const guestOpeningDate = weddingDate ? addDays(weddingDate, -openingLeadDays) : undefined;

  return {
    weddingDate,
    guestOpeningDate,
    openingLeadDays,
  };
}

export function getGestionBaseDates() {
  return getBaseDates();
}

function createTemplateSeeds(openingLeadDays: number): TemplateSeed[] {
  return [
    {
      title: "Definir estilo general y prioridades del evento",
      category: "planificacion",
      phase: "pre_apertura",
      priority: "alta",
      dueOffsetDaysFromOpening: -21,
      notes: "Alinead tono, prioridades y lo que queréis resolver antes de abrir a invitados.",
    },
    {
      title: "Configurar portada, ajustes y visibilidad de módulos",
      category: "planificacion",
      phase: "pre_apertura",
      priority: "media",
      relatedModule: "ajustes",
      dueOffsetDaysFromOpening: -14,
    },
    {
      title: "Cargar invitados y revisar grupos / accesos",
      category: "invitados",
      phase: "pre_apertura",
      priority: "alta",
      relatedModule: "invitados",
      dueOffsetDaysFromOpening: -10,
    },
    {
      title: "Preparar programa y mensajes previos",
      category: "programa",
      phase: "pre_apertura",
      priority: "media",
      relatedModule: "programa",
      dueOffsetDaysFromOpening: -7,
    },
    {
      title: `Abrir zona invitados (${openingLeadDays} días antes)`,
      category: "planificacion",
      phase: "apertura",
      priority: "alta",
      relatedModule: "ajustes",
      dueOffsetDaysFromOpening: 0,
      notes: "Hito principal para activar la parte pública y empezar a recoger respuestas.",
    },
    {
      title: "Revisar RSVP y resolver dudas de invitados",
      category: "invitados",
      phase: "post_apertura",
      priority: "alta",
      relatedModule: "actividad",
      dueOffsetDaysFromWedding: -30,
    },
    {
      title: "Analizar demanda de alojamientos y transporte",
      category: "logistica",
      phase: "post_apertura",
      priority: "media",
      relatedModule: "desplazamientos",
      dueOffsetDaysFromWedding: -25,
    },
    {
      title: "Revisar presupuesto dinámico con confirmaciones reales",
      category: "presupuesto",
      phase: "post_apertura",
      priority: "alta",
      relatedModule: "presupuesto",
      dueOffsetDaysFromWedding: -21,
    },
    {
      title: "Cerrar seating de mesas",
      category: "ceremonia",
      phase: "recta_final",
      priority: "alta",
      relatedModule: "mesas",
      dueOffsetDaysFromWedding: -10,
    },
    {
      title: "Cerrar asientos de ceremonia",
      category: "ceremonia",
      phase: "recta_final",
      priority: "media",
      relatedModule: "ceremonia",
      dueOffsetDaysFromWedding: -9,
    },
    {
      title: "Enviar resumen final a proveedores clave",
      category: "proveedores",
      phase: "recta_final",
      priority: "media",
      relatedModule: "archivos",
      dueOffsetDaysFromWedding: -5,
    },
    {
      title: "Verificar checklist final del evento",
      category: "planificacion",
      phase: "recta_final",
      priority: "alta",
      relatedModule: "actividad",
      dueOffsetDaysFromWedding: -3,
    },
  ];
}

function seedToTask(seed: TemplateSeed, index: number, dates: ReturnType<typeof getBaseDates>): GestionTask {
  const dueDate = seed.dueOffsetDaysFromWedding !== undefined
    ? addDays(dates.weddingDate, seed.dueOffsetDaysFromWedding)
    : addDays(dates.guestOpeningDate, seed.dueOffsetDaysFromOpening ?? 0);

  return {
    id: generateId(),
    title: seed.title,
    category: seed.category,
    phase: seed.phase,
    priority: seed.priority,
    ...(dueDate ? { dueDate } : {}),
    completed: false,
    ...(seed.notes ? { notes: seed.notes } : {}),
    ...(seed.relatedModule ? { relatedModule: seed.relatedModule } : {}),
    source: "template",
    order: index,
  };
}

function createDefaultGestionDocument(): GestionDocument {
  const dates = getBaseDates();
  const tasks = createTemplateSeeds(dates.openingLeadDays).map((seed, index) =>
    seedToTask(seed, index, dates)
  );

  return {
    ...(dates.guestOpeningDate ? { guestOpeningDate: dates.guestOpeningDate } : {}),
    tasks,
    updatedAt: Date.now(),
  };
}

function normalizeTask(raw: GestionTask, index: number): GestionTask {
  const normalizedDueDate = normalizeDate(raw.dueDate);
  return {
    id: raw.id || generateId(),
    title: raw.title?.trim() || `Tarea ${index + 1}`,
    category: raw.category || "otros",
    phase: raw.phase || "post_apertura",
    priority: raw.priority || "media",
    ...(normalizedDueDate ? { dueDate: normalizedDueDate } : {}),
    completed: raw.completed === true,
    ...(raw.completedAt ? { completedAt: raw.completedAt } : {}),
    ...(raw.notes?.trim() ? { notes: raw.notes.trim() } : {}),
    ...(raw.relatedModule ? { relatedModule: raw.relatedModule } : {}),
    source: raw.source === "manual" ? "manual" : "template",
    order: Number.isFinite(raw.order) ? Math.max(Math.round(raw.order), 0) : index,
  };
}

function normalizeDocument(document: GestionDocument): GestionDocument {
  const normalizedGuestOpeningDate = normalizeDate(document.guestOpeningDate);
  return {
    ...(normalizedGuestOpeningDate ? { guestOpeningDate: normalizedGuestOpeningDate } : {}),
    tasks: document.tasks
      .map((task, index) => normalizeTask(task, index))
      .sort((a, b) => a.order - b.order)
      .map((task, index) => ({ ...task, order: index })),
    updatedAt: Date.now(),
  };
}

export function getGestionDocument(): GestionDocument {
  const scopedKey = scopedStorageKey(GESTION_STORAGE_KEY);
  const stored = readStorageWithSchema<GestionDocument | null>(
    scopedKey,
    gestionDocumentSchema.nullable(),
    null
  );

  if (!stored) {
    const next = createDefaultGestionDocument();
    writeStorage(scopedKey, next);
    return next;
  }

  const normalized = normalizeDocument(stored);
  writeStorage(scopedKey, normalized);
  return normalized;
}

export function saveGestionDocument(document: GestionDocument) {
  writeStorage(scopedStorageKey(GESTION_STORAGE_KEY), normalizeDocument(document));
}

export function createEmptyGestionTask(order: number): GestionTask {
  return {
    id: generateId(),
    title: "",
    category: "otros",
    phase: "post_apertura",
    priority: "media",
    completed: false,
    source: "manual",
    order,
  };
}

export function moveGestionTask(
  tasks: GestionTask[],
  taskId: string,
  direction: "up" | "down"
) {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) return tasks;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= tasks.length) return tasks;

  const next = [...tasks];
  const current = next[index];
  const target = next[targetIndex];
  if (!current || !target) return tasks;

  next[index] = target;
  next[targetIndex] = current;
  return next.map((task, order) => ({ ...task, order }));
}

export function getGestionPhaseLabel(phase: GestionTaskPhase) {
  return phaseLabels[phase];
}

export function getGestionCategoryOptions() {
  return Object.entries(categoryLabels).map(([value, label]) => ({
    value: value as GestionTaskCategory,
    label,
  }));
}

export function getGestionPriorityOptions() {
  return Object.entries(priorityLabels).map(([value, label]) => ({
    value: value as GestionTaskPriority,
    label,
  }));
}

export function getGestionModuleOptions() {
  return Object.entries(moduleLabels).map(([value, label]) => ({
    value: value as GestionRelatedModule,
    label,
  }));
}

export function getGestionModulePath(module: GestionRelatedModule | undefined, adminBasePath: string) {
  if (!module) return adminBasePath;
  return `${adminBasePath}/${module}`;
}
