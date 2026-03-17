import type { CeremonyGuestFilter, CeremonyGuestCard, CeremonyLayout, CeremonySeat } from "../domain/ceremony";
import { buildCeremonySeatId } from "../domain/ceremony";
import type { CeremonySeatAssignment, Guest } from "../domain/guest";
import { loadGuestsAdminData } from "./adminGuestsService";
import { guardarInvitados } from "../services/invitadosService";
import { defaultCeremonyLayout, getCeremonyLayout, saveCeremonyLayout } from "../services/ceremonyService";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";

type CeremonyLayoutInput = {
  leftRows: number;
  rightRows: number;
  seatsPerRow: number;
};

function isPositiveInt(value: number) {
  return Number.isInteger(value) && value > 0;
}

export function isCeremonyAssignableGuest(guest: Guest): boolean {
  if (guest.personaEstado === "cancelada") return false;
  return guest.estado === "confirmado";
}

function isSeatInsideLayout(layout: CeremonyLayout, seat: CeremonySeatAssignment): boolean {
  if (seat.side === "left") {
    return seat.row <= layout.leftRows && seat.seat <= layout.seatsPerRow;
  }
  return seat.row <= layout.rightRows && seat.seat <= layout.seatsPerRow;
}

function serializeSeat(seat: CeremonySeatAssignment) {
  return buildCeremonySeatId(seat.side, seat.row, seat.seat);
}

function removeCeremonySeat(guest: Guest): Guest {
  const { ceremonySeat: _ceremonySeat, ...rest } = guest;
  return rest;
}

function sanitizeCeremonyAssignments(
  guests: Guest[],
  layout: CeremonyLayout
): { guests: Guest[]; warnings: string[]; changed: boolean } {
  const occupied = new Set<string>();
  const warnings: string[] = [];
  let changed = false;

  const sanitized = guests.map((guest) => {
    if (!guest.ceremonySeat) return guest;

    if (!isCeremonyAssignableGuest(guest)) {
      warnings.push(`${guest.nombre} ha sido retirado del croquis por no estar confirmado/activo.`);
      changed = true;
      return removeCeremonySeat(guest);
    }

    if (!isSeatInsideLayout(layout, guest.ceremonySeat)) {
      warnings.push(`${guest.nombre} ha quedado sin asiento porque el layout actual ya no lo contiene.`);
      changed = true;
      return removeCeremonySeat(guest);
    }

    const seatKey = serializeSeat(guest.ceremonySeat);
    if (occupied.has(seatKey)) {
      warnings.push(`${guest.nombre} ha quedado sin asiento porque existía una colisión en ${seatKey}.`);
      changed = true;
      return removeCeremonySeat(guest);
    }

    occupied.add(seatKey);
    return guest;
  });

  return { guests: sanitized, warnings, changed };
}

async function persistCeremonyLog(action: string) {
  const usuario = getUsuarioActual();
  if (!usuario) return;
  await addLog(usuario.nombre, action);
}

export async function loadCeremonyWorkspace(): Promise<{
  layout: CeremonyLayout;
  guests: Guest[];
  warnings: string[];
}> {
  const { invitados } = await loadGuestsAdminData();
  const layout = getCeremonyLayout();
  const sanitized = sanitizeCeremonyAssignments(invitados, layout);

  if (sanitized.changed) {
    await guardarInvitados(sanitized.guests);
  }

  return {
    layout,
    guests: sanitized.guests,
    warnings: sanitized.warnings,
  };
}

