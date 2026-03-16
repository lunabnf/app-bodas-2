import type { Guest } from "../domain/guest";
import type { Table } from "../domain/table";
import { loadGuestsAdminData } from "./adminGuestsService";
import { guardarInvitados } from "../services/invitadosService";
import { guardarMesas } from "../services/mesasService";
import {
  getWeddingSettings,
  saveWeddingSettings,
  type WeddingSettings,
} from "../services/weddingSettingsService";

export type SeatingGuestFilter =
  | "todos"
  | "sin_asignar"
  | "asignados"
  | "ninos"
  | "con_intolerancias";

export type SeatingVisibilityMode = "hidden" | "visible" | "scheduled";
export type SeatingTemplateCategory =
  | "fiesta"
  | "naturaleza"
  | "musica_pop"
  | "musica_rock"
  | "ciudades"
  | "peliculas"
  | "romantico"
  | "personalizado";

export type SeatingWorkspace = {
  invitados: Guest[];
  mesas: Table[];
  settings: WeddingSettings;
};

export type SeatingTableDraft = {
  nombre: string;
  capacidad: number;
  tipoMesa: "redonda" | "rectangular";
  templateCategory: SeatingTemplateCategory;
};

export type SeatingTablePatch = Partial<SeatingTableDraft> & {
  collapsed?: boolean;
  orden?: number;
};

export type SeatingVisibilityInput = {
  mode: SeatingVisibilityMode;
  publishAt: string | null;
};

export type SeatingTableStatus = "incompleta" | "completa" | "sobreocupada";

const TEMPLATE_NAMES: Record<Exclude<SeatingTemplateCategory, "personalizado">, string[]> = {
  fiesta: ["Confeti", "Noche Dorada", "Brindis", "After Party", "Luz y Ritmo", "Coctel"],
  naturaleza: ["Olivo", "Azahar", "Lavanda", "Bosque", "Jazmin", "Mar"],
  musica_pop: ["Billie", "Dua", "Aitana", "Coldplay", "Sia", "Phoenix"],
  musica_rock: ["Queen", "U2", "Bon Jovi", "The Killers", "Arctic", "Muse"],
  ciudades: ["Paris", "Roma", "Lisboa", "Tokio", "Londres", "Nueva York"],
  peliculas: ["La La Land", "Amelie", "Notebook", "Titanic", "Mamma Mia", "Up"],
  romantico: ["Promesa", "Destino", "Abrazo", "Siempre", "Eternidad", "Complices"],
};

