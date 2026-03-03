import type { GuestSession } from "../domain/guest";
import type { GuestRsvp, RsvpAttendance } from "../domain/rsvp";
import { registrarActividad } from "../services/actividadService";
import { addLog } from "../services/logsService";
import {
  guardarCancion,
  obtenerCanciones,
  votarCancion,
  type Cancion,
} from "../services/musicaService";
import { guardarRSVP, obtenerRSVP } from "../services/rsvpService";

export type Allergy =
  | "gluten"
  | "lacteos"
  | "frutos-secos"
  | "marisco"
  | "huevo"
  | "pescado"
  | "soja"
  | "diabetes"
  | "otro";

type PersonBase = {
  fullName: string;
  hasAllergy: boolean;
  allergies: Allergy[];
  customAllergy?: string;
};

export type AdultForm = PersonBase;
export type ChildForm = PersonBase & { age?: number };

export type RsvpFormState = {
  attending: RsvpAttendance;
  numAdults: number;
  numChildren: number;
  adults: AdultForm[];
  children: ChildForm[];
  nota: string;
};

function uuid(): string {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function cleanPersonBase<T extends PersonBase>(item: T): T {
  const next = { ...item };
  if (!next.customAllergy) {
    delete next.customAllergy;
  }
  return next;
}

export function cleanChildForm(item: ChildForm): ChildForm {
  const next = cleanPersonBase({ ...item });
  if (typeof next.age !== "number") {
    delete next.age;
  }
  return next;
}

export function syncAdultForms(count: number, previous: AdultForm[]): AdultForm[] {
  const next = [...previous];
  if (count > next.length) {
    while (next.length < count) {
      next.push({ fullName: "", hasAllergy: false, allergies: [] });
    }
  } else if (count < next.length) {
    next.length = Math.max(count, 0);
  }
  return next;
}

export function syncChildForms(count: number, previous: ChildForm[]): ChildForm[] {
  const next = [...previous];
  if (count > next.length) {
    while (next.length < count) {
      next.push({ fullName: "", hasAllergy: false, allergies: [] });
    }
  } else if (count < next.length) {
    next.length = Math.max(count, 0);
  }
  return next;
}

function mapStoredRsvpToForm(existing: GuestRsvp): RsvpFormState {
  const adults = existing.detalles.slice(0, existing.adultos).map((detail) =>
    cleanPersonBase({
      fullName: detail.nombre,
      hasAllergy: detail.alergias.length > 0 || Boolean(detail.intolerancias),
      allergies: detail.alergias as Allergy[],
      ...(detail.intolerancias ? { customAllergy: detail.intolerancias } : {}),
    })
  );

  const children = existing.detalles.slice(existing.adultos).map((detail) =>
    cleanChildForm({
      fullName: detail.nombre,
      hasAllergy: detail.alergias.length > 0 || Boolean(detail.intolerancias),
      allergies: detail.alergias as Allergy[],
      ...(typeof detail.edad === "number" ? { age: detail.edad } : {}),
      ...(detail.intolerancias ? { customAllergy: detail.intolerancias } : {}),
    })
  );

  return {
    attending: existing.attending,
    numAdults: existing.adultos,
    numChildren: existing.ninos,
    adults,
    children,
    nota: existing.nota ?? "",
  };
}

export async function loadGuestRsvpForm(
  guestToken: string
): Promise<RsvpFormState | null> {
  const existing = await obtenerRSVP(guestToken);
  if (!existing) {
    return null;
  }
  return mapStoredRsvpToForm(existing);
}

type SubmitGuestRsvpInput = {
  invitado: GuestSession;
  attending: RsvpAttendance;
  numAdults: number;
  numChildren: number;
  adults: AdultForm[];
  children: ChildForm[];
  nota: string;
};

export async function submitGuestRsvp({
  invitado,
  attending,
  numAdults,
  numChildren,
  adults,
  children,
  nota,
}: SubmitGuestRsvpInput): Promise<void> {
  if (attending === "si") {
    await addLog(invitado.nombre, "Confirmó asistencia a la boda");
  } else if (attending === "no") {
    await addLog(invitado.nombre, "Rechazó la asistencia a la boda");
  }

  const data: GuestRsvp = {
    guestToken: invitado.token,
    guestName: invitado.nombre,
    attending,
    adultos: numAdults,
    ninos: numChildren,
    detalles: [
      ...adults.map((adult) => ({
        nombre: adult.fullName,
        alergias: adult.allergies,
        ...(adult.customAllergy ? { intolerancias: adult.customAllergy } : {}),
      })),
      ...children.map((child) => ({
        nombre: child.fullName,
        alergias: child.allergies,
        ...(typeof child.age === "number" ? { edad: child.age } : {}),
        ...(child.customAllergy ? { intolerancias: child.customAllergy } : {}),
      })),
    ],
    ...(nota.trim() ? { nota: nota.trim() } : {}),
    timestamp: Date.now(),
  };

  await guardarRSVP(data);

  if (attending === "si") {
    await registrarActividad({
      id: uuid(),
      timestamp: Date.now(),
      tipo: "rsvp",
      mensaje: `${invitado.nombre} ha confirmado asistencia (${numAdults} adultos, ${numChildren} niños)`,
      tokenInvitado: invitado.token,
    });
  } else if (attending === "no") {
    await registrarActividad({
      id: uuid(),
      timestamp: Date.now(),
      tipo: "rsvp",
      mensaje: `${invitado.nombre} ha rechazado la asistencia`,
      tokenInvitado: invitado.token,
    });
  }
}

export async function loadSongsSorted(): Promise<Cancion[]> {
  const data = await obtenerCanciones();
  return [...data].sort((a, b) => b.votos - a.votos);
}

type ProposeSongInput = {
  invitado: GuestSession | null;
  canciones: Cancion[];
  titulo: string;
  artista: string;
};

export async function proposeSong({
  invitado,
  canciones,
  titulo,
  artista,
}: ProposeSongInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!invitado) {
    return { ok: false, error: "Debes identificarte." };
  }

  if (!titulo.trim() || !artista.trim()) {
    return { ok: false, error: "Rellena título y artista." };
  }

  const propuestasDeEsteInvitado = canciones.filter(
    (song) => song.propuestaPorToken === invitado.token
  ).length;
  if (propuestasDeEsteInvitado >= 2) {
    return { ok: false, error: "Solo puedes proponer 2 canciones." };
  }

  const existe = canciones.some(
    (song) =>
      song.titulo.toLowerCase() === titulo.trim().toLowerCase() &&
      song.artista.toLowerCase() === artista.trim().toLowerCase()
  );
  if (existe) {
    return { ok: false, error: "Esta canción ya está propuesta." };
  }

  await guardarCancion({
    id: crypto.randomUUID(),
    titulo: titulo.trim(),
    artista: artista.trim(),
    propuestaPorToken: invitado.token,
    votos: 0,
  });

  await registrarActividad({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    tipo: "musica_propuesta",
    mensaje: `${invitado.nombre} ha propuesto: ${titulo.trim()} - ${artista.trim()}`,
    tokenInvitado: invitado.token,
  });

  return { ok: true };
}

type VoteSongInput = {
  invitado: GuestSession | null;
  songId: string;
  canciones: Cancion[];
};

export async function voteSong({
  invitado,
  songId,
  canciones,
}: VoteSongInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!invitado) {
    return { ok: false, error: "Debes identificarte." };
  }

  const voted = await votarCancion(songId);
  if (!voted) {
    return { ok: false, error: "La canción ya no está disponible." };
  }

  const song = canciones.find((item) => item.id === songId);
  if (song) {
    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "musica_voto",
      mensaje: `${invitado.nombre} ha votado: ${song.titulo} - ${song.artista}`,
      tokenInvitado: invitado.token,
    });
  }

  return { ok: true };
}
