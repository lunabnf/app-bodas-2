import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const STORAGE_HOTELS = "wedding.hotels";
const STORAGE_VOTES = "wedding.hotels.votes";
const STORAGE_MYVOTES = "wedding.hotels.myvotes"; // set de ids marcados desde este dispositivo
function uuid() {
    const c = globalThis.crypto;
    if (c && "randomUUID" in c) {
        const maybe = c;
        if (typeof maybe.randomUUID === "function")
            return maybe.randomUUID();
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
/** ===== Persistencia ===== **/
function loadHotels() {
    try {
        const raw = localStorage.getItem(STORAGE_HOTELS);
        if (!raw)
            return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr))
            return [];
        return arr.filter((x) => x && typeof x === "object");
    }
    catch {
        return [];
    }
}
function saveHotels(hotels) {
    localStorage.setItem(STORAGE_HOTELS, JSON.stringify(hotels));
    window.dispatchEvent(new CustomEvent("wedding.hotels.updated"));
}
function loadVotes() {
    try {
        const raw = localStorage.getItem(STORAGE_VOTES);
        return raw ? JSON.parse(raw) : {};
    }
    catch {
        return {};
    }
}
function saveVotes(votes) {
    localStorage.setItem(STORAGE_VOTES, JSON.stringify(votes));
    window.dispatchEvent(new CustomEvent("wedding.hotels.updated"));
}
function loadMyVotes() {
    try {
        const raw = localStorage.getItem(STORAGE_MYVOTES);
        return new Set(raw ? JSON.parse(raw) : []);
    }
    catch {
        return new Set();
    }
}
function saveMyVotes(setIds) {
    localStorage.setItem(STORAGE_MYVOTES, JSON.stringify(Array.from(setIds)));
}
/** ===== Utilidades ===== **/
function validUrl(u) {
    try {
        const x = new URL(u);
        return !!x.protocol && !!x.host;
    }
    catch {
        return false;
    }
}
function download(filename, text) {
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
    const [isAdmin, setIsAdmin] = useState(() => {
        const raw = localStorage.getItem("wedding.hotels.admin");
        return raw ? raw === "1" : true;
    });
    useEffect(() => {
        localStorage.setItem("wedding.hotels.admin", isAdmin ? "1" : "0");
    }, [isAdmin]);
    const [hotels, setHotels] = useState(() => loadHotels());
    const [votes, setVotes] = useState(() => loadVotes());
    const [myVotes, setMyVotes] = useState(() => loadMyVotes());
    // formulario alta/edición
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        url: "",
        distanceKm: "",
        pricePerNight: "",
        notes: "",
        published: true,
    });
    const [sortBy, setSortBy] = useState("interest");
    // sincronizar con storage
    useEffect(() => saveHotels(hotels), [hotels]);
    useEffect(() => saveVotes(votes), [votes]);
    useEffect(() => saveMyVotes(myVotes), [myVotes]);
    function resetForm() {
        setEditingId(null);
        setForm({ name: "", url: "", distanceKm: "", pricePerNight: "", notes: "", published: true });
    }
    function handleSubmit(e) {
        e.preventDefault();
        const trimmed = {
            name: form.name.trim(),
            url: form.url.trim(),
            distanceKm: form.distanceKm.trim(),
            pricePerNight: form.pricePerNight.trim(),
            notes: form.notes.trim(),
        };
        if (!trimmed.name)
            return alert("Pon el nombre del hotel.");
        if (!trimmed.url || !validUrl(trimmed.url))
            return alert("URL inválida.");
        const distanceKm = trimmed.distanceKm ? Number(trimmed.distanceKm) : undefined;
        const pricePerNight = trimmed.pricePerNight ? Number(trimmed.pricePerNight) : undefined;
        if (editingId) {
            setHotels((prev) => prev.map((h) => h.id === editingId
                ? {
                    ...h,
                    name: trimmed.name,
                    url: trimmed.url,
                    distanceKm,
                    pricePerNight,
                    notes: trimmed.notes || undefined,
                    published: form.published,
                }
                : h));
        }
        else {
            const h = {
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
    function editHotel(h) {
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
    function deleteHotel(id) {
        if (!confirm("¿Borrar este hotel?"))
            return;
        setHotels((prev) => prev.filter((x) => x.id !== id));
        setVotes((prev) => {
            const rest = { ...prev };
            delete rest[id];
            return rest;
        });
        setMyVotes((prev) => {
            const copy = new Set(prev);
            copy.delete(id);
            return copy;
        });
    }
    function togglePublish(id) {
        setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, published: !h.published } : h)));
    }
    function onVote(id) {
        setMyVotes((prev) => {
            const next = new Set(prev);
            const already = next.has(id);
            if (already)
                next.delete(id);
            else
                next.add(id);
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
    function importJSON(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(String(reader.result));
                if (!Array.isArray(data))
                    return alert("Formato inválido.");
                const cleaned = data
                    .filter((x) => x && typeof x === "object")
                    .map((x) => {
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
            }
            catch {
                alert("No se pudo importar.");
            }
            finally {
                e.target.value = "";
            }
        };
        reader.readAsText(file);
    }
    function exportCSV() {
        const header = ["name", "url", "distance_km", "price_per_night", "notes", "interesados"].join(",");
        const rows = hotels.map((h) => [
            `"${h.name.replace(/"/g, '""')}"`,
            h.url,
            h.distanceKm ?? "",
            h.pricePerNight ?? "",
            h.notes ? `"${h.notes.replace(/"/g, '""')}"` : "",
            votes[h.id] ?? 0,
        ].join(","));
        download("alojamientos.csv", [header, ...rows].join("\n"));
    }
    const visibleHotels = useMemo(() => {
        const base = isAdmin ? hotels : hotels.filter((h) => h.published);
        const score = (h) => sortBy === "interest"
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
    return (_jsxs("div", { style: { maxWidth: 1000, margin: "0 auto", padding: 16 }, children: [_jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }, children: [_jsx("h1", { style: { fontSize: 24, margin: 0 }, children: "Alojamientos" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 14 }, children: [_jsx("input", { type: "checkbox", checked: isAdmin, onChange: (e) => setIsAdmin(e.target.checked) }), " Modo novios"] }), _jsxs("label", { style: { fontSize: 14 }, children: ["Ordenar por", " ", _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), children: [_jsx("option", { value: "interest", children: "Inter\u00E9s" }), _jsx("option", { value: "distance", children: "Distancia" }), _jsx("option", { value: "price", children: "Precio" }), _jsx("option", { value: "recent", children: "Recientes" })] })] })] })] }), isAdmin && (_jsxs("section", { style: { border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16 }, children: [_jsx("h2", { style: { fontSize: 18, marginTop: 0 }, children: editingId ? "Editar hotel" : "Añadir hotel" }), _jsxs("form", { onSubmit: handleSubmit, style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { children: "Nombre" }), _jsx("input", { value: form.name, onChange: (e) => setForm((s) => ({ ...s, name: e.target.value })), style: { width: "100%" } })] }), _jsxs("div", { children: [_jsx("label", { children: "URL" }), _jsx("input", { value: form.url, onChange: (e) => setForm((s) => ({ ...s, url: e.target.value })), placeholder: "https://\u2026", style: { width: "100%" } })] }), _jsxs("div", { children: [_jsx("label", { children: "Distancia (km)" }), _jsx("input", { type: "number", min: 0, step: "0.1", value: form.distanceKm, onChange: (e) => setForm((s) => ({ ...s, distanceKm: e.target.value })), style: { width: "100%" } })] }), _jsxs("div", { children: [_jsx("label", { children: "Precio/Noche (\u20AC)" }), _jsx("input", { type: "number", min: 0, step: "1", value: form.pricePerNight, onChange: (e) => setForm((s) => ({ ...s, pricePerNight: e.target.value })), style: { width: "100%" } })] }), _jsxs("div", { style: { gridColumn: "1 / -1" }, children: [_jsx("label", { children: "Notas" }), _jsx("textarea", { value: form.notes, onChange: (e) => setForm((s) => ({ ...s, notes: e.target.value })), rows: 2, style: { width: "100%" } })] }), _jsx("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [_jsx("input", { type: "checkbox", checked: form.published, onChange: (e) => setForm((s) => ({ ...s, published: e.target.checked })) }), " Publicado"] }) }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { type: "submit", children: editingId ? "Guardar cambios" : "Añadir" }), editingId && _jsx("button", { type: "button", onClick: resetForm, children: "Cancelar" })] }), _jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("button", { type: "button", onClick: exportJSON, children: "Exportar JSON" }), _jsxs("label", { style: { display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer" }, children: [_jsx("input", { type: "file", accept: "application/json", onChange: importJSON, style: { display: "none" } }), _jsx("span", { style: { border: "1px solid #ccc", padding: "6px 10px", borderRadius: 4 }, children: "Importar JSON" })] }), _jsx("button", { type: "button", onClick: exportCSV, children: "Exportar CSV" })] })] }), _jsx("div", { style: { marginTop: 16, overflowX: "auto" }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [_jsx("thead", { children: _jsxs("tr", { style: { textAlign: "left" }, children: [_jsx("th", { children: "Publicado" }), _jsx("th", { children: "Nombre" }), _jsx("th", { children: "URL" }), _jsx("th", { children: "Distancia" }), _jsx("th", { children: "Precio" }), _jsx("th", { children: "Inter\u00E9s" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [hotels.map((h) => (_jsxs("tr", { style: { borderTop: "1px solid #eee" }, children: [_jsx("td", { children: _jsx("input", { type: "checkbox", checked: h.published, onChange: () => togglePublish(h.id) }) }), _jsx("td", { children: h.name }), _jsx("td", { title: h.url, style: { maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: h.url }), _jsx("td", { children: h.distanceKm ?? "—" }), _jsx("td", { children: h.pricePerNight ?? "—" }), _jsx("td", { children: votes[h.id] ?? 0 }), _jsxs("td", { style: { whiteSpace: "nowrap" }, children: [_jsx("button", { onClick: () => editHotel(h), children: "Editar" }), " ", _jsx("button", { onClick: () => deleteHotel(h.id), children: "Borrar" })] })] }, h.id))), hotels.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { padding: 8, color: "#666" }, children: "Sin hoteles a\u00FAn." }) }))] })] }) })] })), _jsxs("section", { children: [!isAdmin && _jsx("p", { style: { marginTop: 0, color: "#555" }, children: "Elige tu opci\u00F3n preferida. Puedes marcar \u201CMe interesa\u201D." }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }, children: visibleHotels.map((h) => (_jsxs("article", { style: { border: "1px solid #ddd", borderRadius: 8, padding: 12 }, children: [_jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }, children: [_jsx("strong", { children: h.name }), _jsxs("span", { style: { fontSize: 12, color: "#666" }, children: [votes[h.id] ?? 0, " interesados"] })] }), _jsxs("div", { style: { fontSize: 14, lineHeight: 1.4 }, children: [h.pricePerNight != null && _jsxs("div", { children: ["Precio aprox.: ", h.pricePerNight, " \u20AC/noche"] }), h.distanceKm != null && _jsxs("div", { children: ["Distancia: ", h.distanceKm, " km"] }), h.notes && _jsx("div", { style: { marginTop: 6 }, children: h.notes })] }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [_jsx("a", { href: h.url, target: "_blank", rel: "noreferrer", style: { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none" }, children: "Abrir web" }), !isAdmin && (_jsx("button", { onClick: () => onVote(h.id), "aria-pressed": myVotes.has(h.id), style: {
                                                padding: "6px 10px",
                                                borderRadius: 4,
                                                border: "1px solid #ccc",
                                                background: myVotes.has(h.id) ? "#e6ffe6" : "transparent",
                                            }, children: myVotes.has(h.id) ? "Me interesa ✓" : "Me interesa" }))] })] }, h.id))) })] })] }));
}
