import type { Guest } from "../domain/guest";
import type { Table } from "../domain/table";
import { invitadosDemo, mesasDemo } from "../admin/data/mesasDemo";
import {
  borrarInvitado as deleteGuestByToken,
  guardarInvitado,
  guardarInvitados,
  obtenerInvitados,
} from "../services/invitadosService";
import { addLog } from "../services/logsService";
import { guardarMesas, obtenerMesas } from "../services/mesasService";
import { getUsuarioActual } from "../services/userService";

export type GuestDraft = {
  nombre: string;
  tipo: Guest["tipo"];
  grupo: string;
  grupoTipo: Guest["grupoTipo"];
  estado: Guest["estado"];
  mesa: string;
  edad?: number;
};

export function createEmptyGuestDraft(): GuestDraft {
  return {
    nombre: "",
    tipo: "Adulto",
    grupo: "",
    grupoTipo: "otros",
    estado: "confirmado",
    mesa: "",
  };
}

export async function loadGuestsAdminData(): Promise<{ invitados: Guest[]; mesas: Table[] }> {
  const [storedInvitados, storedMesas] = await Promise.all([
    obtenerInvitados(),
    obtenerMesas(),
  ]);

  const invitados = storedInvitados.length > 0 ? storedInvitados : invitadosDemo;
  const mesas = storedMesas.length > 0 ? storedMesas : mesasDemo;

  if (storedInvitados.length === 0) {
    await guardarInvitados(invitados);
  }

  if (storedMesas.length === 0) {
    await guardarMesas(mesas);
  }

  return { invitados, mesas };
}

export async function createGuest(
  invitados: Guest[],
  draft: GuestDraft
): Promise<Guest | null> {
  if (!draft.nombre.trim() || !draft.grupo.trim()) return null;

  const nextId =
    invitados.length > 0
      ? String(
          Math.max(
            ...invitados.map((guest) => {
              const parsed = Number(guest.id);
              return Number.isFinite(parsed) ? parsed : 0;
            })
          ) + 1
        )
      : "1";

  const invitado: Guest = {
    id: nextId,
    nombre: draft.nombre.trim(),
    tipo: draft.tipo,
    grupo: draft.grupo.trim(),
    grupoTipo: draft.grupoTipo,
    estado: draft.estado,
    token: crypto.randomUUID(),
    esAdulto: draft.tipo !== "Niño",
    ...(draft.mesa.trim() ? { mesa: draft.mesa.trim() } : {}),
    ...(typeof draft.edad === "number" && Number.isFinite(draft.edad)
      ? { edad: draft.edad }
      : {}),
  };

  await guardarInvitado(invitado);

  const usuario = getUsuarioActual();
  if (usuario) {
    await addLog(usuario.nombre, `Añadió invitado: ${invitado.nombre}`);
  }

  return invitado;
}

export async function removeGuest(token: string, nombre: string): Promise<void> {
  await deleteGuestByToken(token);

  const usuario = getUsuarioActual();
  if (usuario) {
    await addLog(usuario.nombre, `Eliminó invitado: ${nombre}`);
  }
}

export async function assignGuestToTable(
  invitados: Guest[],
  mesas: Table[],
  token: string,
  mesaId: string
): Promise<{ invitados: Guest[]; mesas: Table[] }> {
  const invitadosActualizados = invitados.map((guest) =>
    guest.token === token
      ? (() => {
          const updated = { ...guest };
          if (mesaId) {
            return { ...updated, mesa: mesaId };
          }
          delete updated.mesa;
          return updated;
        })()
      : guest
  );

  const mesasActualizadas = mesas.map((mesa) => ({
    ...mesa,
    invitadosTokens: invitadosActualizados
      .filter((guest) => guest.mesa === mesa.id)
      .map((guest) => guest.token),
  }));

  await Promise.all([
    guardarInvitados(invitadosActualizados),
    guardarMesas(mesasActualizadas),
  ]);

  const usuario = getUsuarioActual();
  const invitado = invitados.find((guest) => guest.token === token);
  const mesa = mesas.find((item) => item.id === mesaId);
  if (usuario && invitado && mesa) {
    await addLog(usuario.nombre, `Asignó a ${invitado.nombre} a ${mesa.nombre}`);
  }

  return {
    invitados: invitadosActualizados,
    mesas: mesasActualizadas,
  };
}
