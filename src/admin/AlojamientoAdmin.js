import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { borrarAlojamiento, guardarAlojamientos, obtenerAlojamientos, obtenerSolicitudesAlojamiento, } from "../services/alojamientosService";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";
export default function AlojamientoAdmin() {
    const [alojamientos, setAlojamientos] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [nuevo, setNuevo] = useState({
        id: crypto.randomUUID(),
        nombre: "",
        direccion: "",
        link: "",
        notas: "",
    });
    useEffect(() => {
        void (async () => {
            const [catalogo, requests] = await Promise.all([
                obtenerAlojamientos(),
                obtenerSolicitudesAlojamiento(),
            ]);
            setAlojamientos(catalogo);
            setSolicitudes(requests);
        })();
    }, []);
    const guardar = async () => {
        if (!nuevo.nombre.trim())
            return;
        const updated = [...alojamientos, nuevo];
        setAlojamientos(updated);
        await guardarAlojamientos(updated);
        const usuario = getUsuarioActual();
        if (usuario) {
            await addLog(usuario.nombre, `Creó alojamiento: ${nuevo.nombre}`);
        }
        setNuevo({
            id: crypto.randomUUID(),
            nombre: "",
            direccion: "",
            link: "",
            notas: "",
        });
    };
    const borrar = async (id) => {
        const alojamiento = alojamientos.find((item) => item.id === id);
        const updated = alojamientos.filter((item) => item.id !== id);
        setAlojamientos(updated);
        await borrarAlojamiento(id);
        const usuario = getUsuarioActual();
        if (usuario && alojamiento) {
            await addLog(usuario.nombre, `Borró alojamiento: ${alojamiento.nombre}`);
        }
    };
    return (_jsxs("div", { className: "text-white p-6 space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Alojamiento (Admin)" }), _jsx("p", { className: "opacity-80", children: "Aqu\u00ED configuras el cat\u00E1logo de alojamientos que se publica para los invitados." }), _jsxs("div", { className: "p-4 bg-white/10 border border-white/20 rounded-lg space-y-3", children: [_jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Nombre del alojamiento", value: nuevo.nombre, onChange: (e) => setNuevo({ ...nuevo, nombre: e.target.value }) }), _jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Direcci\u00F3n", value: nuevo.direccion, onChange: (e) => setNuevo({ ...nuevo, direccion: e.target.value }) }), _jsx("input", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Link de reserva", value: nuevo.link, onChange: (e) => setNuevo({ ...nuevo, link: e.target.value }) }), _jsx("textarea", { className: "p-2 bg-black/30 border rounded w-full", placeholder: "Notas para los invitados", value: nuevo.notas || "", onChange: (e) => setNuevo({ ...nuevo, notas: e.target.value }) }), _jsx("button", { className: "bg-blue-600 px-4 py-2 rounded", onClick: () => void guardar(), children: "A\u00F1adir alojamiento" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Cat\u00E1logo publicado" }), alojamientos.length === 0 && (_jsx("p", { className: "opacity-60", children: "No hay alojamientos a\u00F1adidos." })), alojamientos.map((item) => (_jsxs("div", { className: "p-4 bg-white/10 border rounded-lg flex justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold", children: item.nombre }), _jsx("p", { className: "opacity-80", children: item.direccion }), item.notas ? _jsx("p", { className: "mt-1 opacity-70", children: item.notas }) : null, item.link ? (_jsx("a", { href: item.link, className: "underline text-blue-300", target: "_blank", rel: "noreferrer", children: "Ver enlace" })) : null] }), _jsx("button", { className: "bg-red-600 px-3 py-1 rounded h-fit", onClick: () => void borrar(item.id), children: "Borrar" })] }, item.id)))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Solicitudes de invitados" }), solicitudes.length === 0 ? (_jsx("p", { className: "opacity-60", children: "Todav\u00EDa no hay solicitudes de alojamiento." })) : (solicitudes.map((solicitud) => {
                        const alojamiento = alojamientos.find((item) => item.id === solicitud.lodgingId);
                        return (_jsxs("div", { className: "rounded-lg border border-white/20 bg-white/10 p-4", children: [_jsx("p", { className: "font-semibold", children: solicitud.guestName }), _jsx("p", { className: "opacity-80", children: solicitud.needsLodging
                                        ? `Necesita alojamiento${alojamiento ? `: ${alojamiento.nombre}` : ""}`
                                        : "No necesita alojamiento" }), solicitud.notes ? _jsx("p", { className: "mt-1 opacity-70", children: solicitud.notes }) : null] }, solicitud.id));
                    }))] })] }));
}
