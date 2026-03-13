import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { LodgingOption } from "../domain/lodging";
import { registrarActividad } from "../services/actividadService";
import {
  guardarSolicitudAlojamiento,
  obtenerAlojamientos,
  obtenerSolicitudAlojamientoPorInvitado,
} from "../services/alojamientosService";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../services/devAccessService";
import { useAuth } from "../store/useAuth";

export default function AlojamientosPage() {
  const { slug } = useParams();
  const [alojamientos, setAlojamientos] = useState<LodgingOption[]>([]);
  const [needsLodging, setNeedsLodging] = useState<boolean>(false);
  const [selectedLodgingId, setSelectedLodgingId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);

  useEffect(() => {
    void (async () => {
      const data = await obtenerAlojamientos();
      setAlojamientos(data || []);

      if (!effectiveGuest) return;
      const request = await obtenerSolicitudAlojamientoPorInvitado(effectiveGuest.token);
      if (!request) return;

      setNeedsLodging(request.needsLodging);
      setSelectedLodgingId(request.lodgingId ?? "");
      setNotes(request.notes ?? "");
    })();
  }, [effectiveGuest]);

  async function guardarSolicitud() {
    if (!effectiveGuest) return;

    await guardarSolicitudAlojamiento({
      id: `${effectiveGuest.token}-lodging`,
      guestToken: effectiveGuest.token,
      guestName: effectiveGuest.nombre,
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
      mensaje: `${effectiveGuest.nombre} ha actualizado su solicitud de alojamiento`,
      tokenInvitado: effectiveGuest.token,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Información</p>
        <h1 className="app-page-title mt-4">Alojamiento</h1>
        <p className="mt-3 app-subtitle">Opciones recomendadas para reservar y organizar vuestra estancia.</p>
      </div>

      <div className="space-y-4">
        {alojamientos.length === 0 ? (
          <div className="app-surface-soft p-6">
            <p className="text-sm text-[var(--app-muted)]">No hay alojamientos disponibles todavía.</p>
          </div>
        ) : (
          alojamientos.map((item) => (
            <article key={item.id} className="app-surface-soft p-5 sm:p-6">
              <p className="text-lg font-semibold text-[var(--app-ink)]">{item.nombre}</p>
              {item.direccion ? <p className="mt-1 text-sm text-[var(--app-muted)]">{item.direccion}</p> : null}
              {item.notas ? <p className="mt-2 text-sm text-[var(--app-muted)]">{item.notas}</p> : null}
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    if (effectiveGuest) {
                      void registrarActividad({
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        tipo: "alojamiento_consulta",
                        mensaje: `${effectiveGuest.nombre} ha abierto el alojamiento: ${item.nombre}`,
                        tokenInvitado: effectiveGuest.token,
                      });
                    }
                  }}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--app-ink)] underline"
                >
                  Ver enlace
                </a>
              ) : null}
            </article>
          ))
        )}
      </div>

      {effectiveGuest ? (
        <section className="app-panel space-y-4 p-5 sm:p-6">
          {DEV_OPEN_PUBLIC_WEDDING && !invitado ? (
            <p className="text-sm text-[var(--app-muted)]">
              Modo desarrollo activo: módulo abierto sin identificación de invitado.
            </p>
          ) : null}
          <div>
            <h2 className="app-section-heading">Tu solicitud de alojamiento</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">Los novios verán esta respuesta en su panel.</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-[var(--app-ink)]">
              <input type="radio" checked={needsLodging} onChange={() => setNeedsLodging(true)} />
              Necesito alojamiento
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[var(--app-ink)]">
              <input type="radio" checked={!needsLodging} onChange={() => setNeedsLodging(false)} />
              No necesito alojamiento
            </label>
          </div>

          {needsLodging ? (
            <select className="w-full p-3" value={selectedLodgingId} onChange={(e) => setSelectedLodgingId(e.target.value)}>
              <option value="">Sin preferencia concreta</option>
              {alojamientos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          ) : null}

          <textarea
            className="w-full p-3"
            placeholder="Noches, presupuesto aproximado, tipo de habitación, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void guardarSolicitud()} className="app-button-primary">
              Guardar solicitud
            </button>
            {saved ? <p className="text-sm text-emerald-600">Solicitud guardada.</p> : null}
          </div>
        </section>
      ) : (
        <div className="app-surface-soft p-6">
          <p className="text-sm text-[var(--app-muted)]">Identifícate como invitado para indicar si necesitas alojamiento.</p>
        </div>
      )}
    </section>
  );
}
