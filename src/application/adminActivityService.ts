import type { LodgingRequest } from "../domain/lodging";
import type { GuestRsvp } from "../domain/rsvp";
import type { TransportRequest } from "../domain/transport";
import {
  limpiarActividad,
  obtenerActividad,
  type EventoActividad,
} from "../services/actividadService";
import {
  obtenerAlojamientos,
  obtenerSolicitudesAlojamiento,
} from "../services/alojamientosService";
import { limpiarLogs, obtenerLogs, type LogItem } from "../services/logsService";
import { obtenerTodosLosRSVP } from "../services/rsvpService";
import {
  obtenerSolicitudesTransporte,
  obtenerTransportes,
} from "../services/transporteService";

export type ActivityCategory =
  | "timeline"
  | "confirmaciones"
  | "alojamiento"
  | "transporte"
  | "musica"
  | "chat"
  | "invitados"
  | "mesas_ceremonia"
  | "admin"
  | "otros";

export type ActivityImportance = "important" | "secondary";
export type ActivityPeriodFilter = "hoy" | "ultimos_7_dias" | "todo";

export type TimelineItem = {
  id: string;
  timestamp: number;
  actor: string;
  category: string;
  block: ActivityCategory;
  detail: string;
  source: "actividad" | "respuesta" | "admin";
  importance: ActivityImportance;
};

export type ActivityBlockSummary = {
  id: ActivityCategory;
  title: string;
  items: TimelineItem[];
  count: number;
  lastEvent?: TimelineItem;
  collapsedHint: string;
};

export type ActivityDashboardData = {
  timeline: TimelineItem[];
  blocks: ActivityBlockSummary[];
  rsvps: GuestRsvp[];
  lodgingRequests: LodgingRequest[];
  transportRequests: TransportRequest[];
  rawActivity: EventoActividad[];
  adminLogs: LogItem[];
  lodgingNames: Record<string, string>;
  transportNames: Record<string, string>;
  metrics: {
    confirmados: number;
    rechazados: number;
    totalPlazasTransporte: number;
    totalConAlergias: number;
  };
};

const blockTitles: Record<ActivityCategory, string> = {
  timeline: "Timeline global",
  confirmaciones: "Confirmaciones",
  alojamiento: "Alojamiento",
  transporte: "Transporte",
  musica: "Música",
  chat: "Chat",
  invitados: "Invitados",
  mesas_ceremonia: "Mesas / ceremonia",
  admin: "Admin",
  otros: "Otros cambios",
};

