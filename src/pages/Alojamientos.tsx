import { useEffect, useState } from "react";
import type { LodgingOption } from "../domain/lodging";
import {
  guardarSolicitudAlojamiento,
  obtenerAlojamientos,
  obtenerSolicitudAlojamientoPorInvitado,
} from "../services/alojamientosService";
import { registrarActividad } from "../services/actividadService";
import { useAuth } from "../store/useAuth";

export default function AlojamientosPage() {
  const [alojamientos, setAlojamientos] = useState<LodgingOption[]>([]);
  const [needsLodging, setNeedsLodging] = useState<boolean>(false);
  const [selectedLodgingId, setSelectedLodgingId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { invitado } = useAuth();

  useEffect(() => {
    void (async () => {
      const data = await obtenerAlojamientos();
      setAlojamientos(data || []);

      if (!invitado) return;
      const request = await obtenerSolicitudAlojamientoPorInvitado(invitado.token);
      if (!request) return;

      setNeedsLodging(request.needsLodging);
      setSelectedLodgingId(request.lodgingId ?? "");
      setNotes(request.notes ?? "");
    })();
  }, [invitado]);

  const guardarSolicitud = async () => {
    if (!invitado) return;

    await guardarSolicitudAlojamiento({
      id: `${invitado.token}-lodging`,
      guestToken: invitado.token,
      guestName: invitado.nombre,
      lodgingId: needsLodging ? selectedLodgingId || null : null,
      needsLodging,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "alojamiento_solicitud",
      mensaje: `${invitado.nombre} ha actualizado su solicitud de alojamiento`,
      tokenInvitado: invitado.token,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Alojamiento</h1>

      {alojamientos.length === 0 && (
        <p className="opacity-70">No hay alojamientos disponibles todavía.</p>
      )}

      <div className="space-y-4">
        {alojamientos.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white/10 border border-white/20 rounded-lg"
          >
            <p className="text-xl font-semibold">{item.nombre}</p>
            {item.direccion ? <p className="opacity-80">{item.direccion}</p> : null}
            {item.notas ? <p className="mt-1 opacity-70">{item.notas}</p> : null}
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (invitado) {
                    void registrarActividad({
                      id: crypto.randomUUID(),
                      timestamp: Date.now(),
                      tipo: "alojamiento_consulta",
                      mensaje: `${invitado.nombre} ha abierto el alojamiento: ${item.nombre}`,
                      tokenInvitado: invitado.token,
                    });
                  }
                }}
                className="text-blue-300 underline block mt-2"
              >
                Ver enlace
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {invitado ? (
        <section className="rounded-lg border border-white/20 bg-white/10 p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Tu solicitud de alojamiento</h2>
            <p className="opacity-70 text-sm">
              Los novios verán esta respuesta en el panel de administración.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={needsLodging}
                onChange={() => setNeedsLodging(true)}
              />
              Necesito alojamiento
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!needsLodging}
                onChange={() => setNeedsLodging(false)}
              />
              No necesito alojamiento
            </label>
          </div>

          {needsLodging ? (
            <select
              className="w-full rounded-md bg-black/30 border border-white/20 p-2"
              value={selectedLodgingId}
              onChange={(e) => setSelectedLodgingId(e.target.value)}
            >
              <option value="">Sin preferencia concreta</option>
              {alojamientos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          ) : null}

          <textarea
            className="w-full rounded-md bg-black/30 border border-white/20 p-2"
            placeholder="Noches, presupuesto aproximado, tipo de habitación, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {saved ? <p className="text-sm text-green-300">Solicitud guardada.</p> : null}

          <button
            type="button"
            onClick={() => void guardarSolicitud()}
            className="bg-pink-400 text-black px-4 py-2 rounded"
          >
            Guardar solicitud
          </button>
        </section>
      ) : (
        <p className="text-sm opacity-70">
          Identifícate como invitado para indicar si necesitas alojamiento.
        </p>
      )}
    </div>
  );
}
