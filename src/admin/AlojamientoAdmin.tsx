import { useEffect, useMemo, useState } from "react";
import type { LodgingOption, LodgingRequest } from "../domain/lodging";
import {
  createEmptyLodgingDraft,
  createLodgingDraftFromUrl,
  createLodgingOption,
  loadAdminCatalogData,
  removeLodgingOption,
} from "../application/adminCatalogService";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const typeLabels: Record<LodgingOption["tipo"], string> = {
  hotel: "Hotel",
  hostal: "Hostal",
  apartamento: "Apartamento",
  casa_rural: "Casa rural",
  otro: "Otro",
};

function normalizeNumber(value: string): number | undefined {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function applyOptionalNumber<K extends "distanciaKm" | "precioDesde">(
  current: LodgingOption,
  key: K,
  value: string
): LodgingOption {
  const parsed = normalizeNumber(value);
  if (parsed === undefined) {
    const { [key]: _removed, ...rest } = current;
    return rest as LodgingOption;
  }
  return {
    ...current,
    [key]: parsed,
  };
}

export default function AlojamientoAdmin() {
  const [alojamientos, setAlojamientos] = useState<LodgingOption[]>([]);
  const [solicitudes, setSolicitudes] = useState<LodgingRequest[]>([]);
  const [draft, setDraft] = useState<LodgingOption>(createEmptyLodgingDraft());
  const [sourceUrl, setSourceUrl] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"todos" | LodgingOption["tipo"]>("todos");
  const [onlyDemand, setOnlyDemand] = useState(false);

  useEffect(() => {
    void (async () => {
      const data = await loadAdminCatalogData();
      setAlojamientos(data.alojamientos);
      setSolicitudes(data.solicitudesAlojamiento);
    })();
  }, []);

  const demandByAccommodation = useMemo(() => {
    return alojamientos.map((item) => {
      const interests = solicitudes.filter(
        (request) => request.interested && (request.accommodationId ?? request.lodgingId) === item.id
      );
      const estimatedPersons = interests.reduce((sum, entry) => sum + (entry.persons ?? 1), 0);

      return {
        lodging: item,
        interests,
        groups: interests.length,
        estimatedPersons,
      };
    }).sort((a, b) => b.estimatedPersons - a.estimatedPersons || b.groups - a.groups);
  }, [alojamientos, solicitudes]);

  const totalDemandGroups = useMemo(
    () => solicitudes.filter((item) => item.interested).length,
    [solicitudes]
  );

  const totalDemandPersons = useMemo(
    () => solicitudes.filter((item) => item.interested).reduce((sum, item) => sum + (item.persons ?? 1), 0),
    [solicitudes]
  );

  const filteredDemand = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return demandByAccommodation.filter(({ lodging, groups }) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        lodging.nombre.toLowerCase().includes(normalizedQuery) ||
        lodging.municipio.toLowerCase().includes(normalizedQuery);
      if (!matchesQuery) return false;
      if (filterType !== "todos" && lodging.tipo !== filterType) return false;
      if (onlyDemand && groups === 0) return false;
      return true;
    });
  }, [demandByAccommodation, filterType, onlyDemand, query]);

  const topDemand = filteredDemand.slice(0, 3);

  async function handleSave() {
    const lodging = await createLodgingOption(alojamientos, draft);
    if (!lodging) {
      setNotice({ type: "error", text: "Indica al menos el nombre del alojamiento." });
      return;
    }

    const next = [...alojamientos.filter((item) => item.id !== lodging.id), lodging];
    setAlojamientos(next);
    setDraft(createEmptyLodgingDraft());
    setSourceUrl("");
    setNotice({ type: "success", text: "Alojamiento guardado correctamente." });
  }

  async function handleDelete(id: string) {
    await removeLodgingOption(alojamientos, id);
    setAlojamientos((current) => current.filter((item) => item.id !== id));
    setNotice({ type: "success", text: "Alojamiento eliminado." });
  }

  function handleUrlDraft() {
    if (!sourceUrl.trim()) {
      setNotice({ type: "error", text: "Pega primero una URL para generar un borrador." });
      return;
    }

    setDraft((current) => ({
      ...current,
      ...createLodgingDraftFromUrl(sourceUrl),
    }));
    setNotice({ type: "success", text: "Borrador autocompletado desde enlace. Revisa y completa los campos." });
  }

  return (
    <section className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Alojamientos</p>
        <h1 className="app-page-title mt-4">Catálogo recomendado para invitados</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Crea alojamientos recomendados y sigue el interés real de invitados para negociar bloqueos o precios de grupo.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Alojamientos</p>
            <p className="mt-2 text-2xl font-semibold">{alojamientos.length}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Grupos interesados</p>
            <p className="mt-2 text-2xl font-semibold">{totalDemandGroups}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Personas potenciales</p>
            <p className="mt-2 text-2xl font-semibold">{totalDemandPersons}</p>
          </article>
        </div>
      </div>

      {notice ? (
        <div className={`app-panel p-4 text-sm ${notice.type === "error" ? "border-red-300/60 text-red-700" : "border-emerald-300/60 text-emerald-700"}`}>
          {notice.text}
        </div>
      ) : null}

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="app-section-heading">Crear desde enlace</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Pega una URL para generar un borrador editable. Si faltan datos, los completáis manualmente.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
            placeholder="https://hotel-ejemplo.com/ficha"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
          />
          <button type="button" onClick={handleUrlDraft} className="app-button-secondary">
            Generar borrador
          </button>
        </div>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="app-section-heading">Editor de alojamiento</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Catálogo visible para invitados. Un mismo alojamiento sirve como fuente única para catálogo e intereses.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <input className="w-full p-3" placeholder="Nombre" value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} />
          <select className="w-full p-3" value={draft.tipo} onChange={(e) => setDraft({ ...draft, tipo: e.target.value as LodgingOption["tipo"] })}>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <textarea className="w-full p-3 lg:col-span-2" rows={3} placeholder="Descripción" value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })} />
          <input className="w-full p-3" placeholder="Dirección" value={draft.direccion} onChange={(e) => setDraft({ ...draft, direccion: e.target.value })} />
          <input className="w-full p-3" placeholder="Municipio" value={draft.municipio} onChange={(e) => setDraft({ ...draft, municipio: e.target.value })} />
          <input className="w-full p-3" placeholder="Distancia a la boda (km)" value={draft.distanciaKm ?? ""} onChange={(e) => setDraft((current) => applyOptionalNumber(current, "distanciaKm", e.target.value))} />
          <input className="w-full p-3" placeholder="Precio orientativo desde" value={draft.precioDesde ?? ""} onChange={(e) => setDraft((current) => applyOptionalNumber(current, "precioDesde", e.target.value))} />
          <input className="w-full p-3" placeholder="Teléfono" value={draft.telefono} onChange={(e) => setDraft({ ...draft, telefono: e.target.value })} />
          <input className="w-full p-3" placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          <input className="w-full p-3" placeholder="Web" value={draft.webUrl} onChange={(e) => setDraft({ ...draft, webUrl: e.target.value })} />
          <input className="w-full p-3" placeholder="Enlace de reserva" value={draft.bookingUrl} onChange={(e) => setDraft({ ...draft, bookingUrl: e.target.value })} />
          <input className="w-full p-3 lg:col-span-2" placeholder="URLs de imagen separadas por comas" value={draft.images.join(", ")} onChange={(e) => setDraft({ ...draft, images: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
          <textarea className="w-full p-3" rows={3} placeholder="Notas para invitados" value={draft.notas ?? ""} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} />
          <textarea className="w-full p-3" rows={3} placeholder="Notas privadas para novios" value={draft.notasPrivadas ?? ""} onChange={(e) => setDraft({ ...draft, notasPrivadas: e.target.value })} />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} />
            Visible para invitados
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.destacado} onChange={(e) => setDraft({ ...draft, destacado: e.target.checked })} />
            Destacado
          </label>
        </div>

        <button className="app-button-primary" onClick={() => void handleSave()}>
          Guardar alojamiento
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
          <p className="app-kicker">Demanda</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Ranking de interés</h2>
          </div>
          <input
            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
            placeholder="Buscar por nombre o municipio"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
            value={filterType}
            onChange={(event) => setFilterType(event.target.value as "todos" | LodgingOption["tipo"])}
          >
            <option value="todos">Todos los tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm">
            <input type="checkbox" checked={onlyDemand} onChange={(event) => setOnlyDemand(event.target.checked)} />
            Solo con demanda
          </label>
        </div>

        {topDemand.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {topDemand.map(({ lodging, groups, estimatedPersons }, index) => (
              <article key={`top-${lodging.id}`} className="app-surface p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  Top {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{lodging.nombre}</h3>
                <p className="mt-1 text-sm text-[var(--app-muted)]">{typeLabels[lodging.tipo]}</p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{estimatedPersons}</p>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  personas potenciales · {groups} grupo(s)
                </p>
              </article>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Promedio por alojamiento</p>
            <p className="mt-2 text-2xl font-semibold">
              {filteredDemand.length > 0 ? (filteredDemand.reduce((sum, item) => sum + item.estimatedPersons, 0) / filteredDemand.length).toFixed(1) : "0.0"}
            </p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Alojamientos con interés</p>
            <p className="mt-2 text-2xl font-semibold">
              {filteredDemand.filter((item) => item.groups > 0).length}
            </p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Comentarios recibidos</p>
            <p className="mt-2 text-2xl font-semibold">
              {filteredDemand.reduce(
                (sum, item) => sum + item.interests.filter((entry) => Boolean(entry.comment || entry.notes)).length,
                0
              )}
            </p>
          </article>
        </div>

        {filteredDemand.map(({ lodging, interests, groups, estimatedPersons }) => (
          <article key={lodging.id} className="app-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{lodging.nombre}</h3>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  {typeLabels[lodging.tipo]} · {lodging.municipio || lodging.direccion || "Sin ubicación"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  {typeof lodging.precioDesde === "number" ? (
                    <span className="rounded-full border border-[var(--app-line)] px-3 py-2">
                      Desde {lodging.precioDesde} EUR
                    </span>
                  ) : null}
                  {typeof lodging.distanciaKm === "number" ? (
                    <span className="rounded-full border border-[var(--app-line)] px-3 py-2">
                      {lodging.distanciaKm} km
                    </span>
                  ) : null}
                  {lodging.destacado ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                      Destacado
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="text-right text-sm text-[var(--app-muted)]">
                <p><strong className="text-[var(--app-ink)]">{groups}</strong> grupo(s)</p>
                <p><strong className="text-[var(--app-ink)]">{estimatedPersons}</strong> persona(s) potenciales</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem_auto]">
              <div className="space-y-2">
                {interests.length === 0 ? (
                  <p className="text-sm text-[var(--app-muted)]">Todavía no hay invitados interesados.</p>
                ) : (
                  interests.map((entry) => (
                    <div key={entry.id} className="rounded-[16px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.62)] px-4 py-3">
                      <p className="font-semibold">{entry.guestName}</p>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        {entry.persons ?? 1} persona(s)
                      </p>
                      {entry.comment || entry.notes ? (
                        <p className="mt-1 text-sm text-[var(--app-muted)]">{entry.comment ?? entry.notes}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.58)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Lectura rápida</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--app-muted)]">
                  <li>Grupos interesados: <strong className="text-[var(--app-ink)]">{groups}</strong></li>
                  <li>Personas estimadas: <strong className="text-[var(--app-ink)]">{estimatedPersons}</strong></li>
                  <li>Comentarios: <strong className="text-[var(--app-ink)]">{interests.filter((entry) => Boolean(entry.comment || entry.notes)).length}</strong></li>
                  <li>Estado sugerido: <strong className="text-[var(--app-ink)]">{estimatedPersons >= 8 ? "Negociar precio grupo" : estimatedPersons >= 4 ? "Monitorizar demanda" : "Demanda inicial"}</strong></li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="app-button-secondary" onClick={() => setDraft(lodging)}>
                  Editar
                </button>
                <button type="button" className="app-button-secondary" onClick={() => void handleDelete(lodging.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