function buildRsvpSummary(item: GuestRsvp) {
  const totalAlergias = item.detalles.reduce(
    (acc, detail) =>
      acc +
      detail.alergias.length +
      (detail.intolerancias && detail.intolerancias.trim() ? 1 : 0),
    0
  );

  return [
    item.attending === "si"
      ? `Confirma asistencia: ${item.adultos} adulto(s), ${item.ninos} niño(s)`
      : item.attending === "no"
        ? "No asistirá"
        : "Respuesta pendiente",
    totalAlergias > 0 ? `${totalAlergias} alergia(s)/intolerancia(s)` : null,
    item.nota ? "Incluye nota adicional" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function mapActivityTypeToBlock(tipo: string): ActivityCategory {
  if (
    tipo === "rsvp_confirmado" ||
    tipo === "rsvp_rechazado" ||
    tipo === "invitacion_rechazada" ||
    tipo === "motivo_no_asistencia"
  ) {
    return "confirmaciones";
  }
  if (tipo === "alojamiento_interes") return "alojamiento";
  if (tipo.includes("transporte")) return "transporte";
  if (tipo.startsWith("musica_")) return "musica";
  if (tipo.startsWith("chat_")) return tipo === "chat_admin" || tipo === "chat_admin_mensaje" ? "admin" : "chat";
  if (
    tipo === "asistentes_modificados" ||
    tipo === "acceso_acompanantes" ||
    tipo === "login_invitado"
  ) {
    return "invitados";
  }
  if (tipo.includes("mesa") || tipo.includes("ceremonia")) return "mesas_ceremonia";
  if (tipo === "presupuesto_actualizado") return "otros";
  return "otros";
}

function getImportance(tipo: string): ActivityImportance {
  if (
    tipo === "rsvp_confirmado" ||
    tipo === "rsvp_rechazado" ||
    tipo === "invitacion_rechazada" ||
    tipo === "alojamiento_interes" ||
    tipo === "musica_propuesta" ||
    tipo === "chat_mensaje" ||
    tipo === "asistentes_modificados" ||
    tipo === "presupuesto_actualizado"
  ) {
    return "important";
  }

  return "secondary";
}

function getCollapsedHint(block: ActivityCategory, items: TimelineItem[]): string {
  const last = items[0];
  if (!last) return "Sin actividad reciente";

  switch (block) {
    case "confirmaciones":
      return `Última: ${last.detail}`;
    case "alojamiento":
      return `Última: ${last.actor} · ${last.detail}`;
    case "transporte":
      return `Última: ${last.actor} · ${last.detail}`;
    case "musica":
      return `Última: ${last.detail}`;
    case "chat":
      return `Última: ${last.detail}`;
    case "admin":
      return `Última: ${last.detail}`;
    default:
      return `Última actualización ${formatActivityDate(last.timestamp)}`;
  }
}

function buildBlocks(timeline: TimelineItem[]): ActivityBlockSummary[] {
  const order: ActivityCategory[] = [
    "timeline",
    "confirmaciones",
    "alojamiento",
    "transporte",
    "musica",
    "chat",
    "invitados",
    "mesas_ceremonia",
    "admin",
    "otros",
  ];

  const result: ActivityBlockSummary[] = order.map((block) => {
    const items = block === "timeline" ? timeline : timeline.filter((item) => item.block === block);
    return {
      id: block,
      title: blockTitles[block],
      items,
      count: items.length,
      ...(items[0] ? { lastEvent: items[0] } : {}),
      collapsedHint: getCollapsedHint(block, items),
    };
  });

  return result.filter((block) => block.id === "timeline" || block.count > 0);
}

function isWithinPeriod(timestamp: number, filter: ActivityPeriodFilter): boolean {
  if (filter === "todo") return true;
  const now = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;
  if (filter === "hoy") return now - timestamp <= dayMs;
  return now - timestamp <= dayMs * 7;
}

export function formatActivityDate(ts: number) {
  return new Date(ts).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function filterTimelineItems(
  items: TimelineItem[],
  options: {
    category: "todas" | ActivityCategory;
    period: ActivityPeriodFilter;
    onlyImportant: boolean;
  }
): TimelineItem[] {
  return items.filter((item) => {
    if (options.category !== "todas" && item.block !== options.category) return false;
    if (!isWithinPeriod(item.timestamp, options.period)) return false;
    if (options.onlyImportant && item.importance !== "important") return false;
    return true;
  });
}

export async function loadActivityDashboardData(): Promise<ActivityDashboardData> {
  const [
    actividad,
    logs,
    storedRsvps,
    lodgingOptions,
    lodgingData,
    transportOptions,
    transportData,
  ] = await Promise.all([
    obtenerActividad(),
    obtenerLogs(),
    obtenerTodosLosRSVP(),
    obtenerAlojamientos(),
    obtenerSolicitudesAlojamiento(),
    obtenerTransportes(),
    obtenerSolicitudesTransporte(),
  ]);

  const lodgingNames = Object.fromEntries(
    lodgingOptions.map((item) => [item.id, item.nombre])
  );
  const transportNames = Object.fromEntries(
    transportOptions.map((item) => [item.id, item.nombre])
  );

  const timeline: TimelineItem[] = [
    ...actividad.map((item) => ({
      id: `actividad-${item.id}`,
      timestamp: item.timestamp,
      actor: item.tokenInvitado || "Sistema",
      category: item.tipo,
      block: mapActivityTypeToBlock(item.tipo),
      detail: item.mensaje,
      source: "actividad" as const,
      importance: getImportance(item.tipo),
    })),
    ...logs.map((item) => ({
      id: `log-${item.id}`,
      timestamp: item.timestamp,
      actor: item.user,
      category: "admin",
      block: "admin" as const,
      detail: item.action,
      source: "admin" as const,
      importance: "secondary" as const,
    })),
    ...storedRsvps.map((item) => ({
      id: `rsvp-${item.guestToken}`,
      timestamp: item.timestamp,
      actor: item.guestName || item.guestToken,
      category: "rsvp",
      block: "confirmaciones" as const,
      detail: buildRsvpSummary(item),
      source: "respuesta" as const,
      importance: "important" as const,
    })),
    ...lodgingData.map((item) => ({
      id: `lodging-${item.id}`,
      timestamp: item.updatedAt,
      actor: item.guestName,
      category: "alojamiento",
      block: "alojamiento" as const,
      detail: item.interested
        ? `Marcó interés${item.lodgingId ? ` · ${lodgingNames[item.lodgingId] ?? "Sin preferencia"}` : ""}`
        : item.needsLodging
          ? "Solicitó alojamiento"
          : "No necesita alojamiento",
      source: "respuesta" as const,
      importance: "important" as const,
    })),
    ...transportData.map((item) => ({
      id: `transport-${item.id}`,
      timestamp: item.updatedAt,
      actor: item.guestName,
      category: "transporte",
      block: "transporte" as const,
      detail: item.hasCarOffer
        ? `Ofrece ${item.offeredSeats} plaza(s)`
        : `${transportNames[item.transportId] ?? "Transporte"} · ${item.seats} plaza(s)`,
      source: "respuesta" as const,
      importance: "important" as const,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const rsvps = [...storedRsvps].sort((a, b) => b.timestamp - a.timestamp);
  const transportRequests = [...transportData].sort((a, b) => b.updatedAt - a.updatedAt);

  return {
    timeline,
    blocks: buildBlocks(timeline),
    rsvps,
    lodgingRequests: [...lodgingData].sort((a, b) => b.updatedAt - a.updatedAt),
    transportRequests,
    rawActivity: [...actividad].sort((a, b) => b.timestamp - a.timestamp),
    adminLogs: [...logs].sort((a, b) => b.timestamp - a.timestamp),
    lodgingNames,
    transportNames,
    metrics: {
      confirmados: rsvps.filter((item) => item.attending === "si").length,
      rechazados: rsvps.filter((item) => item.attending === "no").length,
      totalPlazasTransporte: transportRequests.reduce((acc, item) => acc + item.seats, 0),
      totalConAlergias: rsvps.filter((item) =>
        item.detalles.some(
          (detail) =>
            detail.alergias.length > 0 ||
            Boolean(detail.intolerancias && detail.intolerancias.trim())
        )
      ).length,
    },
  };
}

export async function clearAdminActivityHistory(): Promise<void> {
  await Promise.all([limpiarActividad(), limpiarLogs()]);
}