export function getCeremonyGuestCards(
  guests: Guest[],
  filter: CeremonyGuestFilter,
  query: string
): CeremonyGuestCard[] {
  const normalizedQuery = query.trim().toLowerCase();

  return guests
    .filter((guest) => {
      const matchesQuery =
        normalizedQuery.length === 0 || guest.nombre.toLowerCase().includes(normalizedQuery);
      if (!matchesQuery) return false;

      if (filter === "sin_asignar") return isCeremonyAssignableGuest(guest) && !guest.ceremonySeat;
      if (filter === "asignados") return isCeremonyAssignableGuest(guest) && Boolean(guest.ceremonySeat);
      return isCeremonyAssignableGuest(guest) || Boolean(guest.ceremonySeat);
    })
    .map((guest) => {
      const status: CeremonyGuestCard["estado"] = isCeremonyAssignableGuest(guest)
        ? "confirmado"
        : "cancelado";
      return {
        token: guest.token,
        nombre: guest.nombre,
        tipo: guest.tipo,
        estado: status,
        ...(guest.mesa ? { mesa: guest.mesa } : {}),
        ...(guest.ceremonySeat ? { ceremonySeat: guest.ceremonySeat } : {}),
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function buildCeremonySeats(layout: CeremonyLayout, guests: Guest[]): CeremonySeat[] {
  const bySeat = new Map<string, string>();
  for (const guest of guests) {
    if (!guest.ceremonySeat) continue;
    bySeat.set(serializeSeat(guest.ceremonySeat), guest.token);
  }

  const seats: CeremonySeat[] = [];
  const sides: Array<{ side: "left" | "right"; rows: number }> = [
    { side: "left", rows: layout.leftRows },
    { side: "right", rows: layout.rightRows },
  ];

  for (const sideConfig of sides) {
    for (let row = 1; row <= sideConfig.rows; row += 1) {
      for (let seat = 1; seat <= layout.seatsPerRow; seat += 1) {
        const id = buildCeremonySeatId(sideConfig.side, row, seat);
        const guestToken = bySeat.get(id) ?? null;
        seats.push({
          id,
          side: sideConfig.side,
          row,
          seat,
          guestToken,
          state: guestToken ? "ocupado" : "libre",
        });
      }
    }
  }

  return seats;
}

export function getCeremonyMetrics(layout: CeremonyLayout, guests: Guest[]) {
  const assignableGuests = guests.filter((guest) => isCeremonyAssignableGuest(guest));
  const assignedGuests = assignableGuests.filter((guest) => guest.ceremonySeat);
  const leftAssigned = assignedGuests.filter((guest) => guest.ceremonySeat?.side === "left").length;
  const rightAssigned = assignedGuests.filter((guest) => guest.ceremonySeat?.side === "right").length;
  const leftCapacity = layout.leftRows * layout.seatsPerRow;
  const rightCapacity = layout.rightRows * layout.seatsPerRow;

  return {
    totalConfirmados: assignableGuests.length,
    totalAsignados: assignedGuests.length,
    totalSinAsignar: assignableGuests.length - assignedGuests.length,
    totalAsientos: leftCapacity + rightCapacity,
    leftAssigned,
    rightAssigned,
    leftCapacity,
    rightCapacity,
  };
}

export async function updateCeremonyLayoutConfig(
  guests: Guest[],
  input: CeremonyLayoutInput
): Promise<CeremonyLayout> {
  if (!isPositiveInt(input.leftRows) || !isPositiveInt(input.rightRows) || !isPositiveInt(input.seatsPerRow)) {
    throw new Error("Filas y asientos por fila deben ser enteros mayores que cero.");
  }

  const nextLayout: CeremonyLayout = {
    ...defaultCeremonyLayout,
    ...getCeremonyLayout(),
    leftRows: input.leftRows,
    rightRows: input.rightRows,
    seatsPerRow: input.seatsPerRow,
    updatedAt: Date.now(),
  };

  const overflowGuests = guests.filter((guest) => {
    if (!guest.ceremonySeat) return false;
    return !isSeatInsideLayout(nextLayout, guest.ceremonySeat);
  });

  if (overflowGuests.length > 0) {
    throw new Error(
      `No puedes reducir el layout: ${overflowGuests.length} invitado(s) quedarían fuera del croquis.`
    );
  }

  saveCeremonyLayout(nextLayout);
  await persistCeremonyLog(
    `Actualizó el layout de ceremonia (${input.leftRows}/${input.rightRows} filas, ${input.seatsPerRow} asientos por fila)`
  );
  return nextLayout;
}

export async function assignGuestToCeremonySeat(
  guests: Guest[],
  layout: CeremonyLayout,
  guestToken: string,
  seat: CeremonySeatAssignment
): Promise<Guest[]> {
  const guest = guests.find((entry) => entry.token === guestToken);
  if (!guest) {
    throw new Error("No se encontró el invitado seleccionado.");
  }

  if (!isCeremonyAssignableGuest(guest)) {
    throw new Error("Solo puedes asignar invitados confirmados y activos.");
  }

  if (!isSeatInsideLayout(layout, seat)) {
    throw new Error("El asiento seleccionado no existe en el layout actual.");
  }

  const seatKey = serializeSeat(seat);
  const occupant = guests.find(
    (entry) => entry.token !== guestToken && entry.ceremonySeat && serializeSeat(entry.ceremonySeat) === seatKey
  );

  if (occupant) {
    throw new Error(`Ese asiento ya está ocupado por ${occupant.nombre}.`);
  }

  const nextGuests = guests.map((entry) =>
    entry.token === guestToken ? { ...entry, ceremonySeat: seat } : entry
  );

  await guardarInvitados(nextGuests);
  await persistCeremonyLog(
    `Asignó a ${guest.nombre} en ceremonia (${seat.side}, fila ${seat.row}, asiento ${seat.seat})`
  );
  return nextGuests;
}

export async function unassignGuestFromCeremony(
  guests: Guest[],
  guestToken: string
): Promise<Guest[]> {
  const guest = guests.find((entry) => entry.token === guestToken);
  if (!guest) {
    throw new Error("No se encontró el invitado seleccionado.");
  }

  if (!guest.ceremonySeat) {
    return guests;
  }

  const nextGuests = guests.map((entry) =>
    entry.token === guestToken ? removeCeremonySeat(entry) : entry
  );

  await guardarInvitados(nextGuests);
  await persistCeremonyLog(`Quitó a ${guest.nombre} del asiento de ceremonia`);
  return nextGuests;
}
