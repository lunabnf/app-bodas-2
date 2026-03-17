import type { GuestTransportState, GuestTransportStatus, TransportNoticeType, TransportTripState } from "../types";

type BadgeTone =
  | GuestTransportState
  | GuestTransportStatus
  | TransportTripState
  | TransportNoticeType;

const toneMap: Record<BadgeTone, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  solicitado: "bg-sky-100 text-sky-800",
  asignado: "bg-indigo-100 text-indigo-800",
  resuelto: "bg-emerald-100 text-emerald-800",
  sin_solucion: "bg-rose-100 text-rose-800",
  no_respondido: "bg-stone-100 text-stone-700",
  no_necesito: "bg-stone-100 text-stone-700",
  he_solicitado: "bg-sky-100 text-sky-800",
  tengo_plaza_asignada: "bg-emerald-100 text-emerald-800",
  ofrezco_plazas: "bg-violet-100 text-violet-800",
  borrador: "bg-stone-100 text-stone-700",
  activo: "bg-emerald-100 text-emerald-800",
  completo: "bg-amber-100 text-amber-800",
  cancelado: "bg-rose-100 text-rose-800",
  info: "bg-sky-100 text-sky-800",
  importante: "bg-amber-100 text-amber-800",
  urgente: "bg-rose-100 text-rose-800",
};

const labelMap: Record<BadgeTone, string> = {
  pendiente: "Pendiente",
  solicitado: "Solicitado",
  asignado: "Asignado",
  resuelto: "Resuelto",
  sin_solucion: "Sin solución",
  no_respondido: "No respondido",
  no_necesito: "No necesito",
  he_solicitado: "He solicitado",
  tengo_plaza_asignada: "Plaza asignada",
  ofrezco_plazas: "Ofrezco plazas",
  borrador: "Borrador",
  activo: "Activo",
  completo: "Completo",
  cancelado: "Cancelado",
  info: "Info",
  importante: "Importante",
  urgente: "Urgente",
};

export function TransportStatusBadge({ tone }: { tone: BadgeTone }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneMap[tone]}`}>
      {labelMap[tone]}
    </span>
  );
}
