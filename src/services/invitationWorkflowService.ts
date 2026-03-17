import { z } from "zod";
import type { ChildForm, AdultForm } from "../application/guestParticipationService";
import type {
  AssignmentState,
  Guest,
  GuestAccessState,
  GuestType,
  InvitationRole,
  MenuState,
  PersonStatus,
} from "../domain/guest";
import type { GuestRsvp } from "../domain/rsvp";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";
import { recalculateGuestBudgetSnapshot } from "./guestBudgetService";
import {
  guardarInvitados,
  obtenerInvitados,
  obtenerInvitadoPorTokenSync,
} from "./invitadosService";
import { guardarMesas, obtenerMesas } from "./mesasService";
import { guardarRSVP } from "./rsvpService";
import { registrarActividad } from "./actividadService";
import { DEV_OPEN_PUBLIC_WEDDING } from "./devAccessService";

const STORAGE_KEY = "wedding.invitations";

export type InvitationStatus = "pendiente" | "respondida" | "confirmada" | "rechazada" | "modificada";

type InvitationAttendee = {
  token: string;
  name: string;
  tipo: GuestType;
  role: InvitationRole;
  personaEstado: PersonStatus;
  accessState: GuestAccessState;
  menuEstado: MenuState;
  assignmentState: AssignmentState;
  active: boolean;
};

export type InvitationAdminSummary = {
  holderToken: string;
  invitationStatus: InvitationStatus;
  activeAttendees: number;
  responseCount: number;
};

export type InvitationRecord = {
  holderToken: string;
  status: InvitationStatus;
  rejectionReason?: string;
  lastNote?: string;
  linkedGuestTokens: string[];
  attendees: InvitationAttendee[];
  responseCount: number;
  firstRespondedAt?: number;
  updatedAt: number;
};

const invitationAttendeeSchema = z.object({
  token: z.string(),
  name: z.string(),
  tipo: z.enum(["Adulto", "Niño"]),
  role: z.enum(["titular", "acompanante"]),
  personaEstado: z.enum(["creada", "confirmada", "cancelada", "incompleta"]),
  accessState: z.enum(["no_permitido", "permitido", "codigo_disponible", "activado", "bloqueado"]),
  menuEstado: z.enum(["sin_definir", "adulto", "infantil", "especial"]),
  assignmentState: z.enum(["sin_asignar", "asignada"]),
  active: z.boolean(),
});

const invitationRecordSchema = z.object({
  holderToken: z.string(),
  status: z.enum(["pendiente", "respondida", "confirmada", "rechazada", "modificada"]),
  rejectionReason: z.string().optional(),
  lastNote: z.string().optional(),
  linkedGuestTokens: z.array(z.string()),
  attendees: z.array(invitationAttendeeSchema),
  responseCount: z.number(),
  firstRespondedAt: z.number().optional(),
  updatedAt: z.number(),
});

const invitationCollectionSchema = z.array(invitationRecordSchema);

function readAllInvitationRecords(): InvitationRecord[] {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  return readStorageWithSchema(scopedKey, invitationCollectionSchema, []);
}

