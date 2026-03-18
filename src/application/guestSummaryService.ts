import type { Guest, GuestSession } from "../domain/guest";
import type { LodgingOption, LodgingRequest } from "../domain/lodging";
import type { MusicSongSummary } from "../domain/music";
import type { GuestRsvp } from "../domain/rsvp";
import type { TransportNotice, TransportTrip, TransportRequest } from "../domain/transport";
import { buildEventSitePaths } from "../eventSite/paths";
import { obtenerActividad, type EventoActividad } from "../services/actividadService";
import {
  obtenerAlojamientos,
  obtenerInteresesAlojamientoPorInvitado,
} from "../services/alojamientosService";
import { getChatMessages, getChatRooms, canAccessChatRoom } from "../services/chatService";
import { obtenerInvitadoPorTokenSync } from "../services/invitadosService";
import { obtenerMesas } from "../services/mesasService";
import { obtenerMusicSongSummaries, obtenerSongVotes } from "../services/musicaService";
import { obtenerRSVP, obtenerTodosLosRSVP } from "../services/rsvpService";
import {
  obtenerAvisosTransporte,
  obtenerSolicitudesTransportePorInvitado,
  obtenerTransportes,
} from "../services/transporteService";
import { getWeddingSettings, isMesasPublishedForGuests } from "../services/weddingSettingsService";

export type SummaryTone = "success" | "warning" | "neutral";

