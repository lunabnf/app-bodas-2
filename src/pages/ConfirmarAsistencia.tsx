import { useEffect, useMemo, useState } from "react";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";
import { guardarRSVP } from "../services/rsvpService";
import { registrarActividad } from "../services/actividadService";

// Estado de asistencia
type RSVP = "" | "si" | "no";

// Opciones de alergias/intolerancias frecuentes
export type Allergy =
  | "gluten"
  | "lacteos"
  | "frutos-secos"
  | "marisco"
  | "huevo"
  | "pescado"
  | "soja"
  | "diabetes"
  | "otro";

const ALLERGY_OPTIONS: { value: Allergy; label: string }[] = [
  { value: "gluten", label: "Gluten / Celiaquía" },
  { value: "lacteos", label: "Lácteos" },
  { value: "frutos-secos", label: "Frutos secos" },
  { value: "marisco", label: "Marisco" },
  { value: "huevo", label: "Huevo" },
  { value: "pescado", label: "Pescado" },
  { value: "soja", label: "Soja" },
  { value: "diabetes", label: "Diabetes" },
  { value: "otro", label: "Otro" },
];

// Modelo base de persona
type PersonBase = {
  fullName: string;
  hasAllergy: boolean;
  allergies: Allergy[];
  customAllergy?: string;
};

// Formularios
type AdultForm = PersonBase;
type ChildForm = PersonBase & { age?: number };

