import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const CATEGORIAS = [
    "Ceremonia",
    "Banquete",
    "Proveedores",
    "Invitados",
    "Documentación",
    "Pagos",
    "Decoración",
];
export default function Checklist() {
    const [tareas, setTareas] = useState([]);
    const [nueva, setNueva] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0] ?? "");
    const añadirTarea = () => {
        if (!nueva.trim())
            return;
        const t = {
            id: crypto.randomUUID(),
            titulo: nueva,
            categoria,
            completada: false,
        };
        setTareas([...tareas, t]);
        setNueva("");
    };
    const toggle = (id) => {
        setTareas(tareas.map((t) => t.id === id ? { ...t, completada: !t.completada } : t));
    };
    const borrar = (id) => {
        setTareas(tareas.filter((t) => t.id !== id));
    };
    return (_jsxs("div", { className: "text-white p-6 max-w-3xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Checklist profesional" }), _jsxs("div", { className: "mb-6", children: [_jsxs("p", { className: "text-lg", children: ["Completadas:", " ", _jsxs("span", { className: "font-bold", children: [tareas.filter((t) => t.completada).length, "/", tareas.length] })] }), _jsx("div", { className: "w-full h-3 bg-white/20 rounded mt-2", children: _jsx("div", { className: "h-full bg-green-500 rounded", style: {
                                width: tareas.length === 0
                                    ? "0%"
                                    : `${(tareas.filter((t) => t.completada).length /
                                        tareas.length) *
                                        100}%`,
                            } }) })] }), _jsxs("div", { className: "bg-white/10 p-4 rounded-lg mb-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-3", children: "A\u00F1adir nueva tarea" }), _jsx("input", { type: "text", placeholder: "Descripci\u00F3n de la tarea", value: nueva, onChange: (e) => setNueva(e.target.value), className: "w-full p-2 rounded bg-black/30 border border-white/20 mb-3 text-white" }), _jsx("select", { value: categoria, onChange: (e) => setCategoria(e.target.value), className: "w-full p-2 rounded bg-black/30 border border-white/20 mb-3 text-white", children: CATEGORIAS.map((c) => (_jsx("option", { value: c, children: c }, c))) }), _jsx("button", { className: "w-full bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded font-bold", onClick: añadirTarea, children: "A\u00F1adir tarea" })] }), CATEGORIAS.map((cat) => (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-2xl font-bold mb-2", children: cat }), _jsx("div", { className: "space-y-3", children: tareas
                            .filter((t) => t.categoria === cat)
                            .map((t) => (_jsxs("div", { className: "flex items-center justify-between bg-white/10 p-3 rounded", children: [_jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => toggle(t.id), children: [_jsx("input", { type: "checkbox", checked: t.completada, readOnly: true, className: "w-5 h-5" }), _jsx("span", { className: `text-lg ${t.completada ? "line-through opacity-50" : ""}`, children: t.titulo })] }), _jsx("button", { onClick: () => borrar(t.id), className: "text-red-400 hover:text-red-600", children: "Borrar" })] }, t.id))) })] }, cat)))] }));
}