export interface GuestSummaryAction {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface GuestSummaryHistoryItem {
  id: string;
  label: string;
  timestamp: number;
}

export interface GuestSummaryData {
  guest: Guest;
  statusLabel: string;
  statusTone: SummaryTone;
  roleLabel?: string;
  lastUpdatedAt?: number;
  attendance: {
    groupSize: number;
    details: string[];
    attendees: string[];
    note?: string;
  };
  logistics: {
    transportRequest: TransportRequest | null;
    assignedTrip: TransportTrip | null;
    transportNotices: TransportNotice[];
    lodgingInterests: Array<{
      request: LodgingRequest;
      lodging?: LodgingOption;
    }>;
    tableName?: string;
    ceremonySeatLabel?: string;
  };
  music: {
    proposalLimit: number;
    proposalCount: number;
    proposals: MusicSongSummary[];
    votedSongs: MusicSongSummary[];
  };
  chat: {
    hasAccess: boolean;
    roomNames: string[];
    ownMessageCount: number;
  };
  pending: GuestSummaryAction[];
  history: GuestSummaryHistoryItem[];
}

function roleLabelFromGuest(guest: Guest): string | undefined {
  if (guest.invitationRole === "titular") return "Titular";
  if (guest.invitationRole === "acompanante") return "Acompañante";
  if (guest.grupo) return guest.grupo;
  return undefined;
}

function statusLabelFromGuest(guest: Guest, rsvp: GuestRsvp | null): {
  label: string;
  tone: SummaryTone;
} {
  if (rsvp?.attending === "no" || guest.estado === "rechazado") {
    return { label: "No asiste", tone: "warning" };
  }
  if (rsvp?.attending === "si" || guest.estado === "confirmado") {
    return { label: "Confirmado", tone: "success" };
  }
  return { label: "Pendiente", tone: "neutral" };
}

function getCeremonySeatLabel(guest: Guest): string | undefined {
  if (!guest.ceremonySeat) return undefined;
  const sideLabel = guest.ceremonySeat.side === "left" ? "Lado izquierdo" : "Lado derecho";
  return `${sideLabel} · Fila ${guest.ceremonySeat.row} · Asiento ${guest.ceremonySeat.seat}`;
}

function buildAttendanceDetails(guest: Guest, rsvp: GuestRsvp | null): string[] {
  if (!rsvp) {
    return ["Aún no hay RSVP guardado."];
  }

  const details = [
    `${rsvp.adultos} adultos`,
    `${rsvp.ninos} niños`,
  ];

  const intolerances = rsvp.detalles
    .flatMap((detail) => [detail.intolerancias, ...(detail.alergias ?? [])])
    .filter((item): item is string => Boolean(item?.trim()));
  if (intolerances.length > 0) {
    details.push(`Intolerancias registradas: ${Array.from(new Set(intolerances)).join(", ")}`);
  }

  if (guest.menuEstado && guest.menuEstado !== "sin_definir") {
    details.push(`Menú: ${guest.menuEstado}`);
  }

  if (guest.notaPrivada) {
    details.push(`Observación registrada`);
  }

  return details;
}

function buildAttendeeNames(guest: Guest, rsvp: GuestRsvp | null): string[] {
  const attendees = (rsvp?.detalles ?? [])
    .map((detail) => detail.nombre?.trim())
    .filter((item): item is string => Boolean(item));

  if (attendees.length > 0) {
    return attendees;
  }

  return [guest.nombre];
}

function buildRelevantTransportNotices(
  request: TransportRequest | null,
  notices: TransportNotice[]
): TransportNotice[] {
  if (!request) return [];

  return notices
    .filter(
      (notice) =>
        !notice.trayectoRelacionado ||
        notice.trayectoRelacionado === request.transportId ||
        notice.trayectoRelacionado === request.assignedTripId
    )
    .slice(0, 3);
}

function buildRecentHistory(
  activity: EventoActividad[],
  guestToken: string,
  request: TransportRequest | null
): GuestSummaryHistoryItem[] {
  const history = activity
    .filter((event) => event.tokenInvitado === guestToken)
    .map(mapHistoryEvent)
    .filter((item): item is GuestSummaryHistoryItem => item !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  if (request && history.every((item) => item.label !== "Solicitaste transporte")) {
    history.unshift({
      id: `transport-request-${request.id}`,
      label: request.hasCarOffer ? "Indicaste que ofreces plazas" : "Solicitaste transporte",
      timestamp: request.updatedAt,
    });
  }

  return history.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
}

function mapHistoryEvent(event: EventoActividad): GuestSummaryHistoryItem | null {
  switch (event.tipo) {
    case "rsvp_confirmado":
      return { id: event.id, label: "Confirmaste asistencia", timestamp: event.timestamp };
    case "rsvp_rechazado":
      return { id: event.id, label: "Indicaste que no asistirás", timestamp: event.timestamp };
    case "alojamiento_interes":
      return { id: event.id, label: "Marcaste interés en un alojamiento", timestamp: event.timestamp };
    case "musica_propuesta":
      return { id: event.id, label: "Propusiste una canción", timestamp: event.timestamp };
    case "musica_voto":
    case "musica_retirada_voto":
      return { id: event.id, label: event.mensaje, timestamp: event.timestamp };
    case "chat_mensaje":
      return { id: event.id, label: "Participaste en el chat", timestamp: event.timestamp };
    default:
      return null;
  }
}

async function findAssociatedRsvp(guest: Guest): Promise<GuestRsvp | null> {
  const direct = await obtenerRSVP(guest.token);
  if (direct) return direct;

  const all = await obtenerTodosLosRSVP();

  const byInvitationToken = guest.invitationToken
    ? all.find((item) => item.invitationToken && item.invitationToken === guest.invitationToken)
    : null;
  if (byInvitationToken) return byInvitationToken;

  return (
    all.find((item) =>
      item.detalles.some((detail) => detail.guestToken === guest.token)
    ) ?? null
  );
}

function createPendingActions(params: {
  guest: Guest;
  rsvp: GuestRsvp | null;
  lodgingInterests: LodgingRequest[];
  transportRequest: TransportRequest | null;
  musicProposalCount: number;
  musicVoteCount: number;
  slug: string;
}): GuestSummaryAction[] {
  const paths = buildEventSitePaths(params.slug);
  const actions: GuestSummaryAction[] = [];

  if (!params.rsvp || params.rsvp.attending === "") {
    actions.push({
      id: "rsvp",
      label: "Completa tu asistencia",
      description: "Confirma si venís y revisa los datos del grupo.",
      href: paths.participaConfirmacion,
    });
  }

  if (params.rsvp?.attending === "si" && !params.transportRequest) {
    actions.push({
      id: "transport",
      label: "Revisa transporte",
      description: "Indica si necesitáis ida, vuelta o si ofrecéis coche.",
      href: paths.desplazamientos,
    });
  }

  if (params.rsvp?.attending === "si" && params.lodgingInterests.length === 0) {
    actions.push({
      id: "lodging",
      label: "Valora alojamientos",
      description: "Marca si os interesa algún alojamiento recomendado.",
      href: paths.alojamientos,
    });
  }

  if (
    params.guest.tipo === "Adulto" &&
    params.guest.accessState === "activado" &&
    params.guest.estado === "confirmado" &&
    params.musicProposalCount < 2
  ) {
    actions.push({
      id: "music-proposal",
      label: "Propón canciones",
      description: `Aún puedes proponer ${2 - params.musicProposalCount} canción(es).`,
      href: paths.participaMusica,
    });
  }

  if (
    params.guest.tipo === "Adulto" &&
    params.guest.accessState === "activado" &&
    params.guest.estado === "confirmado" &&
    params.musicVoteCount === 0
  ) {
    actions.push({
      id: "music-vote",
      label: "Vota canciones",
      description: "Revisa las propuestas musicales y apoya tus favoritas.",
      href: paths.participaMusica,
    });
  }

  return actions;
}

export async function getGuestSummary(
  guestSession: GuestSession,
  slug = "demo"
): Promise<GuestSummaryData | null> {
  const storedGuest = obtenerInvitadoPorTokenSync(guestSession.token);
  if (!storedGuest) return null;

  const [
    rsvp,
    settings,
    tables,
    lodgingOptions,
    lodgingInterests,
    transportRequests,
    transportTrips,
    transportNotices,
    songSummaries,
    songVotes,
    chatRooms,
    chatMessages,
    activity,
  ] = await Promise.all([
    findAssociatedRsvp(storedGuest),
    Promise.resolve(getWeddingSettings()),
    obtenerMesas(),
    obtenerAlojamientos(),
    obtenerInteresesAlojamientoPorInvitado(storedGuest.token),
    obtenerSolicitudesTransportePorInvitado(storedGuest.token),
    obtenerTransportes(),
    obtenerAvisosTransporte(),
    obtenerMusicSongSummaries(true),
    obtenerSongVotes(),
    getChatRooms(),
    getChatMessages(),
    obtenerActividad(),
  ]);

  const status = statusLabelFromGuest(storedGuest, rsvp);
  const visibleTableName = isMesasPublishedForGuests(settings)
    ? tables.find((table) => table.invitadosTokens.includes(storedGuest.token))?.nombre
    : undefined;
  const ceremonySeatLabel = getCeremonySeatLabel(storedGuest);
  const accessibleRooms = chatRooms.filter((room) =>
    canAccessChatRoom(room, { isAdmin: false, guest: guestSession })
  );
  const ownMessages = chatMessages.filter((message) => message.authorToken === storedGuest.token);
  const proposals = songSummaries.filter((song) => song.proposerGuestToken === storedGuest.token);
  const votedSongs = songSummaries.filter((song) =>
    songVotes.some((vote) => vote.proposalId === song.id && vote.guestToken === storedGuest.token)
  );
  const request = transportRequests[0] ?? null;
  const assignedTrip = request
    ? transportTrips.find((trip) => trip.id === (request.assignedTripId || request.transportId)) ?? null
    : null;
  const lodgingById = new Map(lodgingOptions.map((item) => [item.id, item]));
  const lodgingSummary = lodgingInterests.map((interest) => {
    const lodging = interest.accommodationId ? lodgingById.get(interest.accommodationId) : undefined;
    return {
      request: interest,
      ...(lodging ? { lodging } : {}),
    };
  });
  const relatedNotices = buildRelevantTransportNotices(request, transportNotices);
  const groupAttendees = buildAttendeeNames(storedGuest, rsvp);
  const relevantHistory = buildRecentHistory(activity, storedGuest.token, request);

  const timestamps = [
    rsvp?.timestamp,
    request?.updatedAt,
    ...lodgingInterests.map((item) => item.updatedAt),
    ...proposals.map((item) => item.createdAt),
    ...votedSongs.map((item) => item.createdAt),
    ...relevantHistory.map((item) => item.timestamp),
  ].filter((item): item is number => typeof item === "number");

  const roleLabel = roleLabelFromGuest(storedGuest);

  return {
    guest: storedGuest,
    statusLabel: status.label,
    statusTone: status.tone,
    ...(roleLabel ? { roleLabel } : {}),
    ...(timestamps.length > 0 ? { lastUpdatedAt: Math.max(...timestamps) } : {}),
    attendance: {
      groupSize: rsvp ? rsvp.adultos + rsvp.ninos : 0,
      details: buildAttendanceDetails(storedGuest, rsvp),
      attendees: groupAttendees,
      ...(rsvp?.nota ? { note: rsvp.nota } : {}),
    },
    logistics: {
      transportRequest: request,
      assignedTrip,
      transportNotices: relatedNotices,
      lodgingInterests: lodgingSummary,
      ...(visibleTableName ? { tableName: visibleTableName } : {}),
      ...(ceremonySeatLabel ? { ceremonySeatLabel } : {}),
    },
    music: {
      proposalLimit: 2,
      proposalCount: proposals.length,
      proposals,
      votedSongs,
    },
    chat: {
      hasAccess: accessibleRooms.length > 0,
      roomNames: accessibleRooms.map((room) => room.name),
      ownMessageCount: ownMessages.length,
    },
    pending: createPendingActions({
      guest: storedGuest,
      rsvp,
      lodgingInterests,
      transportRequest: request,
      musicProposalCount: proposals.length,
      musicVoteCount: votedSongs.length,
      slug,
    }),
    history: relevantHistory,
  };
}
