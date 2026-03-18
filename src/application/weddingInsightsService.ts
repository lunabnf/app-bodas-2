import type { Guest } from "../domain/guest";
import {
  computeBudgetItems,
  computeBudgetSummary,
  getBudgetDocument,
  getBudgetDynamicContext,
  getGuestBudgetSnapshot,
} from "../services/guestBudgetService";
import { obtenerSolicitudesAlojamiento } from "../services/alojamientosService";
import { obtenerMusicSongSummaries } from "../services/musicaService";
import { getWeddingProgramDocument } from "../services/programaService";
import { obtenerSolicitudesTransporte } from "../services/transporteService";
import { getWeddingSettings, isMesasPublishedForGuests } from "../services/weddingSettingsService";
import { obtenerActividad } from "../services/actividadService";
import { obtenerInvitados } from "../services/invitadosService";
import { obtenerMesas } from "../services/mesasService";
import { obtenerTodosLosRSVP } from "../services/rsvpService";

export type WeddingInsights = {
  totalInvitados: number;
  confirmados: number;
  pendientes: number;
  rechazados: number;
  adultosConfirmados: number;
  ninosConfirmados: number;
  sinMesa: number;
  mesasAsignadas: number;
  mesasTotal: number;
  ceremoniaAsignados: number;
  ceremoniaSinAsignar: number;
  rsvpRespondidos: number;
  actividadReciente: number;
  presupuesto: ReturnType<typeof getGuestBudgetSnapshot>;
  presupuestoResumen: Awaited<ReturnType<typeof loadBudgetOverview>>;
  alojamiento: {
    solicitudes: number;
    invitadosInteresados: number;
    personasPotenciales: number;
  };
  transporte: {
    solicitudes: number;
    pendientes: number;
    resueltos: number;
    plazasSolicitadas: number;
    conductores: number;
  };
  musica: {
    propuestas: number;
    visibles: number;
    ocultas: number;
    votosTotales: number;
  };
  programa: {
    total: number;
    visibles: number;
    publicado: boolean;
  };
  publicacion: {
    mesasPublicadas: boolean;
  };
};

function countWithoutTable(guests: Guest[]) {
  return guests.filter(
    (guest) => guest.estado === "confirmado" && guest.personaEstado !== "cancelada" && !guest.mesa
  ).length;
}

function countWithoutCeremonySeat(guests: Guest[]) {
  return guests.filter(
    (guest) =>
      guest.estado === "confirmado" &&
      guest.personaEstado !== "cancelada" &&
      !guest.ceremonySeat
  ).length;
}

async function loadBudgetOverview() {
  const document = getBudgetDocument();
  const context = await getBudgetDynamicContext();
  const computedItems = computeBudgetItems(document.items, context);
  const summary = computeBudgetSummary(computedItems);
  const activeItems = computedItems.filter((item) => item.active);

  return {
    summary,
    activeItemsCount: activeItems.length,
    hasInactiveItems: computedItems.some((item) => !item.active),
    hasNotes: activeItems.some((item) => Boolean(item.notes?.trim())),
  };
}

export async function loadWeddingInsights(): Promise<WeddingInsights> {
  const [
    guests,
    mesas,
    rsvps,
    actividad,
    lodgingRequests,
    transportRequests,
    musicSummaries,
    budgetOverview,
  ] = await Promise.all([
    obtenerInvitados(),
    obtenerMesas(),
    obtenerTodosLosRSVP(),
    obtenerActividad(),
    obtenerSolicitudesAlojamiento(),
    obtenerSolicitudesTransporte(),
    obtenerMusicSongSummaries(true),
    loadBudgetOverview(),
  ]);

  const confirmados = guests.filter(
    (guest) => guest.estado === "confirmado" && guest.personaEstado !== "cancelada"
  );

  const presupuesto = getGuestBudgetSnapshot();
  const settings = getWeddingSettings();
  const programDocument = getWeddingProgramDocument();
  const interestedLodgingRequests = lodgingRequests.filter((request) => request.interested);
  const transportNeeds = transportRequests.filter((request) => request.needsTransport);
  const transportPending = transportNeeds.filter(
    (request) => request.status === "pendiente" || request.status === "solicitado"
  );
  const transportResolved = transportNeeds.filter(
    (request) => request.status === "resuelto" || request.status === "asignado"
  );
  const requestedTransportSeats = transportNeeds.reduce(
    (sum, request) => sum + (request.peopleCount || request.seats || 0),
    0
  );
  const ceremonyAssigned = confirmados.filter((guest) => guest.ceremonySeat).length;
  const visibleProgramItems = programDocument.items.filter((item) => item.visible);

  return {
    totalInvitados: guests.length,
    confirmados: confirmados.length,
    pendientes: guests.filter((guest) => guest.estado === "pendiente").length,
    rechazados: guests.filter((guest) => guest.estado === "rechazado").length,
    adultosConfirmados: confirmados.filter((guest) => guest.tipo === "Adulto").length,
    ninosConfirmados: confirmados.filter((guest) => guest.tipo === "Niño").length,
    sinMesa: countWithoutTable(confirmados),
    ceremoniaAsignados: ceremonyAssigned,
    ceremoniaSinAsignar: countWithoutCeremonySeat(confirmados),
    mesasAsignadas: mesas.filter((mesa) => mesa.invitadosTokens.length > 0).length,
    mesasTotal: mesas.length,
    rsvpRespondidos: rsvps.length,
    actividadReciente: actividad.filter((item) => Date.now() - item.timestamp <= 1000 * 60 * 60 * 24).length,
    presupuesto,
    presupuestoResumen: budgetOverview,
    alojamiento: {
      solicitudes: lodgingRequests.length,
      invitadosInteresados: interestedLodgingRequests.length,
      personasPotenciales: interestedLodgingRequests.reduce(
        (sum, request) => sum + (request.persons || 0),
        0
      ),
    },
    transporte: {
      solicitudes: transportNeeds.length,
      pendientes: transportPending.length,
      resueltos: transportResolved.length,
      plazasSolicitadas: requestedTransportSeats,
      conductores: transportRequests.filter((request) => request.hasCarOffer).length,
    },
    musica: {
      propuestas: musicSummaries.length,
      visibles: musicSummaries.filter((item) => item.visible).length,
      ocultas: musicSummaries.filter((item) => !item.visible).length,
      votosTotales: musicSummaries.reduce((sum, item) => sum + item.voteCount, 0),
    },
    programa: {
      total: programDocument.items.length,
      visibles: visibleProgramItems.length,
      publicado: settings.mostrarPrograma && visibleProgramItems.length > 0,
    },
    publicacion: {
      mesasPublicadas: isMesasPublishedForGuests(settings),
    },
  };
}