function writeAllInvitationRecords(records: InvitationRecord[]) {
  const scopedKey = scopedStorageKey(STORAGE_KEY);
  writeStorage(scopedKey, records);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function nextGuestId(guests: Guest[]) {
  const max = guests.reduce((acc, guest) => {
    const numeric = Number(guest.id);
    return Number.isFinite(numeric) ? Math.max(acc, numeric) : acc;
  }, 0);
  return String(max + 1);
}

function getMenuStateByType(tipo: GuestType): MenuState {
  return tipo === "Niño" ? "infantil" : "adulto";
}

function getAccessStateForGuest(tipo: GuestType, role: InvitationRole): GuestAccessState {
  if (tipo === "Niño") return "no_permitido";
  if (role === "titular") return "activado";
  return "codigo_disponible";
}

function ensureRecord(records: InvitationRecord[], holderToken: string): InvitationRecord {
  const existing = records.find((record) => record.holderToken === holderToken);
  if (existing) return existing;

  return {
    holderToken,
    status: "pendiente",
    linkedGuestTokens: [holderToken],
    attendees: [],
    responseCount: 0,
    updatedAt: Date.now(),
  };
}

function buildPendingRecord(holderToken: string): InvitationRecord {
  return {
    holderToken,
    status: "pendiente",
    linkedGuestTokens: [holderToken],
    attendees: [],
    responseCount: 0,
    updatedAt: Date.now(),
  };
}

async function ensureHolderGuestForRsvp(
  holderToken: string,
  holderName: string
): Promise<{ guests: Guest[]; holder: Guest | null }> {
  const guests = await obtenerInvitados();
  const existingHolder = guests.find((guest) => guest.token === holderToken) ?? null;
  if (existingHolder) return { guests, holder: existingHolder };

  const records = readAllInvitationRecords();
  const existingRecord = records.find((record) => record.holderToken === holderToken) ?? null;
  const isDevMockHolder = DEV_OPEN_PUBLIC_WEDDING && holderToken.startsWith("dev-open-");

  // En producción no se crean titulares "de la nada": solo se repara si ya existe invitación.
  if (!existingRecord && !isDevMockHolder) {
    return { guests, holder: null };
  }

  const repairedHolder: Guest = {
    id: nextGuestId(guests),
    token: holderToken,
    nombre: holderName.trim() || `Titular ${holderToken.slice(0, 6)}`,
    tipo: "Adulto",
    grupo: "",
    grupoTipo: "otros",
    estado: "pendiente",
    esAdulto: true,
    invitationToken: holderToken,
    invitationRole: "titular",
    personaEstado: "creada",
    accessState: "activado",
    assignmentState: "sin_asignar",
    menuEstado: "adulto",
  };

  const nextGuests = [...guests, repairedHolder];
  await guardarInvitados(nextGuests);

  if (!existingRecord) {
    const nextRecords = [...records, buildPendingRecord(holderToken)];
    writeAllInvitationRecords(nextRecords);
  }

  return { guests: nextGuests, holder: repairedHolder };
}

export function getInvitationRecordByHolder(holderToken: string): InvitationRecord | null {
  const records = readAllInvitationRecords();
  return records.find((record) => record.holderToken === holderToken) ?? null;
}

export function getInvitationRecordByGuestToken(guestToken: string): InvitationRecord | null {
  const records = readAllInvitationRecords();
  return records.find((record) => record.linkedGuestTokens.includes(guestToken)) ?? null;
}

export function buildInvitationSummaryByGuestTokens(
  guests: Guest[]
): Record<string, InvitationAdminSummary> {
  const records = readAllInvitationRecords();
  const result: Record<string, InvitationAdminSummary> = {};

  for (const guest of guests) {
    const holderToken =
      guest.invitationRole === "acompanante"
        ? guest.invitationToken ?? guest.token
        : guest.token;

    const record =
      records.find((entry) => entry.holderToken === holderToken) ??
      records.find((entry) => entry.linkedGuestTokens.includes(guest.token));

    const summary: InvitationAdminSummary = record
      ? {
          holderToken: record.holderToken,
          invitationStatus: record.status,
          activeAttendees: record.attendees.filter((attendee) => attendee.active).length,
          responseCount: record.responseCount,
        }
      : {
          holderToken,
          invitationStatus: "pendiente",
          activeAttendees: guest.estado === "confirmado" ? 1 : 0,
          responseCount: 0,
        };

    result[guest.token] = summary;
  }

  return result;
}

export async function createBaseInvitationForHolderGuest(guest: Guest): Promise<void> {
  if (guest.tipo === "Niño") return;

  const records = readAllInvitationRecords();
  const existing = records.find((record) => record.holderToken === guest.token);
  if (existing) return;

  records.push(buildPendingRecord(guest.token));
  writeAllInvitationRecords(records);
}

export async function reconcileInvitationIntegrity(
  guestsInput?: Guest[]
): Promise<{ guests: Guest[]; repairedRecords: number; repairedGuests: number }> {
  const guests = guestsInput ? [...guestsInput] : await obtenerInvitados();
  const records = readAllInvitationRecords();
  let repairedRecords = 0;
  let repairedGuests = 0;
  let changedGuests = false;
  let changedRecords = false;

  const holders = guests.filter(
    (guest) => guest.tipo === "Adulto" && guest.invitationRole !== "acompanante"
  );

  for (const holder of holders) {
    const hasRecord = records.some((record) => record.holderToken === holder.token);
    if (!hasRecord) {
      records.push(buildPendingRecord(holder.token));
      repairedRecords += 1;
      changedRecords = true;
    }
  }

  const holderTokens = new Set(holders.map((holder) => holder.token));
  for (const record of records) {
    if (holderTokens.has(record.holderToken)) continue;

    const placeholderGuest: Guest = {
      id: String(guests.length + 1 + repairedGuests),
      token: record.holderToken,
      nombre: record.attendees[0]?.name ?? `Invitación ${record.holderToken.slice(0, 6)}`,
      tipo: "Adulto",
      grupo: "",
      grupoTipo: "otros",
      estado: record.status === "rechazada" ? "rechazado" : "pendiente",
      esAdulto: true,
      invitationToken: record.holderToken,
      invitationRole: "titular",
      personaEstado: record.status === "rechazada" ? "cancelada" : "creada",
      accessState: record.status === "rechazada" ? "bloqueado" : "codigo_disponible",
      assignmentState: "sin_asignar",
      menuEstado: "adulto",
      ...(record.rejectionReason ? { notaPrivada: record.rejectionReason } : {}),
    };
    guests.push(placeholderGuest);
    repairedGuests += 1;
    changedGuests = true;
    holderTokens.add(record.holderToken);
  }

  if (changedGuests) {
    await guardarInvitados(guests);
  }
  if (changedRecords) {
    writeAllInvitationRecords(records);
  }

  return { guests, repairedRecords, repairedGuests };
}

export async function safeRemoveGuestFromInvitation(guestToken: string): Promise<{
  mode: "deleted" | "cancelled";
  updatedGuests: Guest[];
}> {
  const guests = await obtenerInvitados();
  const guest = guests.find((item) => item.token === guestToken);
  if (!guest) return { mode: "deleted", updatedGuests: guests };

  const isHolder = guest.invitationRole !== "acompanante";
  if (!isHolder) {
    const updatedGuests = guests.filter((item) => item.token !== guestToken);
    await guardarInvitados(updatedGuests);
    return { mode: "deleted", updatedGuests };
  }

  const record = getInvitationRecordByHolder(guest.token);
  const linkedTokens = new Set(record?.linkedGuestTokens ?? [guest.token]);
  const updatedGuests = guests.map((item) => {
    if (!linkedTokens.has(item.token)) return item;
    const { mesa: _mesa, ceremonySeat: _ceremonySeat, ...rest } = item;
    return {
      ...rest,
      estado: "rechazado" as const,
      personaEstado: "cancelada" as const,
      accessState: "bloqueado" as const,
      assignmentState: "sin_asignar" as const,
      ...(item.notaPrivada ? { notaPrivada: item.notaPrivada } : {}),
    };
  });

  await guardarInvitados(updatedGuests);

  if (record) {
    const records = readAllInvitationRecords().map((entry) =>
      entry.holderToken === record.holderToken
        ? {
            ...entry,
            status: "rechazada" as const,
            attendees: entry.attendees.map((attendee) => ({
              ...attendee,
              active: false,
              personaEstado: "cancelada" as const,
              accessState: "bloqueado" as const,
            })),
            updatedAt: Date.now(),
          }
        : entry
    );
    writeAllInvitationRecords(records);
  }

  return { mode: "cancelled", updatedGuests };
}

export function canGuestManageInvitation(guestToken: string): boolean {
  const guest = obtenerInvitadoPorTokenSync(guestToken);
  if (!guest) return false;
  return guest.invitationRole !== "acompanante";
}

export function evaluateGuestPublicAccess(guest: Guest): {
  allowed: boolean;
  requiresRsvp: boolean;
  isHolder: boolean;
  blockedReason?: string;
} {
  const record = getInvitationRecordByGuestToken(guest.token);
  const isHolder = guest.invitationRole !== "acompanante";

  if (guest.tipo === "Niño") {
    return { allowed: false, requiresRsvp: false, isHolder, blockedReason: "children_no_access" };
  }

  if (guest.accessState === "bloqueado" || guest.estado === "rechazado") {
    return { allowed: false, requiresRsvp: false, isHolder, blockedReason: "access_blocked" };
  }

  if (isHolder) {
    if (!record || record.status === "pendiente" || record.status === "respondida") {
      return { allowed: false, requiresRsvp: true, isHolder };
    }
    if (record.status === "rechazada") {
      return { allowed: false, requiresRsvp: false, isHolder, blockedReason: "invitation_rejected" };
    }
  }

  if (guest.accessState === "no_permitido") {
    return { allowed: false, requiresRsvp: false, isHolder, blockedReason: "no_access" };
  }

  return { allowed: true, requiresRsvp: false, isHolder };
}

export function evaluateGuestPublicAccessByToken(guestToken: string): {
  allowed: boolean;
  requiresRsvp: boolean;
  isHolder: boolean;
  blockedReason?: string;
} {
  const guest = obtenerInvitadoPorTokenSync(guestToken);
  if (!guest) {
    return { allowed: false, requiresRsvp: false, isHolder: true, blockedReason: "guest_not_found" };
  }
  return evaluateGuestPublicAccess(guest);
}

export async function activateGuestAccess(guestToken: string): Promise<void> {
  const guests = await obtenerInvitados();
  const index = guests.findIndex((guest) => guest.token === guestToken);
  if (index === -1) return;

  const guest = guests[index];
  if (!guest) return;
  if (guest.tipo === "Niño") return;
  if (guest.accessState === "bloqueado") return;

  const updatedGuests = [...guests];
  updatedGuests[index] = {
    ...guest,
    accessState: "activado",
  };

  await guardarInvitados(updatedGuests);
}

type AttendeeInput = {
  name: string;
  tipo: GuestType;
  edad?: number;
  alergias: string[];
  intolerancias?: string;
};

function attendeeInputsFromForms(adults: AdultForm[], children: ChildForm[]): AttendeeInput[] {
  const mappedAdults = adults.map((adult, index) => ({
    name: adult.fullName.trim() || `Adulto ${index + 1}`,
    tipo: "Adulto" as const,
    alergias: adult.allergies,
    ...(adult.customAllergy ? { intolerancias: adult.customAllergy } : {}),
  }));

  const mappedChildren = children.map((child, index) => ({
    name: child.fullName.trim() || `Niño/a ${index + 1}`,
    tipo: "Niño" as const,
    ...(typeof child.age === "number" ? { edad: child.age } : {}),
    alergias: child.allergies,
    ...(child.customAllergy ? { intolerancias: child.customAllergy } : {}),
  }));

  return [...mappedAdults, ...mappedChildren];
}

export type ProcessInvitationRsvpInput = {
  holderToken: string;
  holderName: string;
  attending: "" | "si" | "no";
  adults: AdultForm[];
  children: ChildForm[];
  note?: string;
};

export type ProcessInvitationRsvpResult = {
  status: "confirmed" | "rejected";
  invitationStatus: InvitationStatus;
  activeGuestTokens: string[];
  cancelledGuestTokens: string[];
};

export async function processInvitationRsvp(
  input: ProcessInvitationRsvpInput
): Promise<ProcessInvitationRsvpResult> {
  const now = Date.now();
  const ensured = await ensureHolderGuestForRsvp(input.holderToken, input.holderName);
  const allGuests = ensured.guests;
  const holder = ensured.holder;
  if (!holder) {
    throw new Error("No existe el titular de la invitación.");
  }

  const records = readAllInvitationRecords();
  const baseRecord = ensureRecord(records, input.holderToken);
  const formAttendees = attendeeInputsFromForms(input.adults, input.children);
  const hasPositiveAttendance = input.attending === "si" && formAttendees.length > 0;
  const isRejection = input.attending === "no" || !hasPositiveAttendance;

  const nextGuests = [...allGuests];
  const linkedTokens = new Set(baseRecord.linkedGuestTokens);
  const activeGuestTokens: string[] = [];
  const cancelledGuestTokens: string[] = [];
  const nextAttendees: InvitationAttendee[] = [];

  if (isRejection) {
    const updatedGuests = nextGuests.map((guest) => {
      if (!linkedTokens.has(guest.token) && guest.token !== input.holderToken) return guest;

      if (guest.token === input.holderToken) {
        cancelledGuestTokens.push(guest.token);
      } else if (linkedTokens.has(guest.token)) {
        cancelledGuestTokens.push(guest.token);
      }

      return {
        ...guest,
        estado: "rechazado" as const,
        personaEstado: "cancelada" as const,
        accessState: "bloqueado" as const,
        assignmentState: "sin_asignar" as const,
      };
    });

    const mesas = await obtenerMesas();
    const mesasActualizadas = mesas.map((mesa) => ({
      ...mesa,
      invitadosTokens: mesa.invitadosTokens.filter((token) => !cancelledGuestTokens.includes(token)),
      captainToken:
        mesa.captainToken && cancelledGuestTokens.includes(mesa.captainToken)
          ? null
          : (mesa.captainToken ?? null),
    }));

    await guardarInvitados(updatedGuests);
    await guardarMesas(mesasActualizadas);

    const nextRecord: InvitationRecord = {
      ...baseRecord,
      status: baseRecord.responseCount > 0 ? "modificada" : "rechazada",
      rejectionReason: input.note?.trim() || "",
      lastNote: input.note?.trim() || "",
      linkedGuestTokens: Array.from(linkedTokens),
      attendees: baseRecord.attendees.map((attendee) => ({ ...attendee, active: false, personaEstado: "cancelada" })),
      responseCount: baseRecord.responseCount + 1,
      firstRespondedAt: baseRecord.firstRespondedAt ?? now,
      updatedAt: now,
    };

    const updatedRecords = records.filter((record) => record.holderToken !== input.holderToken);
    updatedRecords.push(nextRecord);
    writeAllInvitationRecords(updatedRecords);

    const rsvpData: GuestRsvp = {
      guestToken: input.holderToken,
      guestName: input.holderName,
      attending: "no",
      adultos: 0,
      ninos: 0,
      detalles: [],
      ...(input.note?.trim() ? { nota: input.note.trim() } : {}),
      invitationToken: input.holderToken,
      invitationStatus: nextRecord.status,
      ...(input.note?.trim() ? { rejectionReason: input.note.trim() } : {}),
      timestamp: now,
    };

    await guardarRSVP(rsvpData);
    recalculateGuestBudgetSnapshot(updatedGuests);

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: now,
      tipo: "invitacion_rechazada",
      mensaje: `${input.holderName} ha rechazado la invitación`,
      tokenInvitado: input.holderToken,
    });

    if (input.note?.trim()) {
      await registrarActividad({
        id: crypto.randomUUID(),
        timestamp: now,
        tipo: "motivo_no_asistencia",
        mensaje: `${input.holderName} dejó motivo de no asistencia`,
        tokenInvitado: input.holderToken,
      });
    }

    return {
      status: "rejected",
      invitationStatus: nextRecord.status,
      activeGuestTokens,
      cancelledGuestTokens,
    };
  }

  let idSeed = nextGuestId(nextGuests);
  const previousActiveAttendees = baseRecord.attendees.filter((attendee) => attendee.active);

  for (let index = 0; index < formAttendees.length; index += 1) {
    const attendee = formAttendees[index];
    if (!attendee) continue;
    const role: InvitationRole = index === 0 ? "titular" : "acompanante";

    let targetToken = index === 0 ? input.holderToken : "";

    if (index > 0) {
      const matchedPrevious = previousActiveAttendees.find(
        (entry) => normalize(entry.name) === normalize(attendee.name) && entry.tipo === attendee.tipo && !activeGuestTokens.includes(entry.token)
      );
      if (matchedPrevious) {
        targetToken = matchedPrevious.token;
      } else {
        targetToken = crypto.randomUUID();
      }
    }

    const guestIndex = nextGuests.findIndex((guest) => guest.token === targetToken);
    const existingGuest = guestIndex >= 0 ? nextGuests[guestIndex] : null;

    const nextGuest: Guest = {
      id: existingGuest?.id ?? idSeed,
      token: targetToken,
      nombre: attendee.name,
      tipo: attendee.tipo,
      grupo: holder.grupo,
      grupoTipo: holder.grupoTipo,
      estado: "confirmado",
      esAdulto: attendee.tipo === "Adulto",
      ...(typeof attendee.edad === "number" ? { edad: attendee.edad } : {}),
      invitationToken: input.holderToken,
      invitationRole: role,
      personaEstado: "confirmada",
      accessState: getAccessStateForGuest(attendee.tipo, role),
      assignmentState: existingGuest?.mesa ? "asignada" : "sin_asignar",
      menuEstado: getMenuStateByType(attendee.tipo),
      ...(attendee.alergias.length > 0 ? { alergias: attendee.alergias } : {}),
      ...(attendee.intolerancias ? { intolerancias: attendee.intolerancias } : {}),
      ...(existingGuest?.mesa ? { mesa: existingGuest.mesa } : {}),
      ...(existingGuest?.ceremonySeat ? { ceremonySeat: existingGuest.ceremonySeat } : {}),
    };

    if (guestIndex === -1) {
      nextGuests.push(nextGuest);
      idSeed = String(Number(idSeed) + 1);
    } else {
      nextGuests[guestIndex] = nextGuest;
    }

    linkedTokens.add(targetToken);
    activeGuestTokens.push(targetToken);
    nextAttendees.push({
      token: targetToken,
      name: attendee.name,
      tipo: attendee.tipo,
      role,
      personaEstado: "confirmada",
      accessState: nextGuest.accessState ?? "no_permitido",
      menuEstado: nextGuest.menuEstado ?? "sin_definir",
      assignmentState: nextGuest.assignmentState ?? "sin_asignar",
      active: true,
    });
  }

  const previousLinked = Array.from(linkedTokens);
  for (const token of previousLinked) {
    if (activeGuestTokens.includes(token)) continue;
    const guestIndex = nextGuests.findIndex((guest) => guest.token === token);
    if (guestIndex === -1) continue;

    const guest = nextGuests[guestIndex];
    if (!guest) continue;
    const { mesa: _mesa, ceremonySeat: _ceremonySeat, ...guestWithoutMesa } = guest;
    nextGuests[guestIndex] = {
      ...guestWithoutMesa,
      estado: "rechazado",
      personaEstado: "cancelada",
      accessState: "bloqueado",
      assignmentState: "sin_asignar",
    };
    cancelledGuestTokens.push(token);

    nextAttendees.push({
      token,
      name: guest.nombre,
      tipo: guest.tipo,
      role: guest.invitationRole === "acompanante" ? "acompanante" : "titular",
      personaEstado: "cancelada",
      accessState: "bloqueado",
      menuEstado: guest.menuEstado ?? getMenuStateByType(guest.tipo),
      assignmentState: "sin_asignar",
      active: false,
    });
  }

  const mesas = await obtenerMesas();
  if (cancelledGuestTokens.length > 0) {
    const mesasActualizadas = mesas.map((mesa) => ({
      ...mesa,
      invitadosTokens: mesa.invitadosTokens.filter((token) => !cancelledGuestTokens.includes(token)),
      captainToken:
        mesa.captainToken && cancelledGuestTokens.includes(mesa.captainToken)
          ? null
          : (mesa.captainToken ?? null),
    }));
    await guardarMesas(mesasActualizadas);
  }

  await guardarInvitados(nextGuests);

  const invitationStatus: InvitationStatus = baseRecord.responseCount > 0 ? "modificada" : "confirmada";
  const nextRecord: InvitationRecord = {
    ...baseRecord,
    status: invitationStatus,
    ...(input.note?.trim() ? { lastNote: input.note.trim() } : {}),
    linkedGuestTokens: Array.from(linkedTokens),
    attendees: nextAttendees,
    responseCount: baseRecord.responseCount + 1,
    firstRespondedAt: baseRecord.firstRespondedAt ?? now,
    updatedAt: now,
  };

  const updatedRecords = records.filter((record) => record.holderToken !== input.holderToken);
  updatedRecords.push(nextRecord);
  writeAllInvitationRecords(updatedRecords);

  const adults = formAttendees.filter((item) => item.tipo === "Adulto");
  const children = formAttendees.filter((item) => item.tipo === "Niño");
  const rsvpData: GuestRsvp = {
    guestToken: input.holderToken,
    guestName: input.holderName,
    attending: "si",
    adultos: adults.length,
    ninos: children.length,
    detalles: formAttendees.map((person, index) => ({
      nombre: person.name,
      ...(typeof person.edad === "number" ? { edad: person.edad } : {}),
      alergias: person.alergias,
      ...(person.intolerancias ? { intolerancias: person.intolerancias } : {}),
      tipo: person.tipo,
      ...(activeGuestTokens[index] ? { guestToken: activeGuestTokens[index] } : {}),
      accessEnabled: person.tipo === "Adulto",
    })),
    ...(input.note?.trim() ? { nota: input.note.trim() } : {}),
    invitationToken: input.holderToken,
    invitationStatus,
    timestamp: now,
  };

  await guardarRSVP(rsvpData);
  const budget = recalculateGuestBudgetSnapshot(nextGuests);

  await registrarActividad({
    id: crypto.randomUUID(),
    timestamp: now,
    tipo: baseRecord.responseCount > 0 ? "invitacion_modificada" : "invitacion_confirmada",
    mensaje: `${input.holderName} confirmó asistencia (${adults.length} adultos, ${children.length} niños)`,
    tokenInvitado: input.holderToken,
  });

  if (cancelledGuestTokens.length > 0) {
    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: now,
      tipo: "asistentes_modificados",
      mensaje: `${input.holderName} actualizó asistentes (${cancelledGuestTokens.length} cancelados)`,
      tokenInvitado: input.holderToken,
    });
  }

  const companionAdults = nextAttendees.filter(
    (attendee) => attendee.role === "acompanante" && attendee.tipo === "Adulto" && attendee.active
  );
  if (companionAdults.length > 0) {
    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: now,
      tipo: "acceso_acompanantes",
      mensaje: `${companionAdults.length} acompañante(s) adulto(s) con acceso disponible`,
      tokenInvitado: input.holderToken,
    });
  }

  await registrarActividad({
    id: crypto.randomUUID(),
    timestamp: now,
    tipo: "presupuesto_actualizado",
    mensaje: `Presupuesto recalculado: ${budget.totalEstimado.toLocaleString()} €`,
    tokenInvitado: input.holderToken,
  });

  return {
    status: "confirmed",
    invitationStatus,
    activeGuestTokens,
    cancelledGuestTokens,
  };
}

export async function updateCompanionPersonalData(input: {
  guestToken: string;
  nombre: string;
  alergias: string[];
  intolerancias?: string;
}): Promise<void> {
  const guests = await obtenerInvitados();
  const index = guests.findIndex((guest) => guest.token === input.guestToken);
  if (index === -1) return;

  const target = guests[index];
  if (!target) return;
  if (target.invitationRole !== "acompanante") return;

  guests[index] = {
    ...target,
    nombre: input.nombre.trim() || target.nombre,
    ...(input.alergias.length > 0 ? { alergias: input.alergias } : {}),
    ...(input.intolerancias?.trim() ? { intolerancias: input.intolerancias.trim() } : {}),
  };

  await guardarInvitados(guests);
}
