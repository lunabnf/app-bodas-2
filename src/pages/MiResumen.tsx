import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import type { GuestSummaryData, SummaryTone } from "../application/guestSummaryService";
import { getGuestSummary } from "../application/guestSummaryService";
import { buildEventSitePaths } from "../eventSite/paths";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../services/devAccessService";
import { useAuth } from "../store/useAuth";

function toneClasses(tone: SummaryTone) {
  if (tone === "success") return "bg-emerald-100 text-emerald-800";
  if (tone === "warning") return "bg-amber-100 text-amber-800";
  return "bg-slate-200 text-slate-700";
}

function formatDateTime(timestamp?: number) {
  if (!timestamp) return "Sin cambios recientes";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function SurfaceMessage({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Mi resumen</p>
        <h1 className="app-page-title mt-4">{title}</h1>
        <p className="mt-3 app-subtitle">{body}</p>
        {actionLabel && actionHref ? (
          <div className="mt-6">
            <Link to={actionHref} className="app-button-primary">
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="app-surface-soft p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function SectionCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="app-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="app-section-heading">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[var(--app-muted)]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <article className="app-surface-soft p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">{label}</p>
      <div className="mt-2 text-sm text-[var(--app-muted)]">{children}</div>
    </article>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-4 text-sm text-[var(--app-muted)]">
      {text}
    </div>
  );
}

function SongList({
  songs,
  emptyText,
}: {
  songs: GuestSummaryData["music"]["proposals"];
  emptyText: string;
}) {
  if (songs.length === 0) {
    return <p className="text-sm text-[var(--app-muted)]">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {songs.map((song) => (
        <div key={song.id} className="text-sm text-[var(--app-muted)]">
          <p className="font-medium text-[var(--app-ink)]">{song.title}</p>
          <p>{song.artist}</p>
        </div>
      ))}
    </div>
  );
}

export default function MiResumen() {
  const { slug } = useParams();
  const paths = buildEventSitePaths(slug);
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);
  const [summary, setSummary] = useState<GuestSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!effectiveGuest) {
        if (!cancelled) {
          setSummary(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
      }

      const nextSummary = await getGuestSummary(effectiveGuest, slug ?? "demo");
      if (!cancelled) {
        setSummary(nextSummary);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [effectiveGuest, slug]);

  if (loading) {
    return <SurfaceMessage title="Cargando tu estado en la boda" body="Estamos reuniendo tu información del evento." />;
  }

  if (!effectiveGuest || !summary) {
    return (
      <SurfaceMessage
        title="Tu panel personal"
        body={
          DEV_OPEN_PUBLIC_WEDDING
            ? "No encontramos una sesión real para este invitado. En modo desarrollo puedes seguir usando el acceso simulado."
            : "Necesitamos identificarte para mostrar tu estado, tus solicitudes y tu participación dentro de la boda."
        }
        actionLabel="Ir a identificarme"
        actionHref={paths.participaConfirmacion}
      />
    );
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Mi resumen</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="app-page-title">{summary.guest.nombre}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses(summary.statusTone)}`}>
                {summary.statusLabel}
              </span>
              {summary.roleLabel ? (
                <span className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                  {summary.roleLabel}
                </span>
              ) : null}
              <span className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                Última actualización {formatDateTime(summary.lastUpdatedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={paths.participaConfirmacion} className="app-button-secondary">
              Revisar asistencia
            </Link>
            <Link to={paths.participaMusica} className="app-button-secondary">
              Revisar música
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <SectionCard
            title="Asistencia"
            subtitle="Estado real de tu RSVP y del grupo asociado a tu invitación."
            actions={
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses(summary.statusTone)}`}>
                {summary.statusLabel}
              </span>
            }
          >
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Grupo" value={summary.attendance.groupSize} />
              <article className="app-surface-soft p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Personas registradas</p>
                <p className="mt-2 text-sm leading-7 text-[var(--app-ink)]">
                  {summary.attendance.attendees.join(", ")}
                </p>
              </article>
            </div>

            <div className="mt-4 space-y-2">
              {summary.attendance.details.map((detail) => (
                <div
                  key={detail}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm text-[var(--app-muted)]"
                >
                  {detail}
                </div>
              ))}
              {summary.attendance.note ? (
                <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm text-[var(--app-muted)]">
                  Nota: {summary.attendance.note}
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title="Logística"
            subtitle="Transporte, alojamiento, mesa y ceremonia a partir de tus datos ya guardados."
            actions={
              <div className="flex flex-wrap gap-2">
                <Link to={paths.desplazamientos} className="app-button-secondary">
                  Transporte
                </Link>
                <Link to={paths.alojamientos} className="app-button-secondary">
                  Alojamientos
                </Link>
              </div>
            }
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <DetailBlock label="Transporte">
                {summary.logistics.transportRequest ? (
                  <div className="space-y-2">
                    <p className="font-medium text-[var(--app-ink)]">
                      {summary.logistics.transportRequest.hasCarOffer ? "Ofreces plazas" : "Solicitud registrada"}
                    </p>
                    <p>
                      {summary.logistics.transportRequest.direction} · {summary.logistics.transportRequest.peopleCount} persona(s)
                    </p>
                    {summary.logistics.transportRequest.origin ? (
                      <p>Salida desde {summary.logistics.transportRequest.origin}</p>
                    ) : null}
                    {summary.logistics.assignedTrip ? (
                      <p>
                        Asignado a {summary.logistics.assignedTrip.titulo} · {summary.logistics.assignedTrip.horaSalida || "Hora pendiente"}
                      </p>
                    ) : null}
                    {summary.logistics.transportRequest.comments ? (
                      <p>Comentario: {summary.logistics.transportRequest.comments}</p>
                    ) : null}
                  </div>
                ) : (
                  <p>Aún no hay transporte registrado.</p>
                )}
              </DetailBlock>

              <DetailBlock label="Alojamiento">
                {summary.logistics.lodgingInterests.length > 0 ? (
                  <div className="space-y-3">
                    {summary.logistics.lodgingInterests.map((item) => (
                      <div key={item.request.id}>
                        <p className="font-medium text-[var(--app-ink)]">
                          {item.lodging?.nombre ?? "Alojamiento seleccionado"}
                        </p>
                        <p>
                          {item.request.persons ?? 1} persona(s)
                          {item.request.comment ? ` · ${item.request.comment}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No has marcado interés en alojamientos todavía.</p>
                )}
              </DetailBlock>

              <DetailBlock label="Mesa">
                <p className="text-[var(--app-ink)]">{summary.logistics.tableName ?? "Aún no visible o sin asignar"}</p>
              </DetailBlock>

              <DetailBlock label="Ceremonia">
                <p className="text-[var(--app-ink)]">{summary.logistics.ceremonySeatLabel ?? "Sin asiento asignado todavía"}</p>
              </DetailBlock>
            </div>

            {summary.logistics.transportNotices.length > 0 ? (
              <div className="mt-4 space-y-2">
                {summary.logistics.transportNotices.map((notice) => (
                  <div key={notice.id} className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.7)] px-4 py-3">
                    <p className="text-sm font-medium text-[var(--app-ink)]">{notice.titulo}</p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{notice.mensaje}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Música"
            subtitle="Tus propuestas y votos reales dentro del módulo musical."
            actions={
              <Link to={paths.participaMusica} className="app-button-secondary">
                Ir a música
              </Link>
            }
          >
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Tus propuestas" value={`${summary.music.proposalCount} / ${summary.music.proposalLimit}`} />
              <article className="app-surface-soft p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Votos activos</p>
                <p className="mt-2 text-2xl font-semibold">{summary.music.votedSongs.length}</p>
              </article>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Canciones propuestas</p>
                <div className="mt-3">
                  <SongList songs={summary.music.proposals} emptyText="Aún no has propuesto canciones." />
                </div>
              </article>

              <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Canciones votadas</p>
                <div className="mt-3">
                  <SongList songs={summary.music.votedSongs} emptyText="Todavía no has votado canciones." />
                </div>
              </article>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Participación y chat">
            <div className="space-y-3 text-sm text-[var(--app-muted)]">
              <p>
                {summary.chat.hasAccess
                  ? `Tienes acceso a ${summary.chat.roomNames.length} sala(s).`
                  : "No tienes acceso al chat en este momento."}
              </p>
              {summary.chat.roomNames.length > 0 ? <p>Salas: {summary.chat.roomNames.join(", ")}</p> : null}
              <p>Mensajes propios: {summary.chat.ownMessageCount}</p>
            </div>
            {summary.chat.hasAccess ? (
              <div className="mt-4">
                <Link to={paths.participaChat} className="app-button-secondary">
                  Ir al chat
                </Link>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Pendientes">
            <div className="space-y-3">
              {summary.pending.length > 0 ? (
                summary.pending.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="block rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-4 transition hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-[var(--app-ink)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">{item.description}</p>
                  </Link>
                ))
              ) : (
                <EmptyCard text="No tienes pendientes importantes ahora mismo." />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Historial reciente">
            <div className="space-y-3">
              {summary.history.length > 0 ? (
                summary.history.map((item) => (
                  <div key={item.id} className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
                    <p className="text-sm font-medium text-[var(--app-ink)]">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyCard text="Todavía no hay acciones recientes relevantes para mostrar." />
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
