import { useEffect, useState } from "react";
import type { LodgingRequest } from "../domain/lodging";
import type { GuestRsvp } from "../domain/rsvp";
import type { TransportRequest } from "../domain/transport";
import {
  clearAdminActivityHistory,
  formatActivityDate,
  loadActivityDashboardData,
  type TimelineItem,
} from "../application/adminActivityService";
import type { EventoActividad } from "../services/actividadService";
import type { LogItem } from "../services/logsService";

export default function ActividadAdmin() {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [rsvps, setRsvps] = useState<GuestRsvp[]>([]);
  const [lodgingRequests, setLodgingRequests] = useState<LodgingRequest[]>([]);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [rawActivity, setRawActivity] = useState<EventoActividad[]>([]);
  const [adminLogs, setAdminLogs] = useState<LogItem[]>([]);
  const [lodgingNames, setLodgingNames] = useState<Record<string, string>>({});
  const [transportNames, setTransportNames] = useState<Record<string, string>>({});
  const [confirmados, setConfirmados] = useState(0);
  const [rechazados, setRechazados] = useState(0);
  const [totalPlazasTransporte, setTotalPlazasTransporte] = useState(0);
  const [totalConAlergias, setTotalConAlergias] = useState(0);

  const cargarActividad = async () => {
    setLoading(true);

    const data = await loadActivityDashboardData();
    setRawActivity(data.rawActivity);
    setAdminLogs(data.adminLogs);
    setRsvps(data.rsvps);
    setLodgingRequests(data.lodgingRequests);
    setTransportRequests(data.transportRequests);
    setLodgingNames(data.lodgingNames);
    setTransportNames(data.transportNames);
    setTimeline(data.timeline);
    setConfirmados(data.metrics.confirmados);
    setRechazados(data.metrics.rechazados);
    setTotalPlazasTransporte(data.metrics.totalPlazasTransporte);
    setTotalConAlergias(data.metrics.totalConAlergias);
    setLoading(false);
  };

  useEffect(() => {
    void cargarActividad();
  }, []);

  const handleLimpiar = async () => {
    const confirmar = window.confirm(
      "Se borrará el historial de eventos y logs, pero no las respuestas ni solicitudes de invitados. ¿Continuar?"
    );
    if (!confirmar) return;

    await clearAdminActivityHistory();
    await cargarActividad();
  };

  return (
    <div className="p-6 space-y-8 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Actividad</h1>
          <p className="text-sm opacity-70 mt-1">
            Panel de control de todo lo que hacen invitados y novios dentro de la aplicación.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleLimpiar()}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-red-50 hover:text-red-700"
        >
          Borrar historial
        </button>
      </div>

      {loading ? (
        <p className="text-sm opacity-60">Cargando actividad...</p>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm opacity-70">Confirmaciones</p>
              <p className="mt-2 text-3xl font-semibold">{confirmados}</p>
              <p className="text-xs opacity-60 mt-1">Invitados que asistirán</p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm opacity-70">Rechazos</p>
              <p className="mt-2 text-3xl font-semibold">{rechazados}</p>
              <p className="text-xs opacity-60 mt-1">Invitados que no asistirán</p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm opacity-70">Solicitudes transporte</p>
              <p className="mt-2 text-3xl font-semibold">{totalPlazasTransporte}</p>
              <p className="text-xs opacity-60 mt-1">Plazas pedidas por invitados</p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm opacity-70">RSVP con alergias</p>
              <p className="mt-2 text-3xl font-semibold">{totalConAlergias}</p>
              <p className="text-xs opacity-60 mt-1">Respuestas con dietas/intolerancias</p>
            </article>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Timeline global</h2>
            {timeline.length === 0 ? (
              <p className="text-sm opacity-60">Todavía no hay actividad registrada.</p>
            ) : (
              <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-white/10 text-left">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Actor</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Detalle</th>
                      <th className="px-3 py-2">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((item) => (
                      <tr key={item.id} className="border-t border-white/10">
                        <td className="px-3 py-2 whitespace-nowrap">{formatActivityDate(item.timestamp)}</td>
                        <td className="px-3 py-2">{item.actor}</td>
                        <td className="px-3 py-2 capitalize">{item.category.split("_").join(" ")}</td>
                        <td className="px-3 py-2">{item.detail}</td>
                        <td className="px-3 py-2 capitalize">{item.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Confirmaciones y datos de RSVP</h2>
            {rsvps.length === 0 ? (
              <p className="text-sm opacity-60">Todavía no hay respuestas de asistencia.</p>
            ) : (
              <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-white/10 text-left">
                    <tr>
                      <th className="px-3 py-2">Invitado</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Asistentes</th>
                      <th className="px-3 py-2">Alergias / intolerancias</th>
                      <th className="px-3 py-2">Nota</th>
                      <th className="px-3 py-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((item) => {
                      const alergias = item.detalles
                        .flatMap((detail) => [
                          ...detail.alergias,
                          detail.intolerancias?.trim() || "",
                        ])
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <tr key={item.guestToken} className="border-t border-white/10 align-top">
                          <td className="px-3 py-2">{item.guestName || item.guestToken}</td>
                          <td className="px-3 py-2 capitalize">{item.attending || "pendiente"}</td>
                          <td className="px-3 py-2">
                            {item.adultos} adulto(s), {item.ninos} niño(s)
                          </td>
                          <td className="px-3 py-2">{alergias || "-"}</td>
                          <td className="px-3 py-2">{item.nota || "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{formatActivityDate(item.timestamp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Solicitudes de alojamiento</h2>
              {lodgingRequests.length === 0 ? (
                <p className="text-sm opacity-60">Todavía no hay solicitudes de alojamiento.</p>
              ) : (
                <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10 text-left">
                      <tr>
                        <th className="px-3 py-2">Invitado</th>
                        <th className="px-3 py-2">Respuesta</th>
                        <th className="px-3 py-2">Preferencia</th>
                        <th className="px-3 py-2">Notas</th>
                        <th className="px-3 py-2">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lodgingRequests.map((item) => (
                        <tr key={item.id} className="border-t border-white/10">
                          <td className="px-3 py-2">{item.guestName}</td>
                          <td className="px-3 py-2">
                            {item.needsLodging ? "Necesita alojamiento" : "No necesita"}
                          </td>
                          <td className="px-3 py-2">
                            {item.lodgingId ? lodgingNames[item.lodgingId] || item.lodgingId : "-"}
                          </td>
                          <td className="px-3 py-2">{item.notes || "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{formatActivityDate(item.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Solicitudes de transporte</h2>
              {transportRequests.length === 0 ? (
                <p className="text-sm opacity-60">Todavía no hay solicitudes de transporte.</p>
              ) : (
                <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10 text-left">
                      <tr>
                        <th className="px-3 py-2">Invitado</th>
                        <th className="px-3 py-2">Transporte</th>
                        <th className="px-3 py-2">Plazas</th>
                        <th className="px-3 py-2">Notas</th>
                        <th className="px-3 py-2">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportRequests.map((item) => (
                        <tr key={item.id} className="border-t border-white/10">
                          <td className="px-3 py-2">{item.guestName}</td>
                          <td className="px-3 py-2">
                            {transportNames[item.transportId] || item.transportId}
                          </td>
                          <td className="px-3 py-2">{item.seats}</td>
                          <td className="px-3 py-2">{item.notes || "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{formatActivityDate(item.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Eventos registrados</h2>
              {rawActivity.length === 0 ? (
                <p className="text-sm opacity-60">No hay eventos registrados.</p>
              ) : (
                <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10 text-left">
                      <tr>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Invitado</th>
                        <th className="px-3 py-2">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawActivity.map((item) => (
                        <tr key={item.id} className="border-t border-white/10">
                          <td className="px-3 py-2 whitespace-nowrap">{formatActivityDate(item.timestamp)}</td>
                          <td className="px-3 py-2">{item.tipo}</td>
                          <td className="px-3 py-2">{item.tokenInvitado || "-"}</td>
                          <td className="px-3 py-2">{item.mensaje}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Acciones de administración</h2>
              {adminLogs.length === 0 ? (
                <p className="text-sm opacity-60">No hay logs de administración.</p>
              ) : (
                <div className="overflow-auto rounded-lg border border-white/20 bg-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10 text-left">
                      <tr>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Usuario</th>
                        <th className="px-3 py-2">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminLogs.map((item) => (
                        <tr key={item.id} className="border-t border-white/10">
                          <td className="px-3 py-2 whitespace-nowrap">{formatActivityDate(item.timestamp)}</td>
                          <td className="px-3 py-2">{item.user}</td>
                          <td className="px-3 py-2">{item.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
