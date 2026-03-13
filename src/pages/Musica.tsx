import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { loadSongsSorted, proposeSong, voteSong } from "../application/guestParticipationService";
import { DEV_OPEN_PUBLIC_WEDDING, resolvePublicGuestSession } from "../services/devAccessService";
import type { Cancion } from "../services/musicaService";
import { useAuth } from "../store/useAuth";

export default function Musica() {
  const { slug } = useParams();
  const { invitado } = useAuth();
  const effectiveGuest = useMemo(() => resolvePublicGuestSession(invitado, slug), [invitado, slug]);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    setCanciones(await loadSongsSorted());
  }

  useEffect(() => {
    void cargar();
  }, []);

  const propuestasDeEsteInvitado = canciones.filter((c) => c.propuestaPorToken === effectiveGuest?.token).length;

  async function handleProponer() {
    setError("");
    const result = await proposeSong({
      invitado: effectiveGuest,
      canciones,
      titulo,
      artista,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setTitulo("");
    setArtista("");
    await cargar();
  }

  async function handleVotar(id: string) {
    const result = await voteSong({
      invitado: effectiveGuest,
      songId: id,
      canciones,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    await cargar();
  }

  return (
    <section className="space-y-6 px-4 py-4 sm:px-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Participación</p>
        <h1 className="app-page-title mt-4">Música de la boda</h1>
        <p className="mt-3 app-subtitle">Proponed canciones y votad para construir la banda sonora del evento.</p>
        {DEV_OPEN_PUBLIC_WEDDING && !invitado ? (
          <p className="mt-3 text-sm text-[var(--app-muted)]">
            Modo desarrollo activo: módulo abierto sin identificación de invitado.
          </p>
        ) : null}
      </div>

      <div className="app-panel p-5 sm:p-6">
        <h2 className="app-section-heading">Proponer canción</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-3" />
          <input type="text" placeholder="Artista" value={artista} onChange={(e) => setArtista(e.target.value)} className="w-full p-3" />
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void handleProponer()} className="app-button-primary">
            Proponer
          </button>
          <p className="text-sm text-[var(--app-muted)]">Propuestas realizadas: {propuestasDeEsteInvitado} / 2</p>
        </div>
      </div>

      <div className="app-panel p-5 sm:p-6">
        <h2 className="app-section-heading">Canciones propuestas</h2>

        {canciones.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--app-muted)]">Todavía no hay canciones.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {canciones.map((c) => (
              <article
                key={c.id}
                className="flex flex-col gap-3 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-[var(--app-ink)]">{c.titulo}</p>
                  <p className="text-sm text-[var(--app-muted)]">{c.artista}</p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">Votos: {c.votos}</p>
                </div>

                <button type="button" onClick={() => void handleVotar(c.id)} className="app-button-secondary">
                  Votar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
