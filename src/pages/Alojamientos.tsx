import { useEffect, useMemo, useState, ChangeEvent } from "react";
// cspell:ignore Alojamientos invitados MYVOTES myvotes marcados dispositivo Persistencia Utilidades Página novios formulario edición ordenación sincronizar inválida inválido Importado interes  interesados Recientes Editar Añadir Nombre Distancia Precio Noche Notas Publicado Guardar cambios alojamientos aprox noche hoteles

/** ===== Tipos ===== **/
type HotelOption = {
  id: string;
  name: string;
  url: string;
  distanceKm?: number;
  pricePerNight?: number;
  notes?: string;
  published: boolean; // visible a invitados
  createdAt: string;
};

type Votes = Record<string, number>;

const STORAGE_HOTELS = "wedding.hotels";
const STORAGE_VOTES = "wedding.hotels.votes";
const STORAGE_MYVOTES = "wedding.hotels.myvotes"; // set de ids marcados desde este dispositivo

function uuid(): string {
  const c: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (c && "randomUUID" in c) {
    const maybe = c as Crypto & { randomUUID?: () => string };
    if (typeof maybe.randomUUID === "function") return maybe.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** ===== Persistencia ===== **/
function loadHotels(): HotelOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_HOTELS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x === "object");
  } catch {
    return [];
  }
}
function saveHotels(hotels: HotelOption[]) {
  localStorage.setItem(STORAGE_HOTELS, JSON.stringify(hotels));
  window.dispatchEvent(new CustomEvent("wedding.hotels.updated"));
}

