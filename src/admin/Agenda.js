import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const TIPOS = [
    "Ceremonia",
    "Proveedores",
    "Fotografía",
    "Banquete",
    "Transporte",
    "DJ / Música",
    "Coordinación",
    "Otros",
];
export default function Agenda() {
    const [eventos, setEventos] = useState([]);
    const [hora, setHora] = useState("");
    const [titulo, setTitulo] = useState("");
    const [tipo, setTipo] = useState(TIPOS[0] ?? "");
    const añadir = () => {
        if (!hora.trim() || !titulo.trim())
            return;
        const nuevo = {
            id: crypto.randomUUID(),
            hora,
            titulo,
            tipo,
        };
        const ordenados = [...eventos, nuevo].sort((a, b) => Number(a.hora.replace(":", "")) -
            Number(b.hora.replace(":", "")));
        setEventos(ordenados);
        setHora("");
        setTitulo("");
    };
    const borrar = (id) => {
        setEventos(eventos.filter((e) => e.id !== id));
    };
    return (_jsxs("div", { className: "text-white p-6 max-w-3xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Agenda interna del d\u00EDa de la boda" }), _jsxs("div", { className: "bg-white/10 p-4 rounded-lg mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-3", children: "A\u00F1adir evento" }), _jsx("input", { type: "time", value: hora, onChange: (e) => setHora(e.target.value), className: "w-full p-2 mb-3 rounded bg-black/30 border border-white/20 text-white" }), _jsx("input", { type: "text", placeholder: "Descripci\u00F3n del evento", value: titulo, onChange: (e) => setTitulo(e.target.value), className: "w-full p-2 mb-3 rounded bg-black/30 border border-white/20 text-white" }), _jsx("select", { value: tipo, onChange: (e) => setTipo(e.target.value), className: "w-full p-2 mb-3 rounded bg-black/30 border border-white/20 text-white", children: TIPOS.map((t) => (_jsx("option", { value: t, children: t }, t))) }), _jsx("button", { onClick: añadir, className: "w-full bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded font-bold", children: "A\u00F1adir evento" })] }), _jsxs("div", { className: "space-y-4", children: [eventos.map((ev) => (_jsxs("div", { className: "bg-white/10 p-4 rounded flex items-center justify-between", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xl font-bold", children: ev.hora }), _jsx("span", { className: "text-lg", children: ev.titulo }), _jsx("span", { className: "text-sm opacity-70", children: ev.tipo })] }), _jsx("button", { onClick: () => borrar(ev.id), className: "text-red-400 hover:text-red-600", children: "Borrar" })] }, ev.id))), eventos.length === 0 && (_jsx("p", { className: "opacity-70 text-center mt-8", children: "No hay eventos a\u00FAn. A\u00F1ade el primero arriba." }))] })] }));
}
