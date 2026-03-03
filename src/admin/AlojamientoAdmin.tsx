import { useEffect, useState } from "react";
import type { LodgingOption, LodgingRequest } from "../domain/lodging";
import {
  borrarAlojamiento,
  guardarAlojamientos,
  obtenerAlojamientos,
  obtenerSolicitudesAlojamiento,
} from "../services/alojamientosService";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";

export default function AlojamientoAdmin() {
  const [alojamientos, setAlojamientos] = useState<LodgingOption[]>([]);
  const [solicitudes, setSolicitudes] = useState<LodgingRequest[]>([]);
  const [nuevo, setNuevo] = useState<LodgingOption>({
    id: crypto.randomUUID(),
    nombre: "",
    direccion: "",
    link: "",
    notas: "",
  });

  useEffect(() => {
    void (async () => {
      const [catalogo, requests] = await Promise.all([
        obtenerAlojamientos(),
        obtenerSolicitudesAlojamiento(),
      ]);
      setAlojamientos(catalogo);
      setSolicitudes(requests);
    })();
  }, []);

  const guardar = async () => {
    if (!nuevo.nombre.trim()) return;

    const updated = [...alojamientos, nuevo];
    setAlojamientos(updated);
    await guardarAlojamientos(updated);

    const usuario = getUsuarioActual();
    if (usuario) {
      await addLog(usuario.nombre, `Creó alojamiento: ${nuevo.nombre}`);
    }

    setNuevo({
      id: crypto.randomUUID(),
      nombre: "",
      direccion: "",
      link: "",
      notas: "",
    });
  };

  const borrar = async (id: string) => {
    const alojamiento = alojamientos.find((item) => item.id === id);
    const updated = alojamientos.filter((item) => item.id !== id);
    setAlojamientos(updated);
    await borrarAlojamiento(id);

    const usuario = getUsuarioActual();
    if (usuario && alojamiento) {
      await addLog(usuario.nombre, `Borró alojamiento: ${alojamiento.nombre}`);
    }
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Alojamiento (Admin)</h1>

      <p className="opacity-80">
        Aquí configuras el catálogo de alojamientos que se publica para los invitados.
      </p>

      <div className="p-4 bg-white/10 border border-white/20 rounded-lg space-y-3">
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Nombre del alojamiento"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Dirección"
          value={nuevo.direccion}
          onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Link de reserva"
          value={nuevo.link}
          onChange={(e) => setNuevo({ ...nuevo, link: e.target.value })}
        />
        <textarea
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Notas para los invitados"
          value={nuevo.notas || ""}
          onChange={(e) => setNuevo({ ...nuevo, notas: e.target.value })}
        />

        <button className="bg-blue-600 px-4 py-2 rounded" onClick={() => void guardar()}>
          Añadir alojamiento
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Catálogo publicado</h2>
        {alojamientos.length === 0 && (
          <p className="opacity-60">No hay alojamientos añadidos.</p>
        )}

        {alojamientos.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white/10 border rounded-lg flex justify-between gap-4"
          >
            <div>
              <p className="font-bold">{item.nombre}</p>
              <p className="opacity-80">{item.direccion}</p>
              {item.notas ? <p className="mt-1 opacity-70">{item.notas}</p> : null}
              {item.link ? (
                <a
                  href={item.link}
                  className="underline text-blue-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver enlace
                </a>
              ) : null}
            </div>

            <button
              className="bg-red-600 px-3 py-1 rounded h-fit"
              onClick={() => void borrar(item.id)}
            >
              Borrar
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Solicitudes de invitados</h2>
        {solicitudes.length === 0 ? (
          <p className="opacity-60">Todavía no hay solicitudes de alojamiento.</p>
        ) : (
          solicitudes.map((solicitud) => {
            const alojamiento = alojamientos.find((item) => item.id === solicitud.lodgingId);
            return (
              <div
                key={solicitud.id}
                className="rounded-lg border border-white/20 bg-white/10 p-4"
              >
                <p className="font-semibold">{solicitud.guestName}</p>
                <p className="opacity-80">
                  {solicitud.needsLodging
                    ? `Necesita alojamiento${alojamiento ? `: ${alojamiento.nombre}` : ""}`
                    : "No necesita alojamiento"}
                </p>
                {solicitud.notes ? <p className="mt-1 opacity-70">{solicitud.notes}</p> : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
