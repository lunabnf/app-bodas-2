import { getWeddingSettings } from "../services/weddingSettingsService";
import { getVisibleWeddingProgram, getWeddingProgramDocument } from "../services/programaService";
import type { WeddingProgramCategory, WeddingProgramItem } from "../domain/program";

const categoryBadge: Record<WeddingProgramCategory, { label: string; accent: string }> = {
  general: { label: "Momento", accent: "bg-stone-100 text-stone-700" },
  recepcion: { label: "Recepción", accent: "bg-amber-100 text-amber-800" },
  ceremonia: { label: "Ceremonia", accent: "bg-rose-100 text-rose-800" },
  cocktail: { label: "Cóctel", accent: "bg-orange-100 text-orange-800" },
  banquete: { label: "Banquete", accent: "bg-emerald-100 text-emerald-800" },
  baile: { label: "Baile", accent: "bg-sky-100 text-sky-800" },
  fiesta: { label: "Fiesta", accent: "bg-fuchsia-100 text-fuchsia-800" },
  traslado: { label: "Traslado", accent: "bg-indigo-100 text-indigo-800" },
};

function ProgramCard({ item, isLast }: { item: WeddingProgramItem; isLast: boolean }) {
  const badge = categoryBadge[item.categoria];

  return (
    <article className="relative pl-8 sm:pl-12">
      <div className="absolute left-[0.35rem] top-0 h-full w-px bg-[rgba(195,184,162,0.6)] sm:left-[0.75rem]" />
      <div className="absolute left-0 top-6 h-3 w-3 rounded-full border border-white bg-[var(--app-ink)] shadow-[0_0_0_6px_rgba(255,255,255,0.9)] sm:left-[0.4rem]" />

      <div className={`app-surface-soft relative ${isLast ? "" : ""} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--app-ink)]">
              {item.hora || "--:--"}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--app-ink)]">
              {item.titulo}
            </h2>
            {item.subtitulo ? (
              <p className="mt-2 text-sm font-medium text-[var(--app-muted)]">{item.subtitulo}</p>
            ) : null}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${badge.accent}`}>
            {badge.label}
          </span>
        </div>

        {item.descripcion ? (
          <p className="mt-4 text-sm leading-7 text-[var(--app-muted)]">{item.descripcion}</p>
        ) : null}

        {item.ubicacion ? (
          <div className="mt-4 inline-flex rounded-full border border-[var(--app-line)] bg-white/70 px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
            {item.ubicacion}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Programa() {
  const settings = getWeddingSettings();
  const document = getWeddingProgramDocument();
  const eventos = getVisibleWeddingProgram();

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface overflow-hidden p-6 sm:p-8">
        <p className="app-kicker">Programa</p>
        <h1 className="app-page-title mt-4">{document.config.tituloSeccion}</h1>
        <p className="mt-3 app-subtitle">
          {document.config.subtituloSeccion}
        </p>
      </div>

      {!settings.mostrarPrograma ? (
        <div className="app-surface-soft p-6">
          <p className="text-sm text-[var(--app-muted)]">
            El programa aún no está publicado para invitados.
          </p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="app-surface-soft p-6">
          <p className="text-sm text-[var(--app-muted)]">No hay eventos visibles configurados aún.</p>
        </div>
      ) : (
        <div className="app-surface p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.66)] px-4 py-4 sm:px-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Timeline del día</p>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                {eventos.length} momento(s) visibles para invitados
              </p>
            </div>
            <div className="rounded-full border border-[var(--app-line)] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Ordenado por admin
            </div>
          </div>

          <div className="space-y-4">
            {eventos.map((item, index) => (
              <ProgramCard key={item.id} item={item} isLast={index === eventos.length - 1} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
