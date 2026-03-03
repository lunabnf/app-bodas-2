import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { borrarSolicitudTransporte, guardarSolicitudTransporte, obtenerSolicitudesTransportePorInvitado, obtenerTransportes, } from "../services/transporteService";
import { registrarActividad } from "../services/actividadService";
import { useAuth } from "../store/useAuth";
export default function DesplazamientosPage() {
    const [items, setItems] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [seatInputs, setSeatInputs] = useState({});
    const [notesInputs, setNotesInputs] = useState({});
    const { invitado } = useAuth();
    useEffect(() => {
        void (async () => {
            const options = await obtenerTransportes();
            setItems(options || []);
            if (!invitado)
                return;
            const guestRequests = await obtenerSolicitudesTransportePorInvitado(invitado.token);
            setSolicitudes(guestRequests);
            setSeatInputs(guestRequests.reduce((acc, request) => {
                acc[request.transportId] = request.seats;
                return acc;
            }, {}));
            setNotesInputs(guestRequests.reduce((acc, request) => {
                acc[request.transportId] = request.notes ?? "";
                return acc;
            }, {}));
        })();
    }, [invitado]);
    const getSolicitud = (transportId) => solicitudes.find((item) => item.transportId === transportId);
    const guardarSolicitud = async (item) => {
        if (!invitado)
            return;
        const seats = Math.max(1, seatInputs[item.id] || getSolicitud(item.id)?.seats || 1);
        const currentNotes = notesInputs[item.id];
        const request = {
            id: `${invitado.token}-${item.id}`,
            guestToken: invitado.token,
            guestName: invitado.nombre,
            transportId: item.id,
            seats,
            ...(currentNotes?.trim() ? { notes: currentNotes.trim() } : {}),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await guardarSolicitudTransporte(request);
        setSolicitudes((current) => {
            const next = current.filter((entry) => entry.transportId !== item.id);
            return [...next, request];
        });
        await registrarActividad({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            tipo: "transporte_solicitud",
            mensaje: `${invitado.nombre} ha solicitado ${seats} plaza(s) en ${item.nombre}`,
            tokenInvitado: invitado.token,
        });
    };
    const cancelarSolicitud = async (transportId) => {
        if (!invitado)
            return;
        await borrarSolicitudTransporte(invitado.token, transportId);
        setSolicitudes((current) => current.filter((entry) => entry.transportId !== transportId));
        await registrarActividad({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            tipo: "transporte_solicitud",
            mensaje: `${invitado.nombre} ha cancelado una solicitud de transporte`,
            tokenInvitado: invitado.token,
        });
    };
    return (_jsxs("div", { className: "text-white p-6 space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Desplazamientos" }), items.length === 0 && (_jsx("p", { className: "opacity-70", children: "No hay transportes disponibles todav\u00EDa." })), _jsx("div", { className: "space-y-4", children: items.map((item) => {
                    const solicitud = getSolicitud(item.id);
                    return (_jsxs("div", { className: "p-4 bg-white/10 border border-white/20 rounded-lg", children: [_jsx("p", { className: "text-xl font-semibold", children: item.nombre }), _jsxs("p", { className: "opacity-80", children: [item.origen, " \u2192 ", item.destino] }), _jsxs("p", { className: "opacity-80", children: ["Hora: ", item.hora] }), _jsxs("p", { className: "opacity-80", children: ["Capacidad: ", item.capacidad] }), item.notas ? _jsx("p", { className: "italic opacity-70 mt-1", children: item.notas }) : null, invitado ? (_jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [_jsx("input", { type: "number", min: 1, max: item.capacidad || 10, value: seatInputs[item.id] || solicitud?.seats || 1, onChange: (e) => setSeatInputs((current) => ({
                                                    ...current,
                                                    [item.id]: Math.max(1, Number(e.target.value || 1)),
                                                })), className: "rounded-md bg-black/30 border border-white/20 p-2", placeholder: "Plazas" }), _jsx("input", { type: "text", value: notesInputs[item.id] ?? solicitud?.notes ?? "", onChange: (e) => setNotesInputs((current) => ({
                                                    ...current,
                                                    [item.id]: e.target.value,
                                                })), className: "rounded-md bg-black/30 border border-white/20 p-2", placeholder: "Notas" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => void guardarSolicitud(item), className: "bg-blue-600 px-4 py-2 rounded", children: solicitud ? "Actualizar solicitud" : "Solicitar plazas" }), solicitud ? (_jsx("button", { onClick: () => void cancelarSolicitud(item.id), className: "bg-white/10 border border-white/20 px-4 py-2 rounded", children: "Cancelar" })) : null] }), solicitud ? (_jsxs("p", { className: "opacity-80 text-sm", children: ["Solicitud guardada: ", solicitud.seats, " plaza(s)"] })) : null] })) : (_jsx("p", { className: "mt-3 text-sm opacity-70", children: "Identif\u00EDcate como invitado para solicitar este desplazamiento." }))] }, item.id));
                }) })] }));
}