function nextTableId(tables: Table[]): string {
  const max = tables.reduce((acc, table) => {
    const parsed = Number(table.id);
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);
  return String(max + 1);
}

function normalizeTemplateCategory(value: string | undefined): SeatingTemplateCategory {
  if (
    value === "fiesta" ||
    value === "naturaleza" ||
    value === "musica_pop" ||
    value === "musica_rock" ||
    value === "ciudades" ||
    value === "peliculas" ||
    value === "romantico" ||
    value === "personalizado"
  ) {
    return value;
  }
  return "personalizado";
}

function normalizeGuestsAndTables(
  guests: Guest[],
  tables: Table[]
): { invitados: Guest[]; mesas: Table[] } {
  const tableIds = new Set(tables.map((table) => table.id));

  const invitados = guests.map((guest) => {
    const mesa = guest.mesa && tableIds.has(guest.mesa) ? guest.mesa : undefined;
    const { mesa: _mesa, ...baseGuest } = guest;
    return {
      ...baseGuest,
      ...(mesa ? { mesa } : {}),
      assignmentState: mesa ? ("asignada" as const) : ("sin_asignar" as const),
    };
  });

  const mesas = [...tables]
    .map((table, index) => {
      const invitadosTokens = invitados
        .filter((guest) => guest.mesa === table.id)
        .map((guest) => guest.token);

      return {
        ...table,
        tipoMesa: table.tipoMesa === "rectangular" ? ("rectangular" as const) : ("redonda" as const),
        orden: typeof table.orden === "number" ? table.orden : index,
        templateCategory: normalizeTemplateCategory(table.templateCategory),
        collapsed: Boolean(table.collapsed),
        invitadosTokens,
        captainToken:
          table.captainToken && invitadosTokens.includes(table.captainToken)
            ? table.captainToken
            : null,
      };
    })
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return { invitados, mesas };
}

function isAssignableGuest(guest: Guest): boolean {
  if (guest.personaEstado === "cancelada") return false;
  return guest.estado === "confirmado";
}

function findTableById(tables: Table[], tableId: string): Table {
  const table = tables.find((entry) => entry.id === tableId);
  if (!table) {
    throw new Error("La mesa seleccionada no existe.");
  }
  return table;
}

function getAllTemplateNames(category: SeatingTemplateCategory): string[] {
  if (category === "personalizado") return [];
  return TEMPLATE_NAMES[category] ?? [];
}

export function getSeatingNameTemplateCatalog(): Array<{ id: SeatingTemplateCategory; label: string }> {
  return [
    { id: "personalizado", label: "Personalizado" },
    { id: "fiesta", label: "Fiesta" },
    { id: "naturaleza", label: "Naturaleza" },
    { id: "musica_pop", label: "Música Pop" },
    { id: "musica_rock", label: "Música Rock" },
    { id: "ciudades", label: "Ciudades" },
    { id: "peliculas", label: "Películas" },
    { id: "romantico", label: "Romántico" },
  ];
}

export function suggestTableName(
  tables: Table[],
  category: SeatingTemplateCategory,
  fallbackIndex: number
): string {
  const normalizedCategory = normalizeTemplateCategory(category);
  if (normalizedCategory === "personalizado") {
    return `Mesa ${fallbackIndex}`;
  }

  const names = getAllTemplateNames(normalizedCategory);
  if (names.length === 0) return `Mesa ${fallbackIndex}`;

  const taken = new Set(tables.map((table) => table.nombre.toLowerCase().trim()));
  const firstAvailable = names.find((name) => !taken.has(name.toLowerCase()));
  if (firstAvailable) return firstAvailable;

  return `${names[fallbackIndex % names.length]} ${Math.max(2, Math.floor(fallbackIndex / names.length) + 1)}`;
}

export function getTableStatus(table: Table): SeatingTableStatus {
  const occupied = table.invitadosTokens.length;
  if (occupied > table.capacidad) return "sobreocupada";
  if (occupied === table.capacidad) return "completa";
  return "incompleta";
}

export function getFilteredGuests(
  invitados: Guest[],
  filter: SeatingGuestFilter,
  query: string
): Guest[] {
  const normalizedQuery = query.trim().toLowerCase();

  return invitados.filter((guest) => {
    const matchesQuery =
      normalizedQuery.length === 0 || guest.nombre.toLowerCase().includes(normalizedQuery);

    if (!matchesQuery) return false;

    if (filter === "sin_asignar") return !guest.mesa;
    if (filter === "asignados") return Boolean(guest.mesa);
    if (filter === "ninos") return guest.tipo === "Niño";
    if (filter === "con_intolerancias") {
      return Boolean(guest.intolerancias?.trim() || guest.alergias?.length);
    }

    return true;
  });
}

export async function loadSeatingWorkspace(): Promise<SeatingWorkspace> {
  const { invitados: loadedGuests, mesas: loadedTables } = await loadGuestsAdminData();
  const normalized = normalizeGuestsAndTables(loadedGuests, loadedTables);
  await Promise.all([guardarInvitados(normalized.invitados), guardarMesas(normalized.mesas)]);

  return {
    ...normalized,
    settings: getWeddingSettings(),
  };
}

export async function createTable(
  invitados: Guest[],
  mesas: Table[],
  draft: SeatingTableDraft
): Promise<{ invitados: Guest[]; mesas: Table[] }> {
  if (draft.capacidad < 1) throw new Error("La capacidad debe ser mayor que 0.");

  const suggested = suggestTableName(mesas, draft.templateCategory, mesas.length + 1);
  const name = draft.nombre.trim() || suggested;

  const nextTable: Table = {
    id: nextTableId(mesas),
    nombre: name,
    tipoMesa: draft.tipoMesa,
    capacidad: Math.floor(draft.capacidad),
    orden: mesas.length,
    templateCategory: draft.templateCategory,
    collapsed: false,
    invitadosTokens: [],
    captainToken: null,
  };

  const normalized = normalizeGuestsAndTables(invitados, [...mesas, nextTable]);
  await guardarMesas(normalized.mesas);

  return normalized;
}

export async function updateTable(
  invitados: Guest[],
  mesas: Table[],
  tableId: string,
  patch: SeatingTablePatch
): Promise<{ invitados: Guest[]; mesas: Table[] }> {
  const table = findTableById(mesas, tableId);
  const assignedCount = invitados.filter((guest) => guest.mesa === tableId).length;

  const nextCapacidad =
    typeof patch.capacidad === "number" ? Math.floor(patch.capacidad) : table.capacidad;
  if (nextCapacidad < 1) throw new Error("La capacidad debe ser mayor que 0.");
  if (nextCapacidad < assignedCount) {
    throw new Error(
      `No puedes bajar la capacidad por debajo de ${assignedCount}; hay invitados ya asignados.`
    );
  }

  const nextTables = mesas.map((entry) =>
    entry.id === tableId
      ? {
          ...entry,
          ...(patch.nombre !== undefined ? { nombre: patch.nombre.trim() || entry.nombre } : {}),
          ...(patch.tipoMesa ? { tipoMesa: patch.tipoMesa } : {}),
          ...(patch.templateCategory
            ? { templateCategory: normalizeTemplateCategory(patch.templateCategory) }
            : {}),
          ...(typeof patch.collapsed === "boolean" ? { collapsed: patch.collapsed } : {}),
          ...(typeof patch.orden === "number" ? { orden: patch.orden } : {}),
          capacidad: nextCapacidad,
        }
      : entry
  );

  const normalized = normalizeGuestsAndTables(invitados, nextTables);
  await guardarMesas(normalized.mesas);
  return normalized;
}

export async function deleteTable(
  invitados: Guest[],
  mesas: Table[],
  tableId: string
): Promise<{ invitados: Guest[]; mesas: Table[] }> {
  findTableById(mesas, tableId);

  const nextGuests = invitados.map((guest) => {
    if (guest.mesa !== tableId) return guest;
    const { mesa: _mesa, ...rest } = guest;
    return {
      ...rest,
      assignmentState: "sin_asignar" as const,
    };
  });

  const nextTables = mesas.filter((table) => table.id !== tableId).map((table, index) => ({
    ...table,
    orden: index,
  }));
  const normalized = normalizeGuestsAndTables(nextGuests, nextTables);

  await Promise.all([guardarInvitados(normalized.invitados), guardarMesas(normalized.mesas)]);

  return normalized;
}

export async function assignGuestToTable(
  invitados: Guest[],
  mesas: Table[],
  guestToken: string,
  tableId: string | null
): Promise<{ invitados: Guest[]; mesas: Table[] }> {
  const guest = invitados.find((entry) => entry.token === guestToken);
  if (!guest) {
    throw new Error("No se encontró el invitado seleccionado.");
  }

  if (tableId && !isAssignableGuest(guest)) {
    throw new Error("Solo puedes sentar invitados confirmados y activos.");
  }

  if (tableId) {
    const table = findTableById(mesas, tableId);
    const currentAssigned = invitados.filter(
      (entry) => entry.mesa === tableId && entry.token !== guestToken
    ).length;
    if (currentAssigned >= table.capacidad) {
      throw new Error(`La mesa ${table.nombre} está completa.`);
    }
  }

  const nextGuests = invitados.map((entry) => {
    if (entry.token !== guestToken) return entry;

    if (!tableId) {
      const { mesa: _mesa, ...rest } = entry;
      return {
        ...rest,
        assignmentState: "sin_asignar" as const,
      };
    }

    return {
      ...entry,
      mesa: tableId,
      assignmentState: "asignada" as const,
    };
  });

  const normalized = normalizeGuestsAndTables(nextGuests, mesas);

  await Promise.all([guardarInvitados(normalized.invitados), guardarMesas(normalized.mesas)]);

  return normalized;
}

export function updateSeatingVisibility(input: SeatingVisibilityInput): WeddingSettings {
  const settings = getWeddingSettings();
  const nextSettings: WeddingSettings = {
    ...settings,
    mostrarMesas: input.mode !== "hidden",
    mesasVisibilityMode: input.mode,
    mesasPublishAt: input.mode === "scheduled" ? input.publishAt : null,
  };
  saveWeddingSettings(nextSettings);
  return nextSettings;
}
