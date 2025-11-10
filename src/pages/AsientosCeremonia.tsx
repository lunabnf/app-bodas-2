import React, { useEffect, useMemo, useState } from "react";

// Tipos simples. Ajusta si en tu app ya existe un tipo Guest común.
export type Guest = {
  id: string;
  nombre: string;
  mesa?: string | null; // no usado aquí, pero útil si ya existe en otros módulos
};

// 1) Tipado del posible estado global
type AppState = { __APP_STATE__?: { guests?: { confirmed?: unknown[] } } };

function getConfirmedGuestsFallback(): Guest[] {
  try {
    const fromWindow = (globalThis as AppState).__APP_STATE__?.guests?.confirmed;
    if (Array.isArray(fromWindow)) return normalize(fromWindow);
  } catch { /* noop */ }
  try {
    const raw = localStorage.getItem("confirmedGuests");
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalize(parsed);
    }
  } catch { /* noop */ }
  return [];
}

function normalize(items: unknown[]): Guest[] {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map((g, i) => {
      const obj = g as Record<string, unknown>;
      return {
        id: String(obj.id ?? obj.uid ?? obj.email ?? i),
        nombre: String(obj.nombre ?? obj.name ?? obj.fullName ?? obj.alias ?? "Invitado"),
        mesa: (obj.mesa as string | null | undefined) ?? null,
      };
    });
}

// Modelo mínimo de "asiento" en ceremonia: dos bloques (izquierda/derecha) y una lista de "sin asignar".
// Si en tu app ya hay componentes reutilizables del módulo Mesas (p. ej. GuestCard), puedes cambiarlos aquí.

type ZoneKey = "sinAsignar" | "izquierda" | "derecha";

type Zones = Record<ZoneKey, Guest[]>;

const ZONE_LABEL: Record<ZoneKey, string> = {
  sinAsignar: "Sin asignar",
  izquierda: "Bancos izquierda",
  derecha: "Bancos derecha",
};

export default function AsientosCeremonia() {
  const [zones, setZones] = useState<Zones>({ sinAsignar: [], izquierda: [], derecha: [] });
  const total = useMemo(
    () => zones.sinAsignar.length + zones.izquierda.length + zones.derecha.length,
    [zones]
  );

  // Cargar confirmados sólo una vez.
  useEffect(() => {
    const confirmed = getConfirmedGuestsFallback();
    setZones({ sinAsignar: confirmed, izquierda: [], derecha: [] });
  }, []);

  // Drag & Drop nativo HTML5 sin dependencias
  function onDragStart(e: React.DragEvent, guest: Guest) {
    e.dataTransfer.setData("application/guest-id", guest.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropZone(e: React.DragEvent, zone: ZoneKey) {
    e.preventDefault();
    const id = e.dataTransfer.getData("application/guest-id");
    if (!id) return;

    setZones(prev => {
      // quitar de cualquier zona
      const next: Zones = { sinAsignar: [], izquierda: [], derecha: [] };
      let moving: Guest | undefined;
      (Object.keys(prev) as ZoneKey[]).forEach(k => {
        prev[k].forEach(g => {
          if (g.id === id) moving = g;
          else next[k].push(g);
        });
      });
      if (moving) next[zone].push(moving);
      return next;
    });
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  function reset() {
    const confirmed = getConfirmedGuestsFallback();
    setZones({ sinAsignar: confirmed, izquierda: [], derecha: [] });
  }

  function exportarPlan() {
    const data = {
      generado: new Date().toISOString(),
      total,
      sinAsignar: zones.sinAsignar.map(g => g.nombre),
      izquierda: zones.izquierda.map(g => g.nombre),
      derecha: zones.derecha.map(g => g.nombre),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan-ceremonia.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Asientos de la ceremonia</h1>
        <div className="flex gap-2">
          <button onClick={reset} className="px-3 py-1 rounded border text-sm">Reiniciar</button>
          <button onClick={exportarPlan} className="px-3 py-1 rounded border text-sm">Exportar JSON</button>
        </div>
      </header>

      <p className="text-sm text-gray-500">
        Arrastra los invitados confirmados a izquierda o derecha. Las rutas y datos reales se pueden
        conectar al mismo origen que el módulo <strong>Mesas</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["sinAsignar", "izquierda", "derecha"] as ZoneKey[]).map(zone => (
          <section key={zone} className="border rounded-lg">
            <div className="px-3 py-2 border-b bg-gray-50 font-medium">
              {ZONE_LABEL[zone]} ({zones[zone].length})
            </div>
            <div
              className="p-3 min-h-[200px] flex flex-col gap-2"
              onDragOver={allowDrop}
              onDrop={e => onDropZone(e, zone)}
            >
              {zones[zone].length === 0 && (
                <div className="text-sm text-gray-400 select-none">Vacío</div>
              )}
              {zones[zone].map(g => (
                <div
                  key={g.id}
                  draggable
                  onDragStart={e => onDragStart(e, g)}
                  className="px-3 py-2 rounded border bg-white shadow-sm cursor-grab active:cursor-grabbing"
                  title={g.nombre}
                >
                  {g.nombre}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="text-xs text-gray-400">
        Consejo: si ya tienes un selector o tarjeta de invitado reutilizable en <em>Mesas</em>,
        sustituye el div del invitado por ese componente para unificar estilo.
      </footer>
    </div>
  );
}
