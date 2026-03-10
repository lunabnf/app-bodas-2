import { useEffect, useMemo, useState } from "react";
import type { RsvpAttendance } from "../domain/rsvp";
import {
  type AdultForm,
  type Allergy,
  cleanChildForm,
  cleanPersonBase,
  type ChildForm,
  loadGuestRsvpForm,
  submitGuestRsvp,
  syncAdultForms,
  syncChildForms,
} from "../application/guestParticipationService";
import { useAuth } from "../store/useAuth";

type RSVP = RsvpAttendance;

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

function uuid(): string {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ConfirmarAsistencia() {
  const invitado = useAuth((state) => state.invitado);
  const [attending, setAttending] = useState<RSVP>("");
  const [numAdults, setNumAdults] = useState<number>(0);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [adults, setAdults] = useState<AdultForm[]>([]);
  const [children, setChildren] = useState<ChildForm[]>([]);
  const [nota, setNota] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAdults((prev) => syncAdultForms(numAdults, prev));
  }, [numAdults]);

  useEffect(() => {
    setChildren((prev) => syncChildForms(numChildren, prev));
  }, [numChildren]);

  useEffect(() => {
    if (!invitado) return;

    void (async () => {
      const existing = await loadGuestRsvpForm(invitado.token);
      if (!existing) return;

      setAttending(existing.attending);
      setNumAdults(existing.numAdults);
      setNumChildren(existing.numChildren);
      setNota(existing.nota);
      setAdults(existing.adults);
      setChildren(existing.children);
    })();
  }, [invitado]);

  function onAdultChange<K extends keyof AdultForm>(idx: number, field: K, value: AdultForm[K]) {
    setAdults((prev) => {
      const next = [...prev];
      const item = cleanPersonBase({ ...next[idx], [field]: value } as AdultForm);
      if (field === "hasAllergy" && value === false) {
        delete item.customAllergy;
        item.allergies = [];
      }
      next[idx] = item;
      return next;
    });
  }

  function onChildChange<K extends keyof ChildForm>(idx: number, field: K, value: ChildForm[K]) {
    setChildren((prev) => {
      const next = [...prev];
      const item = cleanChildForm({ ...next[idx], [field]: value } as ChildForm);
      if (field === "hasAllergy" && value === false) {
        delete item.customAllergy;
        item.allergies = [];
      }
      next[idx] = item;
      return next;
    });
  }

  function toggleAllergy<T extends AdultForm | ChildForm>(
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    idx: number,
    option: Allergy,
    checked: boolean
  ) {
    setList((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx] } as T;
      const set = new Set((item.allergies as Allergy[]) || []);
      if (checked) set.add(option);
      else set.delete(option);
      item.allergies = Array.from(set);
      if (option === "otro" && !checked) {
        delete item.customAllergy;
      }
      copy[idx] = ("age" in item ? cleanChildForm(item as ChildForm) : cleanPersonBase(item as AdultForm)) as T;
      return copy;
    });
  }

  const previewCards = useMemo(() => {
    if (attending !== "si") {
      return [] as Array<{ id: string; label: string; type: "adulto" | "niño"; allergy?: string }>;
    }

    const adultsCards = adults.map((adult, index) => ({
      id: uuid(),
      label: adult.fullName.trim() || `Adulto ${index + 1}`,
      type: "adulto" as const,
      allergy: adult.hasAllergy
        ? ([...(adult.allergies || []).map((item) => ALLERGY_OPTIONS.find((opt) => opt.value === item)?.label || item), adult.customAllergy]
            .filter(Boolean)
            .join(", "))
        : undefined,
    }));

    const childrenCards = children.map((child, index) => ({
      id: uuid(),
      label: child.fullName.trim() || `Niño/a ${index + 1}`,
      type: "niño" as const,
      allergy: child.hasAllergy
        ? ([...(child.allergies || []).map((item) => ALLERGY_OPTIONS.find((opt) => opt.value === item)?.label || item), child.customAllergy]
            .filter(Boolean)
            .join(", "))
        : undefined,
    }));

    return [...adultsCards, ...childrenCards];
  }, [attending, adults, children]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invitado) return;
    await submitGuestRsvp({
      invitado,
      attending,
      numAdults,
      numChildren,
      adults,
      children,
      nota,
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-black/50 px-4 py-8 text-white backdrop-blur-md sm:px-6 sm:py-10">
      <h1 className="mb-6 text-center text-3xl font-bold text-pink-300 sm:text-4xl">💌 Confirmar asistencia</h1>

      {!invitado ? (
        <div className="w-full max-w-2xl rounded-lg border border-white/15 bg-white/10 p-6 text-center">
          <p className="text-white/80">
            Necesitas identificarte como invitado para guardar tu confirmación.
          </p>
        </div>
      ) : (
        <>
          <form
            onSubmit={onSubmit}
            className="w-full max-w-2xl bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 space-y-6"
          >
            <div>
              <span className="block text-sm text-white/70 mb-2">¿Asistirás a la boda?</span>
              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="attending"
                    value="si"
                    checked={attending === "si"}
                    onChange={() => setAttending("si")}
                    required
                  />
                  Sí
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="attending"
                    value="no"
                    checked={attending === "no"}
                    onChange={() => setAttending("no")}
                    required
                  />
                  No
                </label>
              </div>
            </div>

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

            {attending === "si" && (
              <>
                {adults.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Datos de adultos</h2>
                    <div className="space-y-3">
                      {adults.map((adult, idx) => (
                        <div key={`adult-${idx}`} className="rounded-lg border border-white/15 bg-black/20 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-sm text-white/70 mb-1">Nombre y apellidos</label>
                              <input
                                type="text"
                                value={adult.fullName}
                                onChange={(e) => onAdultChange(idx, "fullName", e.target.value)}
                                className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                placeholder={`Adulto ${idx + 1}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                id={`adult-al-${idx}`}
                                type="checkbox"
                                checked={adult.hasAllergy}
                                onChange={(e) => onAdultChange(idx, "hasAllergy", e.target.checked)}
                              />
                              <label htmlFor={`adult-al-${idx}`} className="text-sm">
                                ¿Alergias o intolerancias?
                              </label>
                            </div>
                          </div>
                          {adult.hasAllergy ? (
                            <div className="mt-3 space-y-2">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ALLERGY_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className="flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={(adult.allergies || []).includes(opt.value)}
                                      onChange={(e) =>
                                        toggleAllergy(setAdults, idx, opt.value, e.target.checked)
                                      }
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                              {(adult.allergies || []).includes("otro") ? (
                                <input
                                  className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                  placeholder="Especifica otras alergias o intolerancias"
                                  value={adult.customAllergy ?? ""}
                                  onChange={(e) =>
                                    onAdultChange(
                                      idx,
                                      "customAllergy",
                                      e.target.value as AdultForm["customAllergy"]
                                    )
                                  }
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {children.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Datos de niños</h2>
                    <div className="space-y-3">
                      {children.map((child, idx) => (
                        <div key={`child-${idx}`} className="rounded-lg border border-white/15 bg-black/20 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-sm text-white/70 mb-1">Nombre</label>
                              <input
                                type="text"
                                value={child.fullName}
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
                                value={child.age ?? ""}
                                onChange={(e) =>
                                  onChildChange(
                                    idx,
                                    "age",
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                id={`child-al-${idx}`}
                                type="checkbox"
                                checked={child.hasAllergy}
                                onChange={(e) => onChildChange(idx, "hasAllergy", e.target.checked)}
                              />
                              <label htmlFor={`child-al-${idx}`} className="text-sm">
                                ¿Alergias o intolerancias?
                              </label>
                            </div>
                          </div>
                          {child.hasAllergy ? (
                            <div className="mt-3 space-y-2">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ALLERGY_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className="flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={(child.allergies || []).includes(opt.value)}
                                      onChange={(e) =>
                                        toggleAllergy(setChildren, idx, opt.value, e.target.checked)
                                      }
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                              {(child.allergies || []).includes("otro") ? (
                                <input
                                  className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                  placeholder="Especifica otras alergias o intolerancias"
                                  value={child.customAllergy ?? ""}
                                  onChange={(e) =>
                                    onChildChange(
                                      idx,
                                      "customAllergy",
                                      e.target.value as ChildForm["customAllergy"]
                                    )
                                  }
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            <div>
              <label className="block text-sm text-white/70 mb-1">Nota adicional</label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Dietas, horarios, carrito de bebé, lo que necesitéis contarnos"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 rounded-md bg-pink-500 hover:bg-pink-400 font-semibold transition"
              >
                Enviar confirmación
              </button>
              {submitted ? (
                <p className="text-center text-sm text-green-400 mt-2">
                  Respuesta guardada correctamente.
                </p>
              ) : null}
            </div>
          </form>

          {attending === "si" && previewCards.length > 0 ? (
            <div className="w-full max-w-2xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {previewCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 shadow"
                >
                  <header className="text-sm opacity-80">
                    {card.type === "adulto" ? "Adulto" : "Niño/a"}
                  </header>
                  <div className="text-base font-medium">{card.label}</div>
                  {card.allergy ? (
                    <div className="text-xs opacity-80 mt-1">Alergias: {card.allergy}</div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
