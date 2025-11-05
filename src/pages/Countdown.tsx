import { useEffect, useMemo, useState, ChangeEvent } from "react";

/**
 * Modelo de datos
 */
type Allergy =
  | "Ninguna"
  | "Gluten"
  | "Lactosa"
  | "Frutos secos"
  | "Marisco"
  | "Huevo"
  | "Vegetariano"
  | "Vegano"
  | "Otro";

const ALLERGY_OPTIONS: Allergy[] = [
  "Ninguna",
  "Gluten",
  "Lactosa",
  "Frutos secos",
  "Marisco",
  "Huevo",
  "Vegetariano",
  "Vegano",
  "Otro",
];

type GuestCard = {
  id: string;
  householdId: string; // id del grupo de RSVP
  fullName: string;
  isChild: boolean;
  age?: number;
  allergies: string[]; // puede incluir "Otro: X"
  attending: boolean;
  createdAt: string;
};

type AdultForm = {
  fullName: string;
  age?: number;
  allergies: Allergy[];
  customAllergy?: string;
};

type ChildForm = {
  fullName: string;
  age?: number;
  allergies: Allergy[];
  customAllergy?: string;
};

function uuid() {
  // navegadores modernos ya tienen crypto.randomUUID()
  if ("randomUUID" in crypto) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY = "wedding.guests";

/**
 * API mínima para "tarjetas" guardadas globalmente
 */
function loadCards(): GuestCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x === "object");
  } catch {
    return [];
  }
}

function saveCards(cards: GuestCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  // Notificar al resto de la app que hay cambios, por si en otras vistas se listan tarjetas
  window.dispatchEvent(new CustomEvent("wedding.guests.updated"));
}

/**
 * Página Confirmar Asistencia
 */
