import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { guardarSolicitudAlojamiento, obtenerAlojamientos, obtenerSolicitudAlojamientoPorInvitado, } from "../services/alojamientosService";
import { registrarActividad } from "../services/actividadService";
import { useAuth } from "../store/useAuth";
export default function AlojamientosPage() {
    const [alojamientos, setAlojamientos] = useState([]);
    const [needsLodging, setNeedsLodging] = useState(false);
    const [selectedLodgingId, setSelectedLodgingId] = useState("");
    const [notes, setNotes] = useState("");
    const [saved, setSaved] = useState(false);
    const { invitado } = useAuth();
    useEffect(() => {
        void (async () => {
            const data = await obtenerAlojamientos();
            setAlojamientos(data || []);
            if (!invitado)
                return;
            const request = await obtenerSolicitudAlojamientoPorInvitado(invitado.token);
            if (!request)
                return;
            setNeedsLodging(request.needsLodging);
            setSelectedLodgingId(request.lodgingId ?? "");
            setNotes(request.notes ?? "");
        })();
    }, [invitado]);
    const guardarSolicitud = async () => {
        if (!invitado)
            return;
        await guardarSolicitudAlojamiento({
            id: `${invitado.token}-lodging`,
            guestToken: invitado.token,
            guestName: invitado.nombre,
            lodgingId: needsLodging ? selectedLodgingId || null : null,
            needsLodging,
            ...(notes.trim() ? { notes: notes.trim() } : {}),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        await registrarActividad({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            tipo: "alojamiento_solicitud",
            mensaje: `${invitado.nombre} ha actualizado su solicitud de alojamiento`,
            tokenInvitado: invitado.token,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };
    return (_jsxs("div", { className: "text-white p-6 space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Alojamiento" }), alojamientos.length === 0 && (_jsx("p", { className: "opacity-70", children: "No hay alojamientos disponibles todav\u00EDa." })), _jsx("div", { className: "space-y-4", children: alojamientos.map((item) => (_jsxs("div", { className: "p-4 bg-white/10 border border-white/20 rounded-lg", children: [_jsx("p", { className: "text-xl font-semibold", children: item.nombre }), item.direccion ? _jsx("p", { className: "opacity-80", children: item.direccion }) : null, item.notas ? _jsx("p", { className: "mt-1 opacity-70", children: item.notas }) : null, item.link ? (_jsx("a", { href: item.link, target: "_blank", rel: "noreferrer", onClick: () => {
                                if (invitado) {
                                    void registrarActividad({
                                        id: crypto.randomUUID(),
                                        timestamp: Date.now(),
                                        tipo: "alojamiento_consulta",
                                        mensaje: `${invitado.nombre} ha abierto el alojamiento: ${item.nombre}`,
                                        tokenInvitado: invitado.token,
                                    });
                                }
                            }, className: "text-blue-300 underline block mt-2", children: "Ver enlace" })) : null] }, item.id))) }), invitado ? (_jsxs("section", { className: "rounded-lg border border-white/20 bg-white/10 p-4 space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold", children: "Tu solicitud de alojamiento" }), _jsx("p", { className: "opacity-70 text-sm", children: "Los novios ver\u00E1n esta respuesta en el panel de administraci\u00F3n." })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: needsLodging, onChange: () => setNeedsLodging(true) }), "Necesito alojamiento"] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: !needsLodging, onChange: () => setNeedsLodging(false) }), "No necesito alojamiento"] })] }), needsLodging ? (_jsxs("select", { className: "w-full rounded-md bg-black/30 border border-white/20 p-2", value: selectedLodgingId, onChange: (e) => setSelectedLodgingId(e.target.value), children: [_jsx("option", { value: "", children: "Sin preferencia concreta" }), alojamientos.map((item) => (_jsx("option", { value: item.id, children: item.nombre }, item.id)))] })) : null, _jsx("textarea", { className: "w-full rounded-md bg-black/30 border border-white/20 p-2", placeholder: "Noches, presupuesto aproximado, tipo de habitaci\u00F3n, etc.", value: notes, onChange: (e) => setNotes(e.target.value) }), saved ? _jsx("p", { className: "text-sm text-green-300", children: "Solicitud guardada." }) : null, _jsx("button", { type: "button", onClick: () => void guardarSolicitud(), className: "bg-pink-400 text-black px-4 py-2 rounded", children: "Guardar solicitud" })] })) : (_jsx("p", { className: "text-sm opacity-70", children: "Identif\u00EDcate como invitado para indicar si necesitas alojamiento." }))] }));
}