function uuid(): string {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ConfirmarAsistencia() {
  const [attending, setAttending] = useState<RSVP>("");
  const [numAdults, setNumAdults] = useState<number>(0);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [adults, setAdults] = useState<AdultForm[]>([]);
  const [children, setChildren] = useState<ChildForm[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Ajusta arrays según cantidades
  useEffect(() => {
    setAdults(prev => {
      const copy = [...prev];
      if (numAdults > copy.length) {
        while (copy.length < numAdults) copy.push({ fullName: "", hasAllergy: false, allergies: [] });
      } else if (numAdults < copy.length) {
        copy.length = Math.max(numAdults, 0);
      }
      return copy;
    });
  }, [numAdults]);

  useEffect(() => {
    setChildren(prev => {
      const copy = [...prev];
      if (numChildren > copy.length) {
        while (copy.length < numChildren) copy.push({ fullName: "", hasAllergy: false, allergies: [] });
      } else if (numChildren < copy.length) {
        copy.length = Math.max(numChildren, 0);
      }
      return copy;
    });
  }, [numChildren]);

  function onAdultChange<K extends keyof AdultForm>(idx: number, field: K, value: AdultForm[K]) {
    setAdults(prev => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value } as AdultForm;
      if (field === "hasAllergy" && value === false) {
        item.customAllergy = undefined;
        item.allergies = [];
      }
      next[idx] = item;
      return next;
    });
  }

  function onChildChange<K extends keyof ChildForm>(idx: number, field: K, value: ChildForm[K]) {
    setChildren(prev => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value } as ChildForm;
      if (field === "hasAllergy" && value === false) {
        item.customAllergy = undefined;
        item.allergies = [];
      }
      next[idx] = item;
      return next;
    });
  }

  function toggleAllergy<T extends AdultForm | ChildForm>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    idx: number,
    option: Allergy,
    checked: boolean
  ) {
    setList(prev => {
      const copy = [...prev];
      const item = { ...copy[idx] } as T;
      const set = new Set((item.allergies as Allergy[]) || []);
      if (checked) set.add(option); else set.delete(option);
      item.allergies = Array.from(set);
      if (option === "otro" && !checked) {
        // Si desmarca "otro", limpia el texto libre
        (item as AdultForm | ChildForm).customAllergy = undefined;
      }
      copy[idx] = item;
      return copy;
    });
  }

  // Vista previa de tarjetas individuales locales
  const previewCards = useMemo(() => {
    if (attending !== "si") return [] as Array<{ id: string; label: string; type: "adulto" | "niño"; allergy?: string }>;
    const adultsCards = adults.map((a, i) => ({
      id: uuid(),
      label: a.fullName.trim() || `Adulto ${i + 1}`,
      type: "adulto" as const,
      allergy: a.hasAllergy
        ? ([...(a.allergies || []).map(x => ALLERGY_OPTIONS.find(o => o.value === x)?.label || x), a.customAllergy]
            .filter(Boolean)
            .join(", "))
        : undefined,
    }));
    const childrenCards = children.map((c, i) => ({
      id: uuid(),
      label: c.fullName.trim() || `Niño/a ${i + 1}`,
      type: "niño" as const,
      allergy: c.hasAllergy
        ? ([...(c.allergies || []).map(x => ALLERGY_OPTIONS.find(o => o.value === x)?.label || x), c.customAllergy]
            .filter(Boolean)
            .join(", "))
        : undefined,
    }));
    return [...adultsCards, ...childrenCards];
  }, [attending, adults, children]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Aquí, en el futuro, enviar a Firestore o API y crear tarjetas vinculadas
    const usuario = getUsuarioActual();
    if (usuario) {
      if (attending === "si") {
        addLog(usuario.nombre, "Confirmó asistencia a la boda");
      } else if (attending === "no") {
        addLog(usuario.nombre, "Rechazó la asistencia a la boda");
      }
    }
    // Guardar RSVP
    if (usuario) {
      const data = {
        id: usuario.token,
        attending,
        adultos: numAdults,
        ninos: numChildren,
        detalles: [
          ...adults.map(a => ({
            nombre: a.fullName,
            alergias: a.allergies,
            intolerancias: a.customAllergy,
          })),
          ...children.map(c => ({
            nombre: c.fullName,
            edad: c.age,
            alergias: c.allergies,
            intolerancias: c.customAllergy,
          }))
        ],
        timestamp: Date.now(),
      };

      guardarRSVP(usuario.token, data);

      // Registrar actividad global
      if (attending === "si") {
        await registrarActividad({
          id: uuid(),
          timestamp: Date.now(),
          tipo: "rsvp",
          mensaje: `${usuario.nombre} ha confirmado asistencia (${numAdults} adultos, ${numChildren} niños)`,
          tokenInvitado: usuario.token,
        });
      } else if (attending === "no") {
        await registrarActividad({
          id: uuid(),
          timestamp: Date.now(),
          tipo: "rsvp",
          mensaje: `${usuario.nombre} ha rechazado la asistencia`,
          tokenInvitado: usuario.token,
        });
      }
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-md px-6 py-10">
      <h1 className="text-4xl font-bold text-pink-300 mb-6">💌 Confirmar asistencia</h1>

      <form onSubmit={onSubmit} className="w-full max-w-2xl bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 space-y-6">
        {/* Paso 1: ¿Asistirás? */}
        <div>
          <span className="block text-sm text-white/70 mb-2">¿Asistirás a la boda?</span>
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="attending" value="si" checked={attending === "si"} onChange={() => setAttending("si")} required />
              Sí
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="attending" value="no" checked={attending === "no"} onChange={() => setAttending("no")} required />
              No
            </label>
          </div>
        </div>

        {/* Paso 2: Cantidades cuando es Sí */}
        {attending === "si" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Adultos</label>
              <input
                type="number"
                min={0}
                value={numAdults}
                onChange={(e) => setNumAdults(Math.max(0, Number(e.target.value || 0)))}
                className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Niños</label>
              <input
                type="number"
                min={0}
                value={numChildren}
                onChange={(e) => setNumChildren(Math.max(0, Number(e.target.value || 0)))}
                className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* Paso 3: Detalle por persona */}
        {attending === "si" && (
          <>
            {adults.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Datos de adultos</h2>
                <div className="space-y-3">
                  {adults.map((a, idx) => (
                    <div key={`adult-${idx}`} className="rounded-lg border border-white/15 bg-black/20 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm text-white/70 mb-1">Nombre y apellidos</label>
                          <input
                            type="text"
                            value={a.fullName}
                            onChange={(e) => onAdultChange(idx, "fullName", e.target.value)}
                            className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            placeholder={`Adulto ${idx + 1}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`adult-al-${idx}`}
                            type="checkbox"
                            checked={a.hasAllergy}
                            onChange={(e) => onAdultChange(idx, "hasAllergy", e.target.checked)}
                          />
                          <label htmlFor={`adult-al-${idx}`} className="text-sm">¿Alergias o intolerancias?</label>
                        </div>
                      </div>
                      {a.hasAllergy && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {ALLERGY_OPTIONS.map(opt => (
                              <label key={opt.value} className="flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10">
                                <input
                                  type="checkbox"
                                  checked={(a.allergies || []).includes(opt.value)}
                                  onChange={(e) => toggleAllergy(adults, setAdults, idx, opt.value, e.target.checked)}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                          {(a.allergies || []).includes("otro") && (
                            <input
                              className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                              placeholder="Especifica otras alergias o intolerancias"
                              value={a.customAllergy ?? ""}
                              onChange={(e) => onAdultChange(idx, "customAllergy", e.target.value as AdultForm["customAllergy"]) }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {children.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Datos de niños</h2>
                <div className="space-y-3">
                  {children.map((c, idx) => (
                    <div key={`child-${idx}`} className="rounded-lg border border-white/15 bg-black/20 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm text-white/70 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={c.fullName}
                            onChange={(e) => onChildChange(idx, "fullName", e.target.value)}
                            className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            placeholder={`Niño/a ${idx + 1}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-1">Edad (opcional)</label>
                          <input
                            type="number"
                            min={0}
                            value={c.age ?? ""}
                            onChange={(e) => onChildChange(idx, "age", e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`child-al-${idx}`}
                            type="checkbox"
                            checked={c.hasAllergy}
                            onChange={(e) => onChildChange(idx, "hasAllergy", e.target.checked)}
                          />
                          <label htmlFor={`child-al-${idx}`} className="text-sm">¿Alergias o intolerancias?</label>
                        </div>
                      </div>
                      {c.hasAllergy && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {ALLERGY_OPTIONS.map(opt => (
                              <label key={opt.value} className="flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10">
                                <input
                                  type="checkbox"
                                  checked={(c.allergies || []).includes(opt.value)}
                                  onChange={(e) => toggleAllergy(children, setChildren, idx, opt.value, e.target.checked)}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                          {(c.allergies || []).includes("otro") && (
                            <input
                              className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                              placeholder="Especifica otras alergias o intolerancias"
                              value={c.customAllergy ?? ""}
                              onChange={(e) => onChildChange(idx, "customAllergy", e.target.value as ChildForm["customAllergy"]) }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Botón de envío */}
        <div className="pt-2">
          <button type="submit" className="w-full py-2 rounded-md bg-pink-500 hover:bg-pink-400 font-semibold transition">
            Enviar confirmación
          </button>
          {submitted && (
            <p className="text-center text-sm text-green-400 mt-2">Guardado localmente (demo). Próximamente se crearán tarjetas individuales.</p>
          )}
        </div>
      </form>

      {/* Vista previa de tarjetas que se generarían */}
      {attending === "si" && previewCards.length > 0 && (
        <div className="w-full max-w-2xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {previewCards.map(card => (
            <article key={card.id} className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 shadow">
              <header className="text-sm opacity-80">{card.type === "adulto" ? "Adulto" : "Niño/a"}</header>
              <div className="text-base font-medium">{card.label}</div>
              {card.allergy && <div className="text-xs opacity-80 mt-1">Alergias: {card.allergy}</div>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}