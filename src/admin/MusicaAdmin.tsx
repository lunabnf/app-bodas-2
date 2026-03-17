import { useEffect, useMemo, useState } from "react";
import type { Guest } from "../domain/guest";
import type { MusicSongSummary } from "../domain/music";
import { obtenerInvitados } from "../services/invitadosService";
import {
  actualizarVisibilidadCancion,
  borrarCancion,
  obtenerMusicSongSummaries,
} from "../services/musicaService";

type MusicFilter = "mas_votadas" | "mas_recientes" | "ocultas" | "por_invitado";
type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function MusicaAdmin() {
  const [songs, setSongs] = useState<MusicSongSummary[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState<MusicFilter>("mas_votadas");
  const [guestFilter, setGuestFilter] = useState("todos");

  async function loadData() {
    const [nextSongs, nextGuests] = await Promise.all([
      obtenerMusicSongSummaries(true),
      obtenerInvitados(),
    ]);
    setSongs(nextSongs);
    setGuests(nextGuests);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const guestNameMap = useMemo(
    () => new Map(guests.map((guest) => [guest.token, guest.nombre])),
    [guests]
  );

  const uniqueProposers = useMemo(() => {
    return Array.from(
      new Set(songs.map((song) => song.proposerGuestToken))
    ).sort((left, right) => {
      const leftName = guestNameMap.get(left) ?? left;
      const rightName = guestNameMap.get(right) ?? right;
      return leftName.localeCompare(rightName);
    });
  }, [guestNameMap, songs]);

  const visibleCount = useMemo(() => songs.filter((song) => song.visible).length, [songs]);
  const hiddenCount = songs.length - visibleCount;
  const totalVotes = useMemo(
    () => songs.reduce((sum, song) => sum + song.voteCount, 0),
    [songs]
  );

  const filteredSongs = useMemo(() => {
    let next = [...songs];

    if (filter === "mas_recientes") {
      next.sort((a, b) => b.createdAt - a.createdAt || b.voteCount - a.voteCount);
    } else {
      next.sort((a, b) => b.voteCount - a.voteCount || b.createdAt - a.createdAt);
    }

    if (filter === "ocultas") {
      next = next.filter((song) => !song.visible);
    }

    if (filter === "por_invitado" && guestFilter !== "todos") {
      next = next.filter((song) => song.proposerGuestToken === guestFilter);
    }

    return next;
  }, [filter, guestFilter, songs]);

  async function handleToggleVisibility(song: MusicSongSummary) {
    const ok = await actualizarVisibilidadCancion(song.id, !song.visible);
    if (!ok) {
      setNotice({ type: "error", text: "No se pudo actualizar la visibilidad." });
      return;
    }

    setNotice({
      type: "success",
      text: song.visible ? "Canción ocultada para invitados." : "Canción visible de nuevo para invitados.",
    });
    await loadData();
  }

  async function handleDelete(song: MusicSongSummary) {
    const ok = await borrarCancion(song.id);
    if (!ok) {
      setNotice({ type: "error", text: "No se pudo eliminar la propuesta." });
      return;
    }

    setNotice({ type: "success", text: "Propuesta eliminada." });
    await loadData();
  }

  return (
    <section className="space-y-6 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Música</p>
        <h1 className="app-page-title mt-4">Ranking y moderación musical</h1>
        <p className="mt-3 max-w-3xl text-[var(--app-muted)]">
          Los invitados proponen y votan desde su panel. Aquí veis ese mismo dataset ordenado, moderable y listo para compartir luego con el DJ.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Propuestas</p>
            <p className="mt-2 text-2xl font-semibold">{songs.length}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Visibles</p>
            <p className="mt-2 text-2xl font-semibold">{visibleCount}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Ocultas</p>
            <p className="mt-2 text-2xl font-semibold">{hiddenCount}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Votos totales</p>
            <p className="mt-2 text-2xl font-semibold">{totalVotes}</p>
          </article>
        </div>
      </div>

      {notice ? (
        <div
          className={`app-panel p-4 text-sm ${
            notice.type === "error" ? "border-red-300/60 text-red-700" : "border-emerald-300/60 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("mas_votadas")}
            className={`rounded-full px-4 py-2 text-sm ${filter === "mas_votadas" ? "bg-[var(--app-ink)] text-white" : "border border-[var(--app-line)] bg-white/80"}`}
          >
            Más votadas
          </button>
          <button
            type="button"
            onClick={() => setFilter("mas_recientes")}
            className={`rounded-full px-4 py-2 text-sm ${filter === "mas_recientes" ? "bg-[var(--app-ink)] text-white" : "border border-[var(--app-line)] bg-white/80"}`}
          >
            Más recientes
          </button>
          <button
            type="button"
            onClick={() => setFilter("ocultas")}
            className={`rounded-full px-4 py-2 text-sm ${filter === "ocultas" ? "bg-[var(--app-ink)] text-white" : "border border-[var(--app-line)] bg-white/80"}`}
          >
            Ocultas
          </button>
          <button
            type="button"
            onClick={() => setFilter("por_invitado")}
            className={`rounded-full px-4 py-2 text-sm ${filter === "por_invitado" ? "bg-[var(--app-ink)] text-white" : "border border-[var(--app-line)] bg-white/80"}`}
          >
            Por invitado
          </button>
        </div>

        {filter === "por_invitado" ? (
          <select
            value={guestFilter}
            onChange={(event) => setGuestFilter(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2 md:max-w-md"
          >
            <option value="todos">Todos los invitados</option>
            {uniqueProposers.map((token) => (
              <option key={token} value={token}>
                {guestNameMap.get(token) ?? token}
              </option>
            ))}
          </select>
        ) : null}
      </section>

      <section className="space-y-4">
        {filteredSongs.length === 0 ? (
          <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
            No hay propuestas en este filtro todavía.
          </div>
        ) : (
          filteredSongs.map((song, index) => {
            const proposerName = guestNameMap.get(song.proposerGuestToken) ?? song.proposerGuestToken;

            return (
              <article key={song.id} className="app-panel p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] text-lg font-semibold">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold">{song.title}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            song.visible
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {song.visible ? "Visible" : "Oculta"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">{song.artist}</p>
                      <p className="mt-2 text-sm text-[var(--app-muted)]">
                        Propuesta por <strong className="text-[var(--app-ink)]">{proposerName}</strong>
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                        {song.voteCount} votos · creada {formatDate(song.createdAt)}
                      </p>
                      {song.url ? (
                        <a
                          href={song.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-sm text-[var(--app-ink)] underline underline-offset-4"
                        >
                          Abrir enlace
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleToggleVisibility(song)}
                      className="rounded-full border border-[var(--app-line)] px-4 py-2 text-sm"
                    >
                      {song.visible ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(song)}
                      className="rounded-full border border-red-300/70 px-4 py-2 text-sm text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}
