import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { MusicSongSummary, SongVote } from "../domain/music";
import { registrarActividad } from "../services/actividadService";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../services/devAccessService";
import { obtenerInvitadoPorTokenSync } from "../services/invitadosService";
import {
  findExactSongDuplicate,
  guardarSongProposal,
  obtenerMusicSongSummaries,
  obtenerSongVotes,
  toggleSongVote,
} from "../services/musicaService";
import { useAuth } from "../store/useAuth";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function formatRelativeDate(timestamp: number) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function Musica() {
  const { slug } = useParams();
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);
  const storedGuest = useMemo(
    () => (effectiveGuest ? obtenerInvitadoPorTokenSync(effectiveGuest.token) : null),
    [effectiveGuest]
  );
  const isDevGuest = Boolean(
    DEV_OPEN_PUBLIC_WEDDING &&
      effectiveGuest &&
      !storedGuest &&
      effectiveGuest.token.startsWith("dev-open-")
  );
  const canParticipate = Boolean(
    isDevGuest ||
      (storedGuest &&
        storedGuest.tipo === "Adulto" &&
        storedGuest.estado === "confirmado" &&
        storedGuest.accessState === "activado")
  );

  const [songs, setSongs] = useState<MusicSongSummary[]>([]);
  const [votes, setVotes] = useState<SongVote[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const [nextSongs, nextVotes] = await Promise.all([
      obtenerMusicSongSummaries(false),
      obtenerSongVotes(),
    ]);
    setSongs(nextSongs);
    setVotes(nextVotes);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const proposalCount = useMemo(() => {
    if (!effectiveGuest) return 0;
    return songs.filter((song) => song.proposerGuestToken === effectiveGuest.token).length;
  }, [effectiveGuest, songs]);

  const ownProposalIds = useMemo(() => {
    if (!effectiveGuest) return new Set<string>();
    return new Set(
      songs
        .filter((song) => song.proposerGuestToken === effectiveGuest.token)
        .map((song) => song.id)
    );
  }, [effectiveGuest, songs]);

  const votedIds = useMemo(() => {
    if (!effectiveGuest) return new Set<string>();
    return new Set(
      votes
        .filter((vote) => vote.guestToken === effectiveGuest.token)
        .map((vote) => vote.proposalId)
    );
  }, [effectiveGuest, votes]);

  async function handleSubmitProposal() {
    setNotice(null);

    if (!effectiveGuest || !canParticipate) {
      setNotice({
        type: "error",
        text: "Solo pueden participar adultos confirmados con acceso activado.",
      });
      return;
    }

    if (!title.trim() || !artist.trim()) {
      setNotice({ type: "error", text: "Indica título y artista." });
      return;
    }

    if (proposalCount >= 2) {
      setNotice({ type: "error", text: "Cada invitado adulto puede proponer como máximo 2 canciones." });
      return;
    }

    const duplicate = await findExactSongDuplicate(title, artist);
    if (duplicate) {
      setNotice({
        type: "error",
        text: "Esta canción ya está propuesta. Vota la existente en lugar de crear otra nueva.",
      });
      return;
    }

    setSaving(true);

    try {
      await guardarSongProposal({
        id: crypto.randomUUID(),
        title: title.trim(),
        artist: artist.trim(),
        ...(url.trim() ? { url: url.trim() } : {}),
        proposerGuestToken: effectiveGuest.token,
        visible: true,
        createdAt: Date.now(),
      });

      await registrarActividad({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        tipo: "musica_propuesta",
        mensaje: `${effectiveGuest.nombre} ha propuesto: ${title.trim()} - ${artist.trim()}`,
        tokenInvitado: effectiveGuest.token,
      });

      setTitle("");
      setArtist("");
      setUrl("");
      setNotice({ type: "success", text: "Canción propuesta correctamente." });
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVote(song: MusicSongSummary) {
    setNotice(null);

    if (!effectiveGuest || !canParticipate) {
      setNotice({
        type: "error",
        text: "Solo pueden votar adultos confirmados con acceso activado.",
      });
      return;
    }

    if (ownProposalIds.has(song.id)) {
      setNotice({ type: "error", text: "No puedes votar tu propia propuesta." });
      return;
    }

    const result = await toggleSongVote(song.id, effectiveGuest.token);
    if (!result.ok) {
      setNotice({ type: "error", text: "La canción ya no está disponible." });
      return;
    }

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: result.voted ? "musica_voto" : "musica_retirada_voto",
      mensaje: result.voted
        ? `${effectiveGuest.nombre} ha votado: ${song.title} - ${song.artist}`
        : `${effectiveGuest.nombre} ha retirado su voto de: ${song.title} - ${song.artist}`,
      tokenInvitado: effectiveGuest.token,
    });

    setNotice({
      type: "success",
      text: result.voted ? "Tu voto se ha guardado." : "Has retirado tu voto.",
    });
    await loadData();
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Participación</p>
        <h1 className="app-page-title mt-4">Música de la boda</h1>
        <p className="mt-3 app-subtitle">
          Proponed canciones y votad las favoritas para construir la selección final que verán los novios en su ranking.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Canciones visibles</p>
            <p className="mt-2 text-2xl font-semibold">{songs.length}</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Tus propuestas</p>
            <p className="mt-2 text-2xl font-semibold">{proposalCount} / 2</p>
          </article>
          <article className="app-surface-soft p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">Tus votos activos</p>
            <p className="mt-2 text-2xl font-semibold">{votedIds.size}</p>
          </article>
        </div>

        {!canParticipate ? (
          <p className="mt-4 text-sm text-[var(--app-muted)]">
            La participación está reservada a invitados adultos, confirmados y con acceso activado.
          </p>
        ) : null}
        {isDevGuest ? (
          <p className="mt-4 text-sm text-[var(--app-muted)]">
            Modo desarrollo activo: se permite participación simulada para revisar la experiencia.
          </p>
        ) : null}
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
        <div>
          <h2 className="app-section-heading">Proponer canción</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Cada invitado adulto puede proponer hasta dos canciones. Si una ya existe, mejor votarla.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <input
            type="text"
            placeholder="Título de la canción"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          />
          <input
            type="text"
            placeholder="Artista"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2"
          />
          <input
            type="url"
            placeholder="Enlace opcional (Spotify, YouTube...)"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] px-3 py-2 lg:col-span-2"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSubmitProposal()}
            disabled={!canParticipate || saving}
            className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proponer canción
          </button>
        </div>
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="app-section-heading">Canciones propuestas</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Ranking en tiempo real de las canciones visibles para invitados.
            </p>
          </div>
        </div>

        {songs.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--app-muted)]">Todavía no hay canciones visibles.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {songs.map((song, index) => {
              const hasVoted = votedIds.has(song.id);
              const isOwnProposal = ownProposalIds.has(song.id);

              return (
                <article
                  key={song.id}
                  className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.76)] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.86)] text-lg font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--app-ink)]">{song.title}</p>
                        <p className="text-sm text-[var(--app-muted)]">{song.artist}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                          {song.voteCount} votos · propuesta {formatRelativeDate(song.createdAt)}
                        </p>
                        {song.url ? (
                          <a
                            href={song.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm text-[var(--app-ink)] underline underline-offset-4"
                          >
                            Abrir enlace
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isOwnProposal ? (
                        <span className="rounded-full border border-[var(--app-line)] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">
                          Tu propuesta
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleToggleVote(song)}
                        disabled={!canParticipate || isOwnProposal}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          hasVoted
                            ? "bg-[var(--app-ink)] text-white"
                            : "border border-[var(--app-line)] bg-white/80 text-[var(--app-ink)]"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {hasVoted ? "Quitar voto" : "Votar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