function loadVotes(): Votes {
  try {
    const raw = localStorage.getItem(STORAGE_VOTES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveVotes(votes: Votes) {
  localStorage.setItem(STORAGE_VOTES, JSON.stringify(votes));
  window.dispatchEvent(new CustomEvent("wedding.hotels.updated"));
}

function loadMyVotes(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_MYVOTES);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}
function saveMyVotes(setIds: Set<string>) {
  localStorage.setItem(STORAGE_MYVOTES, JSON.stringify(Array.from(setIds)));
}

/** ===== Utilidades ===== **/
function validUrl(u: string): boolean {
  try {
    const x = new URL(u);
    return !!x.protocol && !!x.host;
  } catch {
    return false;
  }
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** ===== Página ===== **/
export default function AlojamientosPage() {
  // Hasta tener auth real, “modo novios” con switch local
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const raw = localStorage.getItem("wedding.hotels.admin");
    return raw ? raw === "1" : true;
  });
  useEffect(() => {
    localStorage.setItem("wedding.hotels.admin", isAdmin ? "1" : "0");
  }, [isAdmin]);

  const [hotels, setHotels] = useState<HotelOption[]>(() => loadHotels());
  const [votes, setVotes] = useState<Votes>(() => loadVotes());
  const [myVotes, setMyVotes] = useState<Set<string>>(() => loadMyVotes());

  // formulario alta/edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    url: string;
    distanceKm: string;
    pricePerNight: string;
    notes: string;
    published: boolean;
  }>({
    name: "",
    url: "",
    distanceKm: "",
    pricePerNight: "",
    notes: "",
    published: true,
  });

  // ordenación
  type SortKey = "interest" | "distance" | "price" | "recent";
  const [sortBy, setSortBy] = useState<SortKey>("interest");

  // sincronizar con storage
  useEffect(() => saveHotels(hotels), [hotels]);
  useEffect(() => saveVotes(votes), [votes]);
  useEffect(() => saveMyVotes(myVotes), [myVotes]);

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", url: "", distanceKm: "", pricePerNight: "", notes: "", published: true });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = {
      name: form.name.trim(),
      url: form.url.trim(),
      distanceKm: form.distanceKm.trim(),
      pricePerNight: form.pricePerNight.trim(),
      notes: form.notes.trim(),
    };
    if (!trimmed.name) return alert("Pon el nombre del hotel.");
    if (!trimmed.url || !validUrl(trimmed.url)) return alert("URL inválida.");
    const distanceKm = trimmed.distanceKm ? Number(trimmed.distanceKm) : undefined;
    const pricePerNight = trimmed.pricePerNight ? Number(trimmed.pricePerNight) : undefined;

    if (editingId) {
      setHotels((prev) =>
        prev.map((h) =>
          h.id === editingId
            ? {
                ...h,
                name: trimmed.name,
                url: trimmed.url,
                distanceKm,
                pricePerNight,
                notes: trimmed.notes || undefined,
                published: form.published,
              }
            : h
        )
      );
    } else {
      const h: HotelOption = {
        id: uuid(),
        name: trimmed.name,
        url: trimmed.url,
        distanceKm,
        pricePerNight,
        notes: trimmed.notes || undefined,
        published: form.published,
        createdAt: new Date().toISOString(),
      };
      setHotels((prev) => [h, ...prev]);
    }
    resetForm();
  }

  function editHotel(h: HotelOption) {
    setEditingId(h.id);
    setForm({
      name: h.name,
      url: h.url,
      distanceKm: h.distanceKm != null ? String(h.distanceKm) : "",
      pricePerNight: h.pricePerNight != null ? String(h.pricePerNight) : "",
      notes: h.notes ?? "",
      published: h.published,
    });
  }

  function deleteHotel(id: string) {
    if (!confirm("¿Borrar este hotel?")) return;
    setHotels((prev) => prev.filter((x) => x.id !== id));
    setVotes((prev) => {
      const rest: Record<string, number> = { ...prev };
      delete rest[id];
      return rest;
    });
    setMyVotes((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  }

  function togglePublish(id: string) {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, published: !h.published } : h)));
  }

  function onVote(id: string) {
    setMyVotes((prev) => {
      const next = new Set(prev);
      const already = next.has(id);
      if (already) next.delete(id);
      else next.add(id);

      setVotes((v) => {
        const current = v[id] || 0;
        const delta = already ? -1 : 1;
        return { ...v, [id]: Math.max(0, current + delta) };
      });
      return next;
    });
  }

  function exportJSON() {
    download("alojamientos.json", JSON.stringify(hotels, null, 2));
  }
  function importJSON(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) return alert("Formato inválido.");
        const cleaned: HotelOption[] = data
          .filter((x) => x && typeof x === "object")
          .map((x: Record<string, unknown>) => {
            const id = typeof x["id"] === "string" ? x["id"] : uuid();
            const name = typeof x["name"] === "string" ? x["name"] : "Hotel sin nombre";
            const url = typeof x["url"] === "string" ? x["url"] : "";
            const distanceKm = typeof x["distanceKm"] === "number" ? x["distanceKm"] : undefined;
            const pricePerNight = typeof x["pricePerNight"] === "number" ? x["pricePerNight"] : undefined;
            const notes = typeof x["notes"] === "string" ? x["notes"] : undefined;
            const published = typeof x["published"] === "boolean" ? x["published"] : true;
            const createdAt = typeof x["createdAt"] === "string" ? x["createdAt"] : new Date().toISOString();
            return { id, name, url, distanceKm, pricePerNight, notes, published, createdAt };
          });
        setHotels(cleaned);
        alert("Importado.");
      } catch {
        alert("No se pudo importar.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function exportCSV() {
    const header = ["name", "url", "distance_km", "price_per_night", "notes", "interesados"].join(",");
    const rows = hotels.map((h) =>
      [
        `"${h.name.replace(/"/g, '""')}"`,
        h.url,
        h.distanceKm ?? "",
        h.pricePerNight ?? "",
        h.notes ? `"${h.notes.replace(/"/g, '""')}"` : "",
        votes[h.id] ?? 0,
      ].join(",")
    );
    download("alojamientos.csv", [header, ...rows].join("\n"));
  }

  const visibleHotels = useMemo(() => {
    const base = isAdmin ? hotels : hotels.filter((h) => h.published);
    const score = (h: HotelOption) =>
      sortBy === "interest"
        ? -(votes[h.id] ?? 0)
        : sortBy === "distance"
        ? (h.distanceKm ?? Number.POSITIVE_INFINITY)
        : sortBy === "price"
        ? (h.pricePerNight ?? Number.POSITIVE_INFINITY)
        : -new Date(h.createdAt).getTime();

    return [...base].sort((a, b) => {
      const sa = score(a);
      const sb = score(b);
      return sa === sb ? a.name.localeCompare(b.name) : sa < sb ? -1 : 1;
    });
  }, [hotels, votes, isAdmin, sortBy]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Alojamientos</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} /> Modo novios
          </label>
          <label style={{ fontSize: 14 }}>
            Ordenar por{" "}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
              <option value="interest">Interés</option>
              <option value="distance">Distancia</option>
              <option value="price">Precio</option>
              <option value="recent">Recientes</option>
            </select>
          </label>
        </div>
      </header>

      {isAdmin && (
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>{editingId ? "Editar hotel" : "Añadir hotel"}</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Nombre</label>
              <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div>
              <label>URL</label>
              <input value={form.url} onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))} placeholder="https://…" style={{ width: "100%" }} />
            </div>
            <div>
              <label>Distancia (km)</label>
              <input type="number" min={0} step="0.1" value={form.distanceKm} onChange={(e) => setForm((s) => ({ ...s, distanceKm: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div>
              <label>Precio/Noche (€)</label>
              <input type="number" min={0} step="1" value={form.pricePerNight} onChange={(e) => setForm((s) => ({ ...s, pricePerNight: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Notas</label>
              <textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} rows={2} style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={form.published} onChange={(e) => setForm((s) => ({ ...s, published: e.target.checked }))} /> Publicado
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">{editingId ? "Guardar cambios" : "Añadir"}</button>
              {editingId && <button type="button" onClick={resetForm}>Cancelar</button>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button type="button" onClick={exportJSON}>Exportar JSON</button>
              <label style={{ display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                <input type="file" accept="application/json" onChange={importJSON} style={{ display: "none" }} />
                <span style={{ border: "1px solid #ccc", padding: "6px 10px", borderRadius: 4 }}>Importar JSON</span>
              </label>
              <button type="button" onClick={exportCSV}>Exportar CSV</button>
            </div>
          </form>

          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th>Publicado</th>
                  <th>Nombre</th>
                  <th>URL</th>
                  <th>Distancia</th>
                  <th>Precio</th>
                  <th>Interés</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.id} style={{ borderTop: "1px solid #eee" }}>
                    <td><input type="checkbox" checked={h.published} onChange={() => togglePublish(h.id)} /></td>
                    <td>{h.name}</td>
                    <td title={h.url} style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.url}</td>
                    <td>{h.distanceKm ?? "—"}</td>
                    <td>{h.pricePerNight ?? "—"}</td>
                    <td>{votes[h.id] ?? 0}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => editHotel(h)}>Editar</button>{" "}
                      <button onClick={() => deleteHotel(h.id)}>Borrar</button>
                    </td>
                  </tr>
                ))}
                {hotels.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 8, color: "#666" }}>Sin hoteles aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        {!isAdmin && <p style={{ marginTop: 0, color: "#555" }}>Elige tu opción preferida. Puedes marcar “Me interesa”.</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {visibleHotels.map((h) => (
            <article key={h.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <strong>{h.name}</strong>
                <span style={{ fontSize: 12, color: "#666" }}>{votes[h.id] ?? 0} interesados</span>
              </header>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                {h.pricePerNight != null && <div>Precio aprox.: {h.pricePerNight} €/noche</div>}
                {h.distanceKm != null && <div>Distancia: {h.distanceKm} km</div>}
                {h.notes && <div style={{ marginTop: 6 }}>{h.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <a href={h.url} target="_blank" rel="noreferrer" style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none" }}>Abrir web</a>
                {!isAdmin && (
                  <button
                    onClick={() => onVote(h.id)}
                    aria-pressed={myVotes.has(h.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: myVotes.has(h.id) ? "#e6ffe6" : "transparent",
                    }}
                  >
                    {myVotes.has(h.id) ? "Me interesa ✓" : "Me interesa"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}