import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { getWeddingProgram, saveWeddingProgram, } from "../services/programaService";
export default function ProgramaAdmin() {
    const [eventos, setEventos] = useState(getWeddingProgram());
    const [nuevo, setNuevo] = useState({
        id: "",
        hora: "",
        titulo: "",
        descripcion: "",
    });
    const guardar = () => {
        saveWeddingProgram(eventos);
    };
    const agregar = () => {
        if (!nuevo.hora || !nuevo.titulo)
            return;
        const actualizados = [
            ...eventos,
            { ...nuevo, id: crypto.randomUUID() },
        ].sort((a, b) => a.hora.localeCompare(b.hora));
        setEventos(actualizados);
        guardar();
        setNuevo({ id: "", hora: "", titulo: "", descripcion: "" });
    };
    const eliminar = (id) => {
        const actualizados = eventos.filter((e) => e.id !== id);
        setEventos(actualizados);
        guardar();
    };
    const mover = (indice, direccion) => {
        const copia = [...eventos];
        const nuevoIndice = direccion === "arriba" ? indice - 1 : indice + 1;
        if (nuevoIndice < 0 || nuevoIndice >= copia.length)
            return;
        const actual = copia[indice];
        const destino = copia[nuevoIndice];
        if (!actual || !destino)
            return;
        copia[indice] = destino;
        copia[nuevoIndice] = actual;
        setEventos(copia);
        guardar();
    };
    return (_jsxs("section", { className: "text-white p-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Programa de la boda" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("input", { type: "time", value: nuevo.hora, onChange: (e) => setNuevo({ ...nuevo, hora: e.target.value }), className: "bg-black/40 p-2 rounded border border-white/20" }), _jsx("input", { type: "text", placeholder: "T\u00EDtulo", value: nuevo.titulo, onChange: (e) => setNuevo({ ...nuevo, titulo: e.target.value }), className: "bg-black/40 p-2 rounded border border-white/20 w-48" }), _jsx("input", { type: "text", placeholder: "Descripci\u00F3n", value: nuevo.descripcion, onChange: (e) => setNuevo({ ...nuevo, descripcion: e.target.value }), className: "bg-black/40 p-2 rounded border border-white/20 flex-1" }), _jsx("button", { onClick: agregar, className: "bg-green-600 hover:bg-green-500 px-4 py-2 rounded", children: "A\u00F1adir" })] }), _jsx("ul", { className: "space-y-3", children: eventos.map((ev, i) => (_jsxs("li", { className: "bg-white/10 p-4 rounded flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-bold text-lg", children: [ev.hora, " \u2014 ", ev.titulo] }), _jsx("p", { className: "text-sm opacity-80", children: ev.descripcion })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => mover(i, "arriba"), className: "bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded", children: "\u2191" }), _jsx("button", { onClick: () => mover(i, "abajo"), className: "bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded", children: "\u2193" }), _jsx("button", { onClick: () => eliminar(ev.id), className: "bg-red-600 hover:bg-red-500 px-2 py-1 rounded", children: "\u2715" })] })] }, ev.id))) })] }));
}
