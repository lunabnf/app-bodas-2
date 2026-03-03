import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getWeddingProgram } from "../services/programaService";
export default function Programa() {
    const eventos = getWeddingProgram();
    return (_jsxs("section", { className: "text-white p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Programa del d\u00EDa" }), eventos.length === 0 ? (_jsx("p", { children: "No hay eventos configurados a\u00FAn." })) : (_jsx("ul", { className: "space-y-3", children: eventos.map((ev) => (_jsxs("li", { className: "bg-white/10 p-4 rounded border border-white/10", children: [_jsxs("p", { className: "font-semibold", children: [ev.hora, " \u2014 ", ev.titulo] }), _jsx("p", { className: "text-sm opacity-80", children: ev.descripcion })] }, ev.id))) }))] }));
}
