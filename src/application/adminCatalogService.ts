import type { LodgingOption, LodgingRequest } from "../domain/lodging";
import type { TransportOption, TransportRequest } from "../domain/transport";
import {
  borrarAlojamiento,
  guardarAlojamientos,
  obtenerAlojamientos,
  obtenerSolicitudesAlojamiento,
} from "../services/alojamientosService";
import { addLog } from "../services/logsService";
import {
  borrarTransporte,
  guardarTransportes,
  obtenerSolicitudesTransporte,
  obtenerTransportes,
} from "../services/transporteService";
import { getUsuarioActual } from "../services/userService";

export type TransportDraft = {
  nombre: string;
  origen: string;
  destino: string;
  hora: string;
  capacidad: string;
  notas: string;
};

export function createEmptyLodgingDraft(): LodgingOption {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    direccion: "",
    link: "",
    notas: "",
  };
}

export function createEmptyTransportDraft(): TransportDraft {
  return {
    nombre: "",
    origen: "",
    destino: "",
    hora: "",
    capacidad: "",
    notas: "",
  };
}

function createTransportId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function loadAdminCatalogData(): Promise<{
  alojamientos: LodgingOption[];
  solicitudesAlojamiento: LodgingRequest[];
  transportes: TransportOption[];
  solicitudesTransporte: TransportRequest[];
}> {
  const [alojamientos, solicitudesAlojamiento, transportes, solicitudesTransporte] =
    await Promise.all([
      obtenerAlojamientos(),
      obtenerSolicitudesAlojamiento(),
      obtenerTransportes(),
      obtenerSolicitudesTransporte(),
    ]);

  return {
    alojamientos,
    solicitudesAlojamiento,
    transportes,
    solicitudesTransporte,
  };
}

export async function createLodgingOption(
  alojamientos: LodgingOption[],
  draft: LodgingOption
): Promise<LodgingOption | null> {
  if (!draft.nombre.trim()) return null;

  const lodging: LodgingOption = {
    id: draft.id,
    nombre: draft.nombre.trim(),
    direccion: draft.direccion.trim(),
    link: draft.link.trim(),
    ...(draft.notas?.trim() ? { notas: draft.notas.trim() } : {}),
  };

  await guardarAlojamientos([...alojamientos, lodging]);

  const usuario = getUsuarioActual();
  if (usuario) {
    await addLog(usuario.nombre, `Creó alojamiento: ${lodging.nombre}`);
  }

  return lodging;
}

export async function removeLodgingOption(
  alojamientos: LodgingOption[],
  id: string
): Promise<LodgingOption | null> {
  const lodging = alojamientos.find((item) => item.id === id) ?? null;
  await borrarAlojamiento(id);

  const usuario = getUsuarioActual();
  if (usuario && lodging) {
    await addLog(usuario.nombre, `Borró alojamiento: ${lodging.nombre}`);
  }

  return lodging;
}

export async function createTransportOption(
  transportes: TransportOption[],
  draft: TransportDraft
): Promise<TransportOption | null> {
  if (!draft.nombre.trim()) return null;

  const entry: TransportOption = {
    id: createTransportId(),
    nombre: draft.nombre.trim(),
    origen: draft.origen.trim(),
    destino: draft.destino.trim(),
    hora: draft.hora.trim(),
    capacidad: Number(draft.capacidad) || 0,
    notas: draft.notas.trim(),
  };

  await guardarTransportes([...transportes, entry]);

  const usuario = getUsuarioActual();
  if (usuario) {
    await addLog(usuario.nombre, `Creó transporte: ${entry.nombre}`);
  }

  return entry;
}

export async function removeTransportOption(
  transportes: TransportOption[],
  id: string
): Promise<TransportOption | null> {
  const transporte = transportes.find((item) => item.id === id) ?? null;
  await borrarTransporte(id);

  const usuario = getUsuarioActual();
  if (usuario && transporte) {
    await addLog(usuario.nombre, `Borró transporte: ${transporte.nombre}`);
  }

  return transporte;
}
