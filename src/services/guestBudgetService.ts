import type {
  BudgetComputedItem,
  BudgetComputedSummary,
  BudgetDocument,
  BudgetDynamicContext,
  BudgetItem,
  BudgetItemCategory,
  BudgetVariableSource,
} from "../domain/budget";
import type { Guest } from "../domain/guest";
import { budgetDocumentSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";
import { obtenerSolicitudesTransporte } from "./transporteService";
import { z } from "zod";

const SNAPSHOT_STORAGE_KEY = "wedding.guest-budget";
const DOCUMENT_STORAGE_KEY = "wedding.budget.document";

export type GuestBudgetSnapshot = {
  adultosConfirmados: number;
  ninosConfirmados: number;
  totalConfirmados: number;
  costeAdulto: number;
  costeNino: number;
  totalEstimado: number;
  updatedAt: number;
};

const DEFAULT_ADULT_COST = 120;
const DEFAULT_CHILD_COST = 60;
const guestBudgetSnapshotSchema = z.object({
  adultosConfirmados: z.number(),
  ninosConfirmados: z.number(),
  totalConfirmados: z.number(),
  costeAdulto: z.number(),
  costeNino: z.number(),
  totalEstimado: z.number(),
  updatedAt: z.number(),
});

const categoryLabels: Record<BudgetItemCategory, string> = {
  espacio: "Espacio / finca",
  catering: "Catering",
  bebidas: "Bebidas",
  tarta: "Tarta",
  decoracion: "Decoración",
  foto_video: "Fotografía / vídeo",
  musica: "Música / DJ",
  transporte: "Transporte",
  alojamiento: "Alojamiento",
  papeleria: "Papelería",
  regalos: "Regalos / detalles",
  vestuario: "Vestuario",
  belleza: "Belleza",
  alianzas: "Alianzas",
  imprevistos: "Imprevistos",
  otro: "Otro",
};

const variableSourceLabels: Record<BudgetVariableSource, string> = {
  confirmedAdults: "Adultos confirmados",
  confirmedChildren: "Niños confirmados",
  confirmedGuests: "Total confirmados",
  requestedTransportSeats: "Plazas de transporte solicitadas",
};

function generateId() {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createTemplateItems(): BudgetItem[] {
  const base: Array<Omit<BudgetItem, "id" | "order">> = [
    { name: "Finca / espacio", category: "espacio", type: "fixed", plannedAmount: 4500, paidAmount: 2000, active: true, notes: "Reserva inicial y pago final" },
    { name: "Catering adultos", category: "catering", type: "variable", plannedAmount: 0, paidAmount: 0, active: true, variableConfig: { sourceType: "confirmedAdults", unitPrice: 95, plannedQuantity: 90 } },
    { name: "Catering niños", category: "catering", type: "variable", plannedAmount: 0, paidAmount: 0, active: true, variableConfig: { sourceType: "confirmedChildren", unitPrice: 45, plannedQuantity: 8 } },
    { name: "Detalle por invitado", category: "regalos", type: "variable", plannedAmount: 0, paidAmount: 0, active: true, variableConfig: { sourceType: "confirmedGuests", unitPrice: 6, plannedQuantity: 98 } },
    { name: "Barra libre", category: "bebidas", type: "fixed", plannedAmount: 1800, paidAmount: 0, active: true, notes: "Pendiente de confirmar suplemento final" },
    { name: "Decoración", category: "decoracion", type: "fixed", plannedAmount: 1200, paidAmount: 400, active: true },
    { name: "Fotografía / vídeo", category: "foto_video", type: "fixed", plannedAmount: 2500, paidAmount: 1000, active: true },
    { name: "DJ y sonido", category: "musica", type: "fixed", plannedAmount: 1400, paidAmount: 0, active: true },
    { name: "Autobús invitados", category: "transporte", type: "variable", plannedAmount: 0, paidAmount: 0, active: true, variableConfig: { sourceType: "requestedTransportSeats", unitPrice: 12, plannedQuantity: 20 } },
    { name: "Vestuario", category: "vestuario", type: "fixed", plannedAmount: 2200, paidAmount: 1200, active: true },
    { name: "Alianzas", category: "alianzas", type: "fixed", plannedAmount: 900, paidAmount: 0, active: true },
    { name: "Imprevistos", category: "imprevistos", type: "fixed", plannedAmount: 1000, paidAmount: 0, active: true },
  ];

  return base.map((item, index) => ({
    id: generateId(),
    order: index,
    ...item,
  }));
}

const guestBudgetSnapshotFallback = computeFromGuests([]);

function computeFromGuests(guests: Guest[]): GuestBudgetSnapshot {
  const adultosConfirmados = guests.filter(
    (guest) => guest.estado === "confirmado" && guest.tipo === "Adulto" && guest.personaEstado !== "cancelada"
  ).length;

  const ninosConfirmados = guests.filter(
    (guest) => guest.estado === "confirmado" && guest.tipo === "Niño" && guest.personaEstado !== "cancelada"
  ).length;

  const totalEstimado = adultosConfirmados * DEFAULT_ADULT_COST + ninosConfirmados * DEFAULT_CHILD_COST;

  return {
    adultosConfirmados,
    ninosConfirmados,
    totalConfirmados: adultosConfirmados + ninosConfirmados,
    costeAdulto: DEFAULT_ADULT_COST,
    costeNino: DEFAULT_CHILD_COST,
    totalEstimado,
    updatedAt: Date.now(),
  };
}

function getVariableQuantity(sourceType: BudgetVariableSource, context: BudgetDynamicContext): number {
  switch (sourceType) {
    case "confirmedAdults":
      return context.confirmedAdults;
    case "confirmedChildren":
      return context.confirmedChildren;
    case "confirmedGuests":
      return context.confirmedGuests;
    case "requestedTransportSeats":
      return context.requestedTransportSeats;
    default:
      return 0;
  }
}

function normalizeItem(item: BudgetItem, index: number): BudgetItem {
  const normalizedType = item.type === "variable" ? "variable" : "fixed";
  const normalizedVariableConfig =
    normalizedType === "variable" && item.variableConfig
      ? {
          sourceType: item.variableConfig.sourceType,
          unitPrice: Number.isFinite(item.variableConfig.unitPrice) ? Math.max(item.variableConfig.unitPrice, 0) : 0,
          plannedQuantity: Number.isFinite(item.variableConfig.plannedQuantity) ? Math.max(Math.round(item.variableConfig.plannedQuantity), 0) : 0,
        }
      : undefined;

  return {
    id: item.id || generateId(),
    name: item.name?.trim() || `Concepto ${index + 1}`,
    category: item.category || "otro",
    type: normalizedType,
    plannedAmount: Number.isFinite(item.plannedAmount) ? Math.max(item.plannedAmount, 0) : 0,
    paidAmount: Number.isFinite(item.paidAmount) ? Math.max(item.paidAmount, 0) : 0,
    ...(item.notes?.trim() ? { notes: item.notes.trim() } : {}),
    active: item.active !== false,
    order: Number.isFinite(item.order) ? Math.max(Math.round(item.order), 0) : index,
    ...(normalizedVariableConfig ? { variableConfig: normalizedVariableConfig } : {}),
  };
}

function getDefaultBudgetDocument(): BudgetDocument {
  return {
    items: createTemplateItems(),
    updatedAt: Date.now(),
  };
}

export function getBudgetCategoryOptions() {
  return Object.entries(categoryLabels).map(([value, label]) => ({
    value: value as BudgetItemCategory,
    label,
  }));
}

export function getBudgetVariableSourceOptions() {
  return Object.entries(variableSourceLabels).map(([value, label]) => ({
    value: value as BudgetVariableSource,
    label,
  }));
}

export function getBudgetVariableSourceLabel(sourceType: BudgetVariableSource): string {
  return variableSourceLabels[sourceType];
}

export function createEmptyBudgetItem(order: number): BudgetItem {
  return {
    id: generateId(),
    name: "",
    category: "otro",
    type: "fixed",
    plannedAmount: 0,
    paidAmount: 0,
    notes: "",
    active: true,
    order,
  };
}

export function getGuestBudgetSnapshot(): GuestBudgetSnapshot {
  return readStorageWithSchema(
    scopedStorageKey(SNAPSHOT_STORAGE_KEY),
    guestBudgetSnapshotSchema,
    guestBudgetSnapshotFallback
  );
}

export function recalculateGuestBudgetSnapshot(guests: Guest[]): GuestBudgetSnapshot {
  const next = computeFromGuests(guests);
  writeStorage(scopedStorageKey(SNAPSHOT_STORAGE_KEY), next);
  return next;
}

export function getBudgetDocument(): BudgetDocument {
  const scopedKey = scopedStorageKey(DOCUMENT_STORAGE_KEY);
  const stored = readStorageWithSchema<BudgetDocument | null>(
    scopedKey,
    budgetDocumentSchema.nullable(),
    null
  );

  if (!stored) {
    const next = getDefaultBudgetDocument();
    writeStorage(scopedKey, next);
    return next;
  }

  return {
    items: stored.items.map((item, index) => normalizeItem(item, index)).sort((a, b) => a.order - b.order),
    updatedAt: stored.updatedAt,
  };
}

export function saveBudgetDocument(document: BudgetDocument) {
  const normalized: BudgetDocument = {
    items: document.items
      .map((item, index) => normalizeItem(item, index))
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({ ...item, order: index })),
    updatedAt: Date.now(),
  };

  writeStorage(scopedStorageKey(DOCUMENT_STORAGE_KEY), normalized);
}

export async function getBudgetDynamicContext(): Promise<BudgetDynamicContext> {
  const snapshot = getGuestBudgetSnapshot();
  const transportRequests = await obtenerSolicitudesTransporte();
  const requestedTransportSeats = transportRequests
    .filter((request) => request.needsTransport)
    .reduce((sum, request) => sum + (request.peopleCount || request.seats || 0), 0);

  return {
    confirmedAdults: snapshot.adultosConfirmados,
    confirmedChildren: snapshot.ninosConfirmados,
    confirmedGuests: snapshot.totalConfirmados,
    requestedTransportSeats,
  };
}

export function computeBudgetItems(
  items: BudgetItem[],
  context: BudgetDynamicContext
): BudgetComputedItem[] {
  return items
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      if (item.type === "variable" && item.variableConfig) {
        const currentQuantity = getVariableQuantity(item.variableConfig.sourceType, context);
        const plannedQuantity = item.variableConfig.plannedQuantity;
        const plannedAmountComputed = item.variableConfig.unitPrice * plannedQuantity;
        const currentAmountComputed = item.variableConfig.unitPrice * currentQuantity;

        return {
          ...item,
          plannedAmountComputed,
          currentAmountComputed,
          pendingAmountComputed: Math.max(currentAmountComputed - item.paidAmount, 0),
          currentQuantity,
          plannedQuantity,
          sourceLabel: getBudgetVariableSourceLabel(item.variableConfig.sourceType),
        };
      }

      return {
        ...item,
        plannedAmountComputed: item.plannedAmount,
        currentAmountComputed: item.plannedAmount,
        pendingAmountComputed: Math.max(item.plannedAmount - item.paidAmount, 0),
      };
    });
}

export function computeBudgetSummary(items: BudgetComputedItem[]): BudgetComputedSummary {
  const activeItems = items.filter((item) => item.active);
  const plannedTotal = activeItems.reduce((sum, item) => sum + item.plannedAmountComputed, 0);
  const paidTotal = activeItems.reduce((sum, item) => sum + item.paidAmount, 0);
  const currentEstimatedTotal = activeItems.reduce((sum, item) => sum + item.currentAmountComputed, 0);
  const dynamicItems = activeItems.filter((item) => item.type === "variable");
  const dynamicPlannedTotal = dynamicItems.reduce((sum, item) => sum + item.plannedAmountComputed, 0);
  const dynamicCurrentTotal = dynamicItems.reduce((sum, item) => sum + item.currentAmountComputed, 0);

  return {
    plannedTotal,
    paidTotal,
    pendingTotal: Math.max(currentEstimatedTotal - paidTotal, 0),
    currentEstimatedTotal,
    deviationTotal: currentEstimatedTotal - plannedTotal,
    dynamicPlannedTotal,
    dynamicCurrentTotal,
    dynamicImpact: dynamicCurrentTotal - dynamicPlannedTotal,
  };
}
