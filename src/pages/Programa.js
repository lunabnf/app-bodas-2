import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const KEY = "program_schedule_v1";
function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw)
            return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    }
    catch {
        return [];
    }
}
function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
}
function isTimeValid(v) {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v.trim());
}
export default function Programa() {
    const [items, setItems] = useState(() => load());
    const [form, setForm] = useState({ time: "", title: "", notes: "" });
    // Persistencia
    useEffect(() => { save(items); }, [items]);
    // Orden por hora ascendente conservando orden de inserción para igualdades
    const sorted = useMemo(() => {
        return [...items].sort((a, b) => a.time.localeCompare(b.time));
    }, [items]);
    function addItem() {
        if (!form.title.trim())
            return;
        if (!isTimeValid(form.time))
            return;
        const it = { id: crypto.randomUUID(), time: form.time.trim(), title: form.title.trim(), notes: form.notes.trim() || undefined };
        setItems((prev) => [...prev, it]);
        setForm({ time: "", title: "", notes: "" });
    }
    function removeItem(id) {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }
    function updateField(id, patch) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    }
    function move(id, dir) {
        setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === id);
            if (idx < 0)
                return prev;
            const j = idx + dir;
            if (j < 0 || j >= prev.length)
                return prev;
            const copy = [...prev];
            const tmp = copy[idx];
            copy[idx] = copy[j];
            copy[j] = tmp;
            return copy;
        });
    }
    function exportJSON() {
        const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "programa-boda.json";
        a.click();
        URL.revokeObjectURL(url);
    }
    function onImport(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(String(reader.result));
                if (Array.isArray(data)) {
                    // sanitizar mínimo
                    const parsed = data
                        .filter((x) => x && typeof x === "object")
                        .map((x) => {
                        const id = x["id"];
                        const time = x["time"];
                        const title = x["title"];
                        const notes = x["notes"];
                        return {
                            id: typeof id === "string" && id.length > 0 ? id : crypto.randomUUID(),
                            time: typeof time === "string" && time.length > 0 ? time : "00:00",
                            title: typeof title === "string" ? title : "",
                            notes: typeof notes === "string"
                                ? notes
                                : notes != null
                                    ? String(notes)
                                    : undefined,
                        };
                    });
                    setItems(parsed);
                }
            }
            catch { /* noop */ }
        };
        reader.readAsText(file);
        // reset input para poder volver a importar el mismo fichero si se quiere
        e.currentTarget.value = "";
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Programa de la boda" }), _jsx("p", { className: "text-sm text-neutral-400", children: "Edita aqu\u00ED los hitos y horarios de la ceremonia y celebraci\u00F3n. Se guarda autom\u00E1ticamente en este dispositivo." })] }), _jsxs("div", { className: "rounded-xl border border-white/10 p-4 bg-white/5", children: [_jsx("h2", { className: "font-semibold mb-3", children: "A\u00F1adir hito" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-6 gap-3", children: [_jsx("input", { placeholder: "HH:MM", value: form.time, onChange: (e) => setForm((f) => ({ ...f, time: e.target.value })), className: "sm:col-span-1 w-full p-2 bg-neutral-800 rounded" }), _jsx("input", { placeholder: "T\u00EDtulo (p. ej. Llegada invitados)", value: form.title, onChange: (e) => setForm((f) => ({ ...f, title: e.target.value })), className: "sm:col-span-3 w-full p-2 bg-neutral-800 rounded" }), _jsx("input", { placeholder: "Notas (opcional)", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), className: "sm:col-span-2 w-full p-2 bg-neutral-800 rounded" })] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { onClick: addItem, disabled: !isTimeValid(form.time) || !form.title.trim(), className: "px-3 py-2 bg-white text-black rounded disabled:opacity-40", children: "A\u00F1adir" }), _jsx("span", { className: "text-xs text-neutral-400 self-center", children: "Formato de hora 24h: HH:MM" })] })] }), _jsx("div", { className: "space-y-3", children: sorted.length === 0 ? (_jsx("p", { className: "text-neutral-400", children: "A\u00FAn no hay hitos. A\u00F1ade el primero arriba." })) : (sorted.map((it, idx) => (_jsxs("div", { className: "rounded-xl border border-white/10 p-3 bg-white/5", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-12 gap-2 items-center", children: [_jsx("input", { value: it.time, onChange: (e) => updateField(it.id, { time: e.target.value }), className: "sm:col-span-2 w-full p-2 bg-neutral-800 rounded", "aria-label": "Hora" }), _jsx("input", { value: it.title, onChange: (e) => updateField(it.id, { title: e.target.value }), className: "sm:col-span-5 w-full p-2 bg-neutral-800 rounded", "aria-label": "T\u00EDtulo" }), _jsx("input", { value: it.notes ?? "", onChange: (e) => updateField(it.id, { notes: e.target.value }), className: "sm:col-span-3 w-full p-2 bg-neutral-800 rounded", "aria-label": "Notas" }), _jsxs("div", { className: "sm:col-span-2 flex gap-2 justify-end", children: [_jsx("button", { onClick: () => move(it.id, -1), disabled: idx === 0, title: "Subir", className: "px-2 py-1 bg-neutral-800 rounded disabled:opacity-40", children: "\u25B2" }), _jsx("button", { onClick: () => move(it.id, 1), disabled: idx === sorted.length - 1, title: "Bajar", className: "px-2 py-1 bg-neutral-800 rounded disabled:opacity-40", children: "\u25BC" }), _jsx("button", { onClick: () => removeItem(it.id), title: "Eliminar", className: "px-2 py-1 bg-red-500/90 text-white rounded", children: "\u2715" })] })] }), !isTimeValid(it.time) && (_jsx("p", { className: "text-xs text-red-400 mt-1", children: "Hora inv\u00E1lida. Usa HH:MM en formato 24h." }))] }, it.id)))) }), _jsxs("div", { className: "flex flex-wrap gap-2 pt-2", children: [_jsx("button", { onClick: exportJSON, className: "px-3 py-2 bg-neutral-800 rounded", children: "Exportar JSON" }), _jsxs("label", { className: "px-3 py-2 bg-neutral-800 rounded cursor-pointer", children: ["Importar JSON", _jsx("input", { type: "file", accept: "application/json", className: "hidden", onChange: onImport })] }), _jsx("button", { onClick: () => setItems([]), className: "px-3 py-2 bg-neutral-800 rounded", children: "Vaciar" })] })] }));
}
