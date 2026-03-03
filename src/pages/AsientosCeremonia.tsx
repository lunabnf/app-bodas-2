import { useEffect, useMemo, useState } from "react";
import type { Guest } from "../domain/guest";
import { obtenerInvitados } from "../services/invitadosService";

type CeremonySeatGuest = Pick<Guest, "id" | "token" | "nombre" | "mesa" | "estado">;
type ZoneKey = "sinAsignar" | "izquierda" | "derecha";
type Zones = Record<ZoneKey, CeremonySeatGuest[]>;

const ZONE_LABEL: Record<ZoneKey, string> = {
  sinAsignar: "Sin asignar",
  izquierda: "Bancos izquierda",
  derecha: "Bancos derecha",
};

function getConfirmedGuests(guests: Guest[]): CeremonySeatGuest[] {
  return guests
    .filter((guest) => guest.estado === "confirmado")
    .map((guest) => ({
      id: guest.id,
      token: guest.token,
      nombre: guest.nombre,
      estado: guest.estado,
      ...(guest.mesa ? { mesa: guest.mesa } : {}),
    }));
}

export default function AsientosCeremonia() {
  const [confirmedGuests, setConfirmedGuests] = useState<CeremonySeatGuest[]>([]);
  const [zones, setZones] = useState<Zones>({
    sinAsignar: [],
    izquierda: [],
    derecha: [],
  });

  const total = useMemo(
    () => zones.sinAsignar.length + zones.izquierda.length + zones.derecha.length,
    [zones]
  );

  useEffect(() => {
    void (async () => {
      const guests = await obtenerInvitados();
      const confirmed = getConfirmedGuests(guests);
      setConfirmedGuests(confirmed);
      setZones({
        sinAsignar: confirmed,
        izquierda: [],
        derecha: [],
      });
    })();
  }, []);

  function onDragStart(event: React.DragEvent, guest: CeremonySeatGuest) {
    event.dataTransfer.setData("application/guest-id", guest.id);
    event.dataTransfer.effectAllowed = "move";
  }

  function onDropZone(event: React.DragEvent, zone: ZoneKey) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/guest-id");
    if (!id) return;

    setZones((prev) => {
      const next: Zones = { sinAsignar: [], izquierda: [], derecha: [] };
      let moving: CeremonySeatGuest | null = null;

      (Object.keys(prev) as ZoneKey[]).forEach((key) => {
        prev[key].forEach((guest) => {
          if (guest.id === id) {
            moving = guest;
          } else {
            next[key].push(guest);
          }
        });
      });

      if (moving) {
        next[zone].push(moving);
      }

      return next;
    });
  }

  function allowDrop(event: React.DragEvent) {
    event.preventDefault();
  }

  function reset() {
    setZones({
      sinAsignar: confirmedGuests,
      izquierda: [],
      derecha: [],
    });
  }

  function exportarPlan() {
    const data = {
      generado: new Date().toISOString(),
      total,
      sinAsignar: zones.sinAsignar.map((guest) => guest.nombre),
      izquierda: zones.izquierda.map((guest) => guest.nombre),
      derecha: zones.derecha.map((guest) => guest.nombre),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plan-ceremonia.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6 px-4 py-6">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Participación</p>
        <h1 className="app-page-title mt-4">Asientos de la ceremonia</h1>
        <p className="mt-3 app-subtitle">
          Organiza a los invitados confirmados por zonas y exporta el reparto para revisarlo con calma.
        </p>
      </div>

      <div className="app-panel flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <p className="text-sm text-[var(--app-muted)]">
          Invitados confirmados cargados: <strong>{confirmedGuests.length}</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={reset} className="app-button-secondary px-4 py-2 text-sm">
            Reiniciar
          </button>
          <button onClick={exportarPlan} className="app-button-primary px-4 py-2 text-sm">
            Exportar JSON
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["sinAsignar", "izquierda", "derecha"] as ZoneKey[]).map((zone) => (
          <section key={zone} className="app-panel overflow-hidden">
            <div className="border-b border-[var(--app-line)] px-4 py-3 font-semibold text-[var(--app-ink)]">
              {ZONE_LABEL[zone]} ({zones[zone].length})
            </div>
            <div
              className="flex min-h-[240px] flex-col gap-2 p-4"
              onDragOver={allowDrop}
              onDrop={(event) => onDropZone(event, zone)}
            >
              {zones[zone].length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[var(--app-line)] bg-white/50 px-4 py-6 text-sm text-[var(--app-muted)]">
                  Vacío
                </div>
              ) : (
                zones[zone].map((guest) => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={(event) => onDragStart(event, guest)}
                    className="rounded-[18px] border border-[var(--app-line)] bg-white/80 px-4 py-3 text-sm font-medium text-[var(--app-ink)] shadow-[var(--app-shadow-soft)] cursor-grab active:cursor-grabbing"
                    title={guest.nombre}
                  >
                    {guest.nombre}
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-[var(--app-muted)]">
        Esta vista usa los invitados confirmados reales del sistema, no un estado paralelo de demo.
      </p>
    </section>
  );
}