export default function ConfirmarAsistenciaPage() {
  const [attending, setAttending] = useState<"si" | "no">("si");
  const [numAdults, setNumAdults] = useState<number>(1);
  const [numChildren, setNumChildren] = useState<number>(0);

  const [adults, setAdults] = useState<AdultForm[]>([{ fullName: "", age: undefined, allergies: ["Ninguna"] }]);
  const [children, setChildren] = useState<ChildForm[]>([]);

  const householdId = useMemo(() => uuid(), []);

  // Ajustar arrays cuando cambia el número
  useEffect(() => {
    setAdults((prev) => {
      const copy = [...prev];
      if (numAdults > copy.length) {
        while (copy.length < numAdults) copy.push({ fullName: "", age: undefined, allergies: ["Ninguna"] });
      } else if (numAdults < copy.length) {
        copy.length = Math.max(numAdults, 0);
      }
      return copy;
    });
  }, [numAdults]);

  useEffect(() => {
    setChildren((prev) => {
      const copy = [...prev];
      if (numChildren > copy.length) {
        while (copy.length < numChildren) copy.push({ fullName: "", age: undefined, allergies: ["Ninguna"] });
      } else if (numChildren < copy.length) {
        copy.length = Math.max(numChildren, 0);
      }
      return copy;
    });
  }, [numChildren]);

  function onAdultChange(idx: number, field: keyof AdultForm, value: any) {
    setAdults((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      next[idx] = item;
      return next;
    });
  }

  function onChildChange(idx: number, field: keyof ChildForm, value: any) {
    setChildren((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      next[idx] = item;
      return next;
    });
  }

  function onSelectAllergy<T extends AdultForm | ChildForm>(
    arr: T[],
    setArr: (updater: (prev: T[]) => T[]) => void,
    idx: number,
    nextList: Allergy[]
  ) {
    setArr((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx], allergies: nextList };
      // Si ya no está "Otro", limpiamos customAllergy
      if (!nextList.includes("Otro")) (item as any).customAllergy = undefined;
      copy[idx] = item as T;
      return copy;
    });
  }

  function makeCard(base: { fullName: string; age?: number; allergies: Allergy[]; customAllergy?: string }, isChild: boolean): GuestCard {
    const allergyLabels = base.allergies.map((a) => (a === "Otro" && base.customAllergy ? `Otro: ${base.customAllergy}` : a));
    return {
      id: uuid(),
      householdId,
      fullName: base.fullName.trim() || (isChild ? "Niño/a sin nombre" : "Invitado/a sin nombre"),
      isChild,
      age: typeof base.age === "number" ? base.age : undefined,
      allergies: allergyLabels.filter(Boolean),
      attending: attending === "si",
      createdAt: new Date().toISOString(),
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const existing = loadCards();

    // Limpiamos tarjetas existentes de este householdId para sobrescribir
    const leftovers = existing.filter((c) => c.householdId !== householdId);

    const newCards: GuestCard[] = [
      ...adults.map((a) => makeCard(a, false)),
      ...children.map((c) => makeCard(c, true)),
    ];

    saveCards([...leftovers, ...newCards]);

    alert("Asistencia guardada. Se han creado/actualizado las tarjetas de cada invitado.");
  }

  const previewCards: GuestCard[] = useMemo(() => {
    return [
      ...adults.map((a) => makeCard(a, false)),
      ...children.map((c) => makeCard(c, true)),
    ];
  }, [adults, children, attending]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Confirmar asistencia</h1>

      <form onSubmit={onSubmit}>
        <fieldset style={{ border: "1px solid #ddd", padding: 12, marginBottom: 16 }}>
          <legend>Asistencia</legend>
          <label style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="attending"
              value="si"
              checked={attending === "si"}
              onChange={() => setAttending("si")}
            />{" "}
            Sí, asistimos
          </label>
          <label>
            <input
              type="radio"
              name="attending"
              value="no"
              checked={attending === "no"}
              onChange={() => setAttending("no")}
            />{" "}
            No asistimos
          </label>
        </fieldset>

        <fieldset style={{ border: "1px solid #ddd", padding: 12, marginBottom: 16 }}>
          <legend>Número de asistentes</legend>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div>
              <label>Adultos</label>
              <input
                type="number"
                min={0}
                value={numAdults}
                onChange={(e) => setNumAdults(Math.max(0, Number(e.target.value || 0)))}
                style={{ display: "block", width: 140 }}
              />
            </div>
            <div>
              <label>Niños</label>
              <input
                type="number"
                min={0}
                value={numChildren}
                onChange={(e) => setNumChildren(Math.max(0, Number(e.target.value || 0)))}
                style={{ display: "block", width: 140 }}
              />
            </div>
          </div>
        </fieldset>

        {adults.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>Datos de adultos</h2>
            {adults.map((a, idx) => (
              <div key={`adult-${idx}`} style={{ border: "1px solid #eee", padding: 12, marginBottom: 8, borderRadius: 6 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px" }}>
                    <label>Nombre y apellidos</label>
                    <input
                      type="text"
                      value={a.fullName}
                      onChange={(e) => onAdultChange(idx, "fullName", e.target.value)}
                      style={{ display: "block", width: "100%" }}
                    />
                  </div>
                  <div style={{ width: 120 }}>
                    <label>Edad</label>
                    <input
                      type="number"
                      min={0}
                      value={a.age ?? ""}
                      onChange={(e) => onAdultChange(idx, "age", e.target.value ? Number(e.target.value) : undefined)}
                      style={{ display: "block", width: "100%" }}
                    />
                  </div>
                  <div style={{ minWidth: 220, flex: "1 1 260px" }}>
                    <label>Alergias / preferencias</label>
                    <select
                      multiple
                      value={a.allergies as string[]}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        onSelectAllergy(adults, setAdults as any, idx, Array.from(e.target.selectedOptions).map((o) => o.value as Allergy))
                      }
                      style={{ display: "block", width: "100%", minHeight: 90 }}
                    >
                      {ALLERGY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {a.allergies.includes("Otro") && (
                      <input
                        placeholder="Especifica alergia/preferencia"
                        value={a.customAllergy ?? ""}
                        onChange={(e) => onAdultChange(idx, "customAllergy", e.target.value)}
                        style={{ marginTop: 6, width: "100%" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {children.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18 }}>Datos de niños</h2>
            {children.map((c, idx) => (
              <div key={`child-${idx}`} style={{ border: "1px solid #eee", padding: 12, marginBottom: 8, borderRadius: 6 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px" }}>
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={c.fullName}
                      onChange={(e) => onChildChange(idx, "fullName", e.target.value)}
                      style={{ display: "block", width: "100%" }}
                    />
                  </div>
                  <div style={{ width: 120 }}>
                    <label>Edad</label>
                    <input
                      type="number"
                      min={0}
                      value={c.age ?? ""}
                      onChange={(e) => onChildChange(idx, "age", e.target.value ? Number(e.target.value) : undefined)}
                      style={{ display: "block", width: "100%" }}
                    />
                  </div>
                  <div style={{ minWidth: 220, flex: "1 1 260px" }}>
                    <label>Alergias</label>
                    <select
                      multiple
                      value={c.allergies as string[]}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        onSelectAllergy(children, setChildren as any, idx, Array.from(e.target.selectedOptions).map((o) => o.value as Allergy))
                      }
                      style={{ display: "block", width: "100%", minHeight: 90 }}
                    >
                      {ALLERGY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {c.allergies.includes("Otro") && (
                      <input
                        placeholder="Especifica alergia"
                        value={c.customAllergy ?? ""}
                        onChange={(e) => onChildChange(idx, "customAllergy", e.target.value)}
                        style={{ marginTop: 6, width: "100%" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <button type="submit" style={{ padding: "8px 14px" }}>
          Guardar y crear tarjetas
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Vista previa de tarjetas generadas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {previewCards.map((c) => (
          <article key={c.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <header style={{ fontWeight: 600, marginBottom: 6 }}>
              {c.fullName} {c.isChild ? "(Niño/a)" : ""}
            </header>
            <div style={{ fontSize: 14, lineHeight: 1.4 }}>
              <div>Asistencia: {c.attending ? "Sí" : "No"}</div>
              {typeof c.age === "number" && <div>Edad: {c.age}</div>}
              <div>
                Alergias:{" "}
                {c.allergies.length ? c.allergies.join(", ") : "Ninguna"}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>Tarjeta ID: {c.id.slice(0, 8)}…</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}