import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { LodgingOption, LodgingRequest } from "../domain/lodging";
import { registrarActividad } from "../services/actividadService";
import {
  borrarInteresAlojamiento,
  guardarSolicitudAlojamiento,
  obtenerAlojamientos,
  obtenerInteresesAlojamientoPorInvitado,
} from "../services/alojamientosService";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../services/devAccessService";
import { useAuth } from "../store/useAuth";

const typeLabels: Record<LodgingOption["tipo"], string> = {
  hotel: "Hotel",
  hostal: "Hostal",
  apartamento: "Apartamento",
  casa_rural: "Casa rural",
  otro: "Otro",
};

export default function AlojamientosPage() {
  const { slug } = useParams();
  const [alojamientos, setAlojamientos] = useState<LodgingOption[]>([]);
  const [interests, setInterests] = useState<LodgingRequest[]>([]);
  const [personsById, setPersonsById] = useState<Record<string, string>>({});
  const [commentById, setCommentById] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string>("");
  const [filterType, setFilterType] = useState<"todos" | LodgingOption["tipo"]>("todos");
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);

  useEffect(() => {
    void (async () => {
      const data = await obtenerAlojamientos();
      setAlojamientos((data || []).filter((item) => item.visible));

      if (!effectiveGuest) return;
      const existingInterests = await obtenerInteresesAlojamientoPorInvitado(effectiveGuest.token);
      setInterests(existingInterests);
      setPersonsById(
        Object.fromEntries(existingInterests.map((item) => [item.accommodationId ?? "", String(item.persons ?? 1)]))
      );
      setCommentById(
        Object.fromEntries(existingInterests.map((item) => [item.accommodationId ?? "", item.comment ?? item.notes ?? ""]))
      );
    })();
  }, [effectiveGuest]);

  function isInterested(accommodationId: string) {
    return interests.some((entry) => (entry.accommodationId ?? entry.lodgingId) === accommodationId && entry.interested);
  }

  const visibleCatalog = useMemo(() => {
    const filtered = filterType === "todos"
      ? alojamientos
      : alojamientos.filter((item) => item.tipo === filterType);

    return [...filtered].sort((a, b) => {
      if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [alojamientos, filterType]);

  async function handleToggleInterest(item: LodgingOption) {
    if (!effectiveGuest) return;

    const existing = interests.find((entry) => (entry.accommodationId ?? entry.lodgingId) === item.id);
    if (existing?.interested) {
      await borrarInteresAlojamiento(existing.id);
      setInterests((current) => current.filter((entry) => entry.id !== existing.id));
      return;
    }

    const persons = Number(personsById[item.id] || "1");
    const comment = commentById[item.id]?.trim() || "";
    const nextInterest: LodgingRequest = {
      id: `${effectiveGuest.token}:${item.id}`,
      guestToken: effectiveGuest.token,
      guestName: effectiveGuest.nombre,
      accommodationId: item.id,
      lodgingId: item.id,
      interested: true,
      needsLodging: true,
      ...(Number.isFinite(persons) && persons > 0 ? { persons } : {}),
      ...(comment ? { comment, notes: comment } : {}),
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    await guardarSolicitudAlojamiento(nextInterest);
    setInterests((current) => [...current.filter((entry) => entry.id !== nextInterest.id), nextInterest]);

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "alojamiento_interes",
      mensaje: `${effectiveGuest.nombre} ha marcado interés en ${item.nombre}`,
      tokenInvitado: effectiveGuest.token,
    });

    setSavedId(item.id);
    setTimeout(() => setSavedId(""), 2000);
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Información</p>
        <h1 className="app-page-title mt-4">Alojamientos recomendados</h1>
        <p className="mt-3 app-subtitle">
          Selección preparada por los novios para invitados que vienen de fuera. Marca tus opciones favoritas para ayudar a coordinar precios y disponibilidad.
        </p>
      </div>

      {alojamientos.length === 0 ? (
        <div className="app-surface-soft p-6">
          <p className="text-sm text-[var(--app-muted)]">No hay alojamientos visibles todavía.</p>
        </div>
      ) : (
        <>
          <div className="app-surface-soft flex flex-wrap items-center gap-3 p-4">
            <p className="text-sm text-[var(--app-muted)]">Filtrar por tipo:</p>
            <button type="button" onClick={() => setFilterType("todos")} className={`rounded-full px-4 py-2 text-sm ${filterType === "todos" ? "bg-[var(--app-ink)] text-white" : "border border-[var(--app-line)] bg-white/80"}`}>
              Todos
            </button>
            {Object.entries(typeLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterType(value as LodgingOption["tipo"])}
                className={`rounded-full px-4 py-2 text-sm ${filterType === value ? "bg-[var(--app-ink)] text-white" : "border border-[var(--app-line)] bg-white/80"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
          {visibleCatalog.map((item) => {
            const interested = isInterested(item.id);
            const image = item.images[0];

            return (
              <article key={item.id} className="app-surface-soft overflow-hidden">
                {image ? (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={image} alt={item.nombre} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,rgba(230,226,217,0.95),rgba(248,247,243,0.95))] text-sm uppercase tracking-[0.16em] text-[var(--app-muted)]">
                    {typeLabels[item.tipo]}
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--app-ink)]">{item.nombre}</h2>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        {typeLabels[item.tipo]} · {item.municipio || item.direccion || "Ubicación pendiente"}
                      </p>
                    </div>
                    {item.destacado ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                        Destacado
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                    {typeof item.distanciaKm === "number" ? (
                      <span className="rounded-full border border-[var(--app-line)] px-3 py-2">{item.distanciaKm} km</span>
                    ) : null}
                    {typeof item.precioDesde === "number" ? (
                      <span className="rounded-full border border-[var(--app-line)] px-3 py-2">Desde {item.precioDesde} EUR</span>
                    ) : null}
                  </div>

                  {item.descripcion ? (
                    <p className="mt-4 text-sm leading-7 text-[var(--app-muted)]">{item.descripcion}</p>
                  ) : null}

                  <div className="mt-4 space-y-2 text-sm text-[var(--app-muted)]">
                    {item.direccion ? <p>{item.direccion}</p> : null}
                    {item.telefono ? <p>{item.telefono}</p> : null}
                    {item.email ? <p>{item.email}</p> : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {item.bookingUrl ? (
                      <a href={item.bookingUrl} target="_blank" rel="noreferrer" className="app-button-secondary">
                        Más información / reserva
                      </a>
                    ) : item.webUrl ? (
                      <a href={item.webUrl} target="_blank" rel="noreferrer" className="app-button-secondary">
                        Visitar web
                      </a>
                    ) : null}
                  </div>

                  {effectiveGuest ? (
                    <div className="mt-5 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.74)] p-4">
                      {DEV_OPEN_PUBLIC_WEDDING && !invitado ? (
                        <p className="mb-3 text-sm text-[var(--app-muted)]">
                          Modo desarrollo activo: simulando invitado para probar el interés.
                        </p>
                      ) : null}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          className="w-full p-3"
                          type="number"
                          min="1"
                          placeholder="Personas"
                          value={personsById[item.id] ?? ""}
                          onChange={(event) =>
                            setPersonsById((current) => ({ ...current, [item.id]: event.target.value }))
                          }
                        />
                        <textarea
                          className="w-full p-3 sm:col-span-2"
                          rows={3}
                          placeholder="Comentario opcional"
                          value={commentById[item.id] ?? ""}
                          onChange={(event) =>
                            setCommentById((current) => ({ ...current, [item.id]: event.target.value }))
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => void handleToggleInterest(item)} className="app-button-primary">
                          {interested ? "Quitar interés" : "Me interesa"}
                        </button>
                        {savedId === item.id ? (
                          <p className="text-sm text-emerald-600">Interés guardado.</p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.74)] p-4 text-sm text-[var(--app-muted)]">
                      Identifícate como invitado para marcar si este alojamiento te interesa.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          </div>
        </>
      )}
    </section>
  );
}
