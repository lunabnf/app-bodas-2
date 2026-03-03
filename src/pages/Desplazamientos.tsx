import { useEffect, useState } from "react";
import type { TransportOption, TransportRequest } from "../domain/transport";
import {
  borrarSolicitudTransporte,
  guardarSolicitudTransporte,
  obtenerSolicitudesTransportePorInvitado,
  obtenerTransportes,
} from "../services/transporteService";
import { registrarActividad } from "../services/actividadService";
import { useAuth } from "../store/useAuth";

export default function DesplazamientosPage() {
  const [items, setItems] = useState<TransportOption[]>([]);
  const [solicitudes, setSolicitudes] = useState<TransportRequest[]>([]);
  const [seatInputs, setSeatInputs] = useState<Record<string, number>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const { invitado } = useAuth();

  useEffect(() => {
    void (async () => {
      const options = await obtenerTransportes();
      setItems(options || []);

      if (!invitado) return;
      const guestRequests = await obtenerSolicitudesTransportePorInvitado(invitado.token);
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
  }, [invitado]);

  const getSolicitud = (transportId: string) =>
    solicitudes.find((item) => item.transportId === transportId);

  const guardarSolicitud = async (item: TransportOption) => {
    if (!invitado) return;

    const seats = Math.max(1, seatInputs[item.id] || getSolicitud(item.id)?.seats || 1);
    const currentNotes = notesInputs[item.id];
    const request: TransportRequest = {
      id: `${invitado.token}-${item.id}`,
      guestToken: invitado.token,
      guestName: invitado.nombre,
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
      mensaje: `${invitado.nombre} ha solicitado ${seats} plaza(s) en ${item.nombre}`,
      tokenInvitado: invitado.token,
    });
  };

  const cancelarSolicitud = async (transportId: string) => {
    if (!invitado) return;

    await borrarSolicitudTransporte(invitado.token, transportId);
    setSolicitudes((current) => current.filter((entry) => entry.transportId !== transportId));
    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "transporte_solicitud",
      mensaje: `${invitado.nombre} ha cancelado una solicitud de transporte`,
      tokenInvitado: invitado.token,
    });
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Desplazamientos</h1>

      {items.length === 0 && (
        <p className="opacity-70">No hay transportes disponibles todavía.</p>
      )}

      <div className="space-y-4">
        {items.map((item) => {
          const solicitud = getSolicitud(item.id);
          return (
            <div
              key={item.id}
              className="p-4 bg-white/10 border border-white/20 rounded-lg"
            >
              <p className="text-xl font-semibold">{item.nombre}</p>
              <p className="opacity-80">
                {item.origen} → {item.destino}
              </p>
              <p className="opacity-80">Hora: {item.hora}</p>
              <p className="opacity-80">Capacidad: {item.capacidad}</p>
              {item.notas ? <p className="italic opacity-70 mt-1">{item.notas}</p> : null}

              {invitado ? (
                <div className="mt-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
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
                      className="rounded-md bg-black/30 border border-white/20 p-2"
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
                      className="rounded-md bg-black/30 border border-white/20 p-2"
                      placeholder="Notas"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => void guardarSolicitud(item)}
                      className="bg-blue-600 px-4 py-2 rounded"
                    >
                      {solicitud ? "Actualizar solicitud" : "Solicitar plazas"}
                    </button>
                    {solicitud ? (
                      <button
                        onClick={() => void cancelarSolicitud(item.id)}
                        className="bg-white/10 border border-white/20 px-4 py-2 rounded"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>

                  {solicitud ? (
                    <p className="opacity-80 text-sm">
                      Solicitud guardada: {solicitud.seats} plaza(s)
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm opacity-70">
                  Identifícate como invitado para solicitar este desplazamiento.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
