import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { TransportOption, TransportRequest } from "../domain/transport";
import { registrarActividad } from "../services/actividadService";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../services/devAccessService";
import {
  borrarSolicitudTransporte,
  guardarSolicitudTransporte,
  obtenerSolicitudesTransportePorInvitado,
  obtenerTransportes,
} from "../services/transporteService";
import { useAuth } from "../store/useAuth";

export default function DesplazamientosPage() {
  const { slug } = useParams();
  const [items, setItems] = useState<TransportOption[]>([]);
  const [solicitudes, setSolicitudes] = useState<TransportRequest[]>([]);
  const [seatInputs, setSeatInputs] = useState<Record<string, number>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);

  useEffect(() => {
    void (async () => {
      const options = await obtenerTransportes();
      setItems(options || []);

      if (!effectiveGuest) return;
      const guestRequests = await obtenerSolicitudesTransportePorInvitado(effectiveGuest.token);
      setSolicitudes(guestRequests);
      setSeatInputs(
        guestRequests.reduce<Record<string, number>>((acc, request) => {
          acc[request.transportId] = request.seats;
          return acc;
        }, {})
      );
      setNotesInputs(
        guestRequests.reduce<Record<string, string>>((acc, request) => {
          acc[request.transportId] = request.notes ?? "";
          return acc;
        }, {})
      );
    })();
  }, [effectiveGuest]);

  function getSolicitud(transportId: string) {
    return solicitudes.find((item) => item.transportId === transportId);
  }

  async function guardarSolicitud(item: TransportOption) {
    if (!effectiveGuest) return;

    const seats = Math.max(1, seatInputs[item.id] || getSolicitud(item.id)?.seats || 1);
    const currentNotes = notesInputs[item.id];
    const request: TransportRequest = {
      id: `${effectiveGuest.token}-${item.id}`,
      guestToken: effectiveGuest.token,
      guestName: effectiveGuest.nombre,
      transportId: item.id,
      seats,
      ...(currentNotes?.trim() ? { notes: currentNotes.trim() } : {}),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await guardarSolicitudTransporte(request);
    setSolicitudes((current) => {
      const next = current.filter((entry) => entry.transportId !== item.id);
      return [...next, request];
    });

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "transporte_solicitud",
      mensaje: `${effectiveGuest.nombre} ha solicitado ${seats} plaza(s) en ${item.nombre}`,
      tokenInvitado: effectiveGuest.token,
    });
  }

  async function cancelarSolicitud(transportId: string) {
    if (!effectiveGuest) return;

    await borrarSolicitudTransporte(effectiveGuest.token, transportId);
    setSolicitudes((current) => current.filter((entry) => entry.transportId !== transportId));

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "transporte_solicitud",
      mensaje: `${effectiveGuest.nombre} ha cancelado una solicitud de transporte`,
      tokenInvitado: effectiveGuest.token,
    });
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Información</p>
        <h1 className="app-page-title mt-4">Desplazamientos</h1>
        <p className="mt-3 app-subtitle">Opciones de transporte para que invitados y familiares se organicen fácilmente.</p>
      </div>

      {items.length === 0 ? (
        <div className="app-surface-soft p-6">
          <p className="text-sm text-[var(--app-muted)]">No hay transportes disponibles todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const solicitud = getSolicitud(item.id);
            return (
              <article key={item.id} className="app-surface-soft p-5 sm:p-6">
                <p className="text-lg font-semibold text-[var(--app-ink)]">{item.nombre}</p>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  {item.origen} → {item.destino}
                </p>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Hora: {item.hora}</p>
                <p className="text-sm text-[var(--app-muted)]">Capacidad: {item.capacidad}</p>
                {item.notas ? <p className="mt-2 text-sm text-[var(--app-muted)]">{item.notas}</p> : null}

                {effectiveGuest ? (
                  <div className="mt-4 space-y-3">
                    {DEV_OPEN_PUBLIC_WEDDING && !invitado ? (
                      <p className="text-sm text-[var(--app-muted)]">
                        Modo desarrollo activo: módulo abierto sin identificación de invitado.
                      </p>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="number"
                        min={1}
                        max={item.capacidad || 10}
                        value={seatInputs[item.id] || solicitud?.seats || 1}
                        onChange={(e) =>
                          setSeatInputs((current) => ({
                            ...current,
                            [item.id]: Math.max(1, Number(e.target.value || 1)),
                          }))
                        }
                        className="w-full p-3"
                        placeholder="Plazas"
                      />
                      <input
                        type="text"
                        value={notesInputs[item.id] ?? solicitud?.notes ?? ""}
                        onChange={(e) =>
                          setNotesInputs((current) => ({
                            ...current,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="w-full p-3"
                        placeholder="Notas"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={() => void guardarSolicitud(item)} className="app-button-primary">
                        {solicitud ? "Actualizar solicitud" : "Solicitar plazas"}
                      </button>
                      {solicitud ? (
                        <button
                          type="button"
                          onClick={() => void cancelarSolicitud(item.id)}
                          className="app-button-secondary"
                        >
                          Cancelar
                        </button>
                      ) : null}
                    </div>

                    {solicitud ? (
                      <p className="text-sm text-[var(--app-muted)]">Solicitud guardada: {solicitud.seats} plaza(s)</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--app-muted)]">
                    Identifícate como invitado para solicitar este desplazamiento.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
