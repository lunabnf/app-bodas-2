import { useEffect, useState } from "react";
import type { TransportOption, TransportRequest } from "../domain/transport";
import {
  createEmptyTransportDraft,
  createTransportOption,
  loadAdminCatalogData,
  removeTransportOption,
  type TransportDraft,
} from "../application/adminCatalogService";

export default function DesplazamientoAdmin() {
  const [items, setItems] = useState<TransportOption[]>([]);
  const [solicitudes, setSolicitudes] = useState<TransportRequest[]>([]);
  const [nuevo, setNuevo] = useState<TransportDraft>(createEmptyTransportDraft());

  useEffect(() => {
    void (async () => {
      const data = await loadAdminCatalogData();
      setItems(data.transportes);
      setSolicitudes(data.solicitudesTransporte);
    })();
  }, []);

  const guardar = async () => {
    const entry = await createTransportOption(items, nuevo);
    if (!entry) return;
    setItems((current) => [...current, entry]);
    setNuevo(createEmptyTransportDraft());
  };

  const borrar = async (id: string) => {
    await removeTransportOption(items, id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Desplazamientos (Admin)</h1>

      <p className="opacity-80">
        Aquí configuras las opciones de desplazamiento que podrán solicitar los invitados.
      </p>

      <div className="p-4 bg-white/10 border border-white/20 rounded space-y-3">
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Nombre del transporte (Ej: Bus A)"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Origen"
          value={nuevo.origen}
          onChange={(e) => setNuevo({ ...nuevo, origen: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Destino"
          value={nuevo.destino}
          onChange={(e) => setNuevo({ ...nuevo, destino: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Hora"
          value={nuevo.hora}
          onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })}
        />
        <input
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Capacidad (asientos)"
          type="number"
          value={nuevo.capacidad}
          onChange={(e) => setNuevo({ ...nuevo, capacidad: e.target.value })}
        />
        <textarea
          className="p-2 bg-black/30 border rounded w-full"
          placeholder="Notas"
          value={nuevo.notas}
          onChange={(e) => setNuevo({ ...nuevo, notas: e.target.value })}
        />

        <button className="bg-blue-600 px-4 py-2 rounded" onClick={() => void guardar()}>
          Añadir transporte
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Opciones publicadas</h2>
        {items.length === 0 && (
          <p className="opacity-60">No hay transportes añadidos.</p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white/10 border border-white/20 rounded flex justify-between gap-4"
          >
            <div>
              <p className="font-bold text-lg">{item.nombre}</p>
              <p className="opacity-80">
                {item.origen} → {item.destino}
              </p>
              <p className="opacity-80">Hora: {item.hora}</p>
              <p className="opacity-80">Capacidad: {item.capacidad}</p>
              {item.notas ? <p className="italic opacity-70 mt-1">{item.notas}</p> : null}
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
          <p className="opacity-60">Todavía no hay solicitudes de transporte.</p>
        ) : (
          solicitudes.map((solicitud) => {
            const transporte = items.find((item) => item.id === solicitud.transportId);
            return (
              <div
                key={solicitud.id}
                className="rounded-lg border border-white/20 bg-white/10 p-4"
              >
                <p className="font-semibold">{solicitud.guestName}</p>
                <p className="opacity-80">
                  {transporte ? transporte.nombre : "Transporte"} · {solicitud.seats} plaza(s)
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
