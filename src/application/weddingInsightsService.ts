import type { Guest } from "../domain/guest";
import { getGuestBudgetSnapshot } from "../services/guestBudgetService";
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
  rsvpRespondidos: number;
  actividadReciente: number;
  presupuesto: ReturnType<typeof getGuestBudgetSnapshot>;
};

function countWithoutTable(guests: Guest[]) {
  return guests.filter(
    (guest) => guest.estado === "confirmado" && guest.personaEstado !== "cancelada" && !guest.mesa
  ).length;
}

export async function loadWeddingInsights(): Promise<WeddingInsights> {
  const [guests, mesas, rsvps, actividad] = await Promise.all([
    obtenerInvitados(),
    obtenerMesas(),
    obtenerTodosLosRSVP(),
    obtenerActividad(),
  ]);

  const confirmados = guests.filter(
    (guest) => guest.estado === "confirmado" && guest.personaEstado !== "cancelada"
  );

  const presupuesto = getGuestBudgetSnapshot();

  return {
    totalInvitados: guests.length,
    confirmados: confirmados.length,
    pendientes: guests.filter((guest) => guest.estado === "pendiente").length,
    rechazados: guests.filter((guest) => guest.estado === "rechazado").length,
    adultosConfirmados: confirmados.filter((guest) => guest.tipo === "Adulto").length,
    ninosConfirmados: confirmados.filter((guest) => guest.tipo === "Niño").length,
    sinMesa: countWithoutTable(confirmados),
    mesasAsignadas: mesas.filter((mesa) => mesa.invitadosTokens.length > 0).length,
    mesasTotal: mesas.length,
    rsvpRespondidos: rsvps.length,
    actividadReciente: actividad.filter((item) => Date.now() - item.timestamp <= 1000 * 60 * 60 * 24).length,
    presupuesto,
  };
}
