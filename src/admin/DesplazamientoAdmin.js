import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { borrarTransporte, guardarTransportes, obtenerSolicitudesTransporte, obtenerTransportes, } from "../services/transporteService";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";
function uuid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
export default function DesplazamientoAdmin() {
    const [items, setItems] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [nuevo, setNuevo] = useState({
        nombre: "",
        origen: "",
        destino: "",
        hora: "",
        capacidad: "",
        notas: "",
    });
    useEffect(() => {
        void (async () => {
            const [options, requests] = await Promise.all([
                obtenerTransportes(),
                obtenerSolicitudesTransporte(),
            ]);
            setItems(options);
            setSolicitudes(requests);
        })();
    }, []);
    const guardar = async () => {
        if (!nuevo.nombre.trim())
            return;
        const entry = {
            id: uuid(),
            nombre: nuevo.nombre,
            origen: nuevo.origen,
            destino: nuevo.destino,
            hora: nuevo.hora,
            capacidad: Number(nuevo.capacidad) || 0,
            notas: nuevo.notas,
        };
        const updated = [...items, entry];
        setItems(updated);
        await guardarTransportes(updated);
        const usuario = getUsuarioActual();
        if (usuario) {
            await addLog(usuario.nombre, `Creó transporte: ${entry.nombre}`);
        }
        setNuevo({
            nombre: "",
            origen: "",
            destino: "",
            hora: "",
            capacidad: "",
            notas: "",
        });
    };
    const borrar = async (id) => {
        const updated = items.filter((item) => item.id !== id);
        const transporte = items.find((item) => item.id === id);
        setItems(updated);
        await borrarTransporte(id);
        const usuario = getUsuarioActual();
        if (usuario && transporte) {
            await addLog(usuario.nombre, `Borró transporte: ${transporte.nombre}`);
        }
    };
    return (_jsxs("div", { className: "text-white p-6 space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Desplazamientos (Admin)" }), _jsx("p", { className: "opacity-80", children: "Aqu\u00ED configuras las opciones de desplazamiento que podr\u00E1n solicitar los invitados." }), _jsxs("div", { className: "p-4 bg-white/10 border border-white/20 rounded space-y-3", children: [_jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Nombre del transporte (Ej: Bus A)", value: nuevo.nombre, onChange: (e) => setNuevo({ ...nuevo, nombre: e.target.value }) }), _jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Origen", value: nuevo.origen, onChange: (e) => setNuevo({ ...nuevo, origen: e.target.value }) }), _jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Destino", value: nuevo.destino, onChange: (e) => setNuevo({ ...nuevo, destino: e.target.value }) }), _jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Hora", value: nuevo.hora, onChange: (e) => setNuevo({ ...nuevo, hora: e.target.value }) }), _jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Capacidad (asientos)", type: "number", value: nuevo.capacidad, onChange: (e) => setNuevo({ ...nuevo, capacidad: e.target.value }) }), _jsx("textarea", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Notas", value: nuevo.notas, onChange: (e) => setNuevo({ ...nuevo, notas: e.target.value }) }), _jsx("button", { className: "bg-blue-600 px-4 py-2 rounded", onClick: () => void guardar(), children: "A\u00F1adir transporte" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Opciones publicadas" }), items.length === 0 && (_jsx("p", { className: "opacity-60", children: "No hay transportes a\u00F1adidos." })), items.map((item) => (_jsxs("div", { className: "p-4 bg-white/10 border border-white/20 rounded flex justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-lg", children: item.nombre }), _jsxs("p", { className: "opacity-80", children: [item.origen, " \u2192 ", item.destino] }), _jsxs("p", { className: "opacity-80", children: ["Hora: ", item.hora] }), _jsxs("p", { className: "opacity-80", children: ["Capacidad: ", item.capacidad] }), item.notas ? _jsx("p", { className: "italic opacity-70 mt-1", children: item.notas }) : null] }), _jsx("button", { className: "bg-red-600 px-3 py-1 rounded h-fit", onClick: () => void borrar(item.id), children: "Borrar" })] }, item.id)))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Solicitudes de invitados" }), solicitudes.length === 0 ? (_jsx("p", { className: "opacity-60", children: "Todav\u00EDa no hay solicitudes de transporte." })) : (solicitudes.map((solicitud) => {
                        const transporte = items.find((item) => item.id === solicitud.transportId);
                        return (_jsxs("div", { className: "rounded-lg border border-white/20 bg-white/10 p-4", children: [_jsx("p", { className: "font-semibold", children: solicitud.guestName }), _jsxs("p", { className: "opacity-80", children: [transporte ? transporte.nombre : "Transporte", " \u00B7 ", solicitud.seats, " plaza(s)"] }), solicitud.notes ? _jsx("p", { className: "mt-1 opacity-70", children: solicitud.notes }) : null] }, solicitud.id));
                    }))] })] }));
}
