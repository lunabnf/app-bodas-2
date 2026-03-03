import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { obtenerInvitados } from "../services/invitadosService";
const ZONE_LABEL = {
    sinAsignar: "Sin asignar",
    izquierda: "Bancos izquierda",
    derecha: "Bancos derecha",
};
function getConfirmedGuests(guests) {
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
    const [confirmedGuests, setConfirmedGuests] = useState([]);
    const [zones, setZones] = useState({
        sinAsignar: [],
        izquierda: [],
        derecha: [],
    });
    const total = useMemo(() => zones.sinAsignar.length + zones.izquierda.length + zones.derecha.length, [zones]);
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
    function onDragStart(event, guest) {
        event.dataTransfer.setData("application/guest-id", guest.id);
        event.dataTransfer.effectAllowed = "move";
    }
    function onDropZone(event, zone) {
        event.preventDefault();
        const id = event.dataTransfer.getData("application/guest-id");
        if (!id)
            return;
        setZones((prev) => {
            const next = { sinAsignar: [], izquierda: [], derecha: [] };
            let moving = null;
            Object.keys(prev).forEach((key) => {
                prev[key].forEach((guest) => {
                    if (guest.id === id) {
                        moving = guest;
                    }
                    else {
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
    function allowDrop(event) {
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
    return (_jsxs("section", { className: "space-y-6 px-4 py-6", children: [_jsxs("div", { className: "app-surface p-6 sm:p-8", children: [_jsx("p", { className: "app-kicker", children: "Participaci\u00F3n" }), _jsx("h1", { className: "app-page-title mt-4", children: "Asientos de la ceremonia" }), _jsx("p", { className: "mt-3 app-subtitle", children: "Organiza a los invitados confirmados por zonas y exporta el reparto para revisarlo con calma." })] }), _jsxs("div", { className: "app-panel flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5", children: [_jsxs("p", { className: "text-sm text-[var(--app-muted)]", children: ["Invitados confirmados cargados: ", _jsx("strong", { children: confirmedGuests.length })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { onClick: reset, className: "app-button-secondary px-4 py-2 text-sm", children: "Reiniciar" }), _jsx("button", { onClick: exportarPlan, className: "app-button-primary px-4 py-2 text-sm", children: "Exportar JSON" })] })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-3", children: ["sinAsignar", "izquierda", "derecha"].map((zone) => (_jsxs("section", { className: "app-panel overflow-hidden", children: [_jsxs("div", { className: "border-b border-[var(--app-line)] px-4 py-3 font-semibold text-[var(--app-ink)]", children: [ZONE_LABEL[zone], " (", zones[zone].length, ")"] }), _jsx("div", { className: "flex min-h-[240px] flex-col gap-2 p-4", onDragOver: allowDrop, onDrop: (event) => onDropZone(event, zone), children: zones[zone].length === 0 ? (_jsx("div", { className: "rounded-[18px] border border-dashed border-[var(--app-line)] bg-white/50 px-4 py-6 text-sm text-[var(--app-muted)]", children: "Vac\u00EDo" })) : (zones[zone].map((guest) => (_jsx("div", { draggable: true, onDragStart: (event) => onDragStart(event, guest), className: "rounded-[18px] border border-[var(--app-line)] bg-white/80 px-4 py-3 text-sm font-medium text-[var(--app-ink)] shadow-[var(--app-shadow-soft)] cursor-grab active:cursor-grabbing", title: guest.nombre, children: guest.nombre }, guest.id)))) })] }, zone))) }), _jsx("p", { className: "text-xs text-[var(--app-muted)]", children: "Esta vista usa los invitados confirmados reales del sistema, no un estado paralelo de demo." })] }));
}
