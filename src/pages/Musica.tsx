import { useEffect, useState } from "react";
import {
  obtenerCanciones,
  guardarCancion,
  votarCancion,
  type Cancion,
} from "../services/musicaService";
import { registrarActividad } from "../services/actividadService";
import { useAuth } from "../store/useAuth";

export default function Musica() {
  const { invitado } = useAuth();
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [error, setError] = useState("");

  const cargar = async () => {
    const data = await obtenerCanciones();
    const ordenadas = [...data].sort((a, b) => b.votos - a.votos);
    setCanciones(ordenadas);
  };

  useEffect(() => {
    void cargar();
  }, []);

  const propuestasDeEsteInvitado = canciones.filter(
    (c) => c.propuestaPorToken === invitado?.token
  ).length;

  const handleProponer = async () => {
    setError("");

    if (!invitado) {
      setError("Debes identificarte.");
      return;
    }

    if (!titulo.trim() || !artista.trim()) {
      setError("Rellena título y artista.");
      return;
    }

    if (propuestasDeEsteInvitado >= 2) {
      setError("Solo puedes proponer 2 canciones.");
      return;
    }

    const existe = canciones.some(
      (c) =>
        c.titulo.toLowerCase() === titulo.toLowerCase() &&
        c.artista.toLowerCase() === artista.toLowerCase()
    );

    if (existe) {
      setError("Esta canción ya está propuesta.");
      return;
    }

    const nueva: Cancion = {
      id: crypto.randomUUID(),
      titulo,
      artista,
      propuestaPorToken: invitado.token,
      votos: 0,
    };

    await guardarCancion(nueva);

    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "cancion_propuesta",
      mensaje: `${invitado.nombre} ha propuesto: ${titulo} - ${artista}`,
      tokenInvitado: invitado.token,
    });

    setTitulo("");
    setArtista("");
    await cargar();
  };

  const handleVotar = async (id: string) => {
    if (!invitado) return;

    await votarCancion(id);

    const c = canciones.find((x) => x.id === id);
    if (c) {
      await registrarActividad({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        tipo: "voto_cancion",
        mensaje: `${invitado.nombre} ha votado: ${c.titulo} - ${c.artista}`,
        tokenInvitado: invitado.token,
      });
    }

    await cargar();
  };

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Música</h1>

      <div className="space-y-3 bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold">Proponer canción</h2>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Artista"
          value={artista}
          onChange={(e) => setArtista(e.target.value)}
          className="w-full p-2 rounded text-black"
        />

        {error && <p className="text-red-300 text-sm">{error}</p>}

        <button
          onClick={handleProponer}
          className="bg-white text-black px-4 py-2 rounded-lg mt-2"
        >
          Proponer
        </button>

        <p className="text-sm opacity-70">
          Propuestas realizadas: {propuestasDeEsteInvitado} / 2
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Canciones propuestas</h2>

        {canciones.length === 0 && (
          <p className="opacity-70">Todavía no hay canciones.</p>
        )}

        <div className="space-y-3">
          {canciones.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-white/10 border border-white/20 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{c.titulo}</p>
                <p className="opacity-80 text-sm">{c.artista}</p>
                <p className="text-xs opacity-60 mt-1">
                  Votos: {c.votos}
                </p>
              </div>

              <button
                onClick={() => handleVotar(c.id)}
                className="bg-white text-black px-3 py-1 rounded"
              >
                Votar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}