import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
function getConfirmedGuestsFallback() {
    try {
        const fromWindow = globalThis.__APP_STATE__?.guests?.confirmed;
        if (Array.isArray(fromWindow))
            return normalize(fromWindow);
    }
    catch { /* noop */ }
    try {
        const raw = localStorage.getItem("confirmedGuests");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed))
                return normalize(parsed);
        }
    }
    catch { /* noop */ }
    return [];
}
function normalize(items) {
    return (Array.isArray(items) ? items : [])
        .filter(Boolean)
        .map((g, i) => {
        const obj = g;
        return {
            id: String(obj.id ?? obj.uid ?? obj.email ?? i),
            nombre: String(obj.nombre ?? obj.name ?? obj.fullName ?? obj.alias ?? "Invitado"),
            mesa: obj.mesa ?? null,
        };
    });
}
const ZONE_LABEL = {
    sinAsignar: "Sin asignar",
    izquierda: "Bancos izquierda",
    derecha: "Bancos derecha",
};
export default function AsientosCeremonia() {
    const [zones, setZones] = useState({ sinAsignar: [], izquierda: [], derecha: [] });
    const total = useMemo(() => zones.sinAsignar.length + zones.izquierda.length + zones.derecha.length, [zones]);
    // Cargar confirmados sólo una vez.
    useEffect(() => {
        const confirmed = getConfirmedGuestsFallback();
        setZones({ sinAsignar: confirmed, izquierda: [], derecha: [] });
    }, []);
    // Drag & Drop nativo HTML5 sin dependencias
    function onDragStart(e, guest) {
        e.dataTransfer.setData("application/guest-id", guest.id);
        e.dataTransfer.effectAllowed = "move";
    }
    function onDropZone(e, zone) {
        e.preventDefault();
        const id = e.dataTransfer.getData("application/guest-id");
        if (!id)
            return;
        setZones(prev => {
            // quitar de cualquier zona
            const next = { sinAsignar: [], izquierda: [], derecha: [] };
            let moving;
            Object.keys(prev).forEach(k => {
                prev[k].forEach(g => {
                    if (g.id === id)
                        moving = g;
                    else
                        next[k].push(g);
                });
            });
            if (moving)
                next[zone].push(moving);
            return next;
        });
    }
    function allowDrop(e) {
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
    return (_jsxs("div", { className: "p-4 space-y-6", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Asientos de la ceremonia" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: reset, className: "px-3 py-1 rounded border text-sm", children: "Reiniciar" }), _jsx("button", { onClick: exportarPlan, className: "px-3 py-1 rounded border text-sm", children: "Exportar JSON" })] })] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Arrastra los invitados confirmados a izquierda o derecha. Las rutas y datos reales se pueden conectar al mismo origen que el m\u00F3dulo ", _jsx("strong", { children: "Mesas" }), "."] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: ["sinAsignar", "izquierda", "derecha"].map(zone => (_jsxs("section", { className: "border rounded-lg", children: [_jsxs("div", { className: "px-3 py-2 border-b bg-gray-50 font-medium", children: [ZONE_LABEL[zone], " (", zones[zone].length, ")"] }), _jsxs("div", { className: "p-3 min-h-[200px] flex flex-col gap-2", onDragOver: allowDrop, onDrop: e => onDropZone(e, zone), children: [zones[zone].length === 0 && (_jsx("div", { className: "text-sm text-gray-400 select-none", children: "Vac\u00EDo" })), zones[zone].map(g => (_jsx("div", { draggable: true, onDragStart: e => onDragStart(e, g), className: "px-3 py-2 rounded border bg-white shadow-sm cursor-grab active:cursor-grabbing", title: g.nombre, children: g.nombre }, g.id)))] })] }, zone))) }), _jsxs("footer", { className: "text-xs text-gray-400", children: ["Consejo: si ya tienes un selector o tarjeta de invitado reutilizable en ", _jsx("em", { children: "Mesas" }), ", sustituye el div del invitado por ese componente para unificar estilo."] })] }));
}
