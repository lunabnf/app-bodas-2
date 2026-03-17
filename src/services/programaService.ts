import { z } from "zod";
import {
  weddingProgramDocumentSchema,
  weddingProgramSchema,
} from "../domain/schemas";
import type {
  WeddingProgramCategory,
  WeddingProgramDocument,
  WeddingProgramItem,
} from "../domain/program";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";

const PROGRAM_KEY = "wedding.programa";

const programStorageSchema = z.union([weddingProgramDocumentSchema, weddingProgramSchema]);
type LegacyWeddingProgramItem = z.infer<typeof weddingProgramSchema>[number];
type ProgramStorageShape = z.infer<typeof programStorageSchema>;
type RawWeddingProgramItem = {
  id?: string;
  hora?: string;
  titulo?: string;
  subtitulo?: string | undefined;
  descripcion?: string | undefined;
  ubicacion?: string | undefined;
  visible?: boolean | undefined;
  orden?: number | undefined;
  categoria?: string | undefined;
};

export const defaultWeddingProgramDocument: WeddingProgramDocument = {
  config: {
    tituloSeccion: "Programa del día",
    subtituloSeccion:
      "Horario principal del evento para que todos sepan qué ocurre, cuándo empieza y dónde sucede.",
  },
  items: [],
};

const allowedCategories: WeddingProgramCategory[] = [
  "general",
  "recepcion",
  "ceremonia",
  "cocktail",
  "banquete",
  "baile",
  "fiesta",
  "traslado",
];

function normalizeCategory(value?: string): WeddingProgramCategory {
  return allowedCategories.includes(value as WeddingProgramCategory)
    ? (value as WeddingProgramCategory)
    : "general";
}

function normalizeItem(item: RawWeddingProgramItem, index: number): WeddingProgramItem {
  return {
    id: item.id?.trim() || crypto.randomUUID(),
    hora: item.hora?.trim() || "",
    titulo: item.titulo?.trim() || `Momento ${index + 1}`,
    subtitulo: item.subtitulo?.trim() || "",
    ...(item.descripcion?.trim() ? { descripcion: item.descripcion.trim() } : {}),
    ...(item.ubicacion?.trim() ? { ubicacion: item.ubicacion.trim() } : {}),
    visible: item.visible ?? true,
    orden: typeof item.orden === "number" ? item.orden : index,
    categoria: normalizeCategory(item.categoria),
  };
}

function sortProgramItems(items: WeddingProgramItem[]) {
  return [...items].sort((a, b) => {
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.hora.localeCompare(b.hora);
  });
}

function timeValue(value: string) {
  const normalized = value.trim();
  if (!normalized) return "99:99";
  return normalized;
}

function reindexProgramItems(items: WeddingProgramItem[]) {
  return sortProgramItems(items).map((item, index) => ({
    ...item,
    orden: index,
  }));
}

function normalizeDocument(source: ProgramStorageShape): WeddingProgramDocument {
  if (Array.isArray(source)) {
    return {
      ...defaultWeddingProgramDocument,
      items: reindexProgramItems(
        source.map((item: LegacyWeddingProgramItem, index) => normalizeItem(item, index))
      ),
    };
  }

  return {
    config: {
      ...defaultWeddingProgramDocument.config,
      ...source.config,
    },
    items: reindexProgramItems(source.items.map((item, index) => normalizeItem(item, index))),
  };
}

export type WeddingProgramEvent = WeddingProgramItem;

export function getWeddingProgramDocument(): WeddingProgramDocument {
  const scopedKey = scopedStorageKey(PROGRAM_KEY);
  const parsed = readStorageWithSchema<ProgramStorageShape | null>(
    scopedKey,
    programStorageSchema.nullable(),
    null
  );

  if (!parsed) {
    return defaultWeddingProgramDocument;
  }

  const normalized = normalizeDocument(parsed);
  writeStorage(scopedKey, normalized);
  return normalized;
}

export function getWeddingProgram(): WeddingProgramItem[] {
  return getWeddingProgramDocument().items;
}

export function getVisibleWeddingProgram(): WeddingProgramItem[] {
  return getWeddingProgramDocument().items.filter((item) => item.visible);
}

export function saveWeddingProgramDocument(document: WeddingProgramDocument) {
  const normalized = normalizeDocument(document);
  writeStorage(scopedStorageKey(PROGRAM_KEY), normalized);
}

export function saveWeddingProgram(events: WeddingProgramItem[]) {
  const current = getWeddingProgramDocument();
  saveWeddingProgramDocument({
    ...current,
    items: events,
  });
}

export function createEmptyProgramItem(order: number): WeddingProgramItem {
  return {
    id: crypto.randomUUID(),
    hora: "",
    titulo: "",
    subtitulo: "",
    visible: true,
    orden: order,
    categoria: "general",
  };
}

export function moveProgramItem(
  items: WeddingProgramItem[],
  index: number,
  direction: "up" | "down"
) {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const next = [...items];
  const current = next[index];
  const target = next[targetIndex];
  if (!current || !target) return items;

  next[index] = target;
  next[targetIndex] = current;
  return reindexProgramItems(next);
}

export function sortProgramItemsByHour(items: WeddingProgramItem[]) {
  const next = [...items].sort((a, b) => {
    const timeCompare = timeValue(a.hora).localeCompare(timeValue(b.hora));
    if (timeCompare !== 0) return timeCompare;
    return a.orden - b.orden;
  });

  return reindexProgramItems(next);
}

export function getProgramCategoryOptions(): Array<{ value: WeddingProgramCategory; label: string }> {
  return [
    { value: "general", label: "General" },
    { value: "recepcion", label: "Recepción" },
    { value: "ceremonia", label: "Ceremonia" },
    { value: "cocktail", label: "Cóctel" },
    { value: "banquete", label: "Banquete" },
    { value: "baile", label: "Primer baile" },
    { value: "fiesta", label: "Fiesta" },
    { value: "traslado", label: "Traslado" },
  ];
}
