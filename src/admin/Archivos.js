import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
const CARPETAS_BASE = [
    "General",
    "Ceremonia",
    "Proveedores",
    "Facturas",
    "Decoración",
    "Documentos legales",
    "Música",
    "Fotos",
    "Otros",
];
export default function Archivos() {
    const [archivos, setArchivos] = useState([]);
    const [carpetaActiva, setCarpetaActiva] = useState("General");
    const inputRef = useRef(null);
    const subirArchivo = (file) => {
        const nuevo = {
            id: crypto.randomUUID(),
            nombre: file.name,
            tipo: file.type,
            tamaño: file.size,
            url: URL.createObjectURL(file),
            carpeta: carpetaActiva,
            fecha: new Date().toLocaleDateString(),
        };
        setArchivos((prev) => [...prev, nuevo]);
    };
    const handleInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            subirArchivo(e.target.files[0]);
        }
    };
    const borrarArchivo = (id) => {
        setArchivos(archivos.filter((a) => a.id !== id));
    };
    return (_jsxs("div", { className: "space-y-6 px-4 py-6 text-[var(--app-ink)] sm:px-6", children: [_jsxs("div", { className: "app-surface p-8", children: [_jsx("h1", { className: "app-page-title", children: "Gesti\u00F3n de archivos" }), _jsx("p", { className: "mt-3 text-[var(--app-muted)]", children: "Centraliza documentos, facturas e im\u00E1genes con una lectura m\u00E1s clara y contraste estable." })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-4 mb-6", children: CARPETAS_BASE.map((c) => (_jsx("button", { onClick: () => setCarpetaActiva(c), className: `px-4 py-2 rounded-lg border ${carpetaActiva === c
                        ? "bg-[var(--app-ink)] text-white border-[var(--app-ink)]"
                        : "bg-[rgba(255,255,255,0.88)] border-[var(--app-line)] hover:bg-white"}`, children: c }, c))) }), _jsxs("div", { className: "app-panel mb-6 p-4", children: [_jsx("button", { onClick: () => inputRef.current?.click(), className: "app-button-primary", children: "+ Subir archivo" }), _jsx("input", { ref: inputRef, type: "file", className: "hidden", onChange: handleInput })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [archivos
                        .filter((a) => a.carpeta === carpetaActiva)
                        .map((a) => (_jsxs("div", { className: "app-panel flex flex-col gap-3 p-4", children: [_jsx("div", { className: "text-lg font-semibold break-words", children: a.nombre }), _jsxs("div", { className: "text-sm text-[var(--app-muted)]", children: ["Tipo: ", a.tipo || "Desconocido"] }), _jsxs("div", { className: "text-sm text-[var(--app-muted)]", children: ["Tama\u00F1o: ", (a.tamaño / 1024).toFixed(1), " KB"] }), _jsxs("div", { className: "text-sm text-[var(--app-muted)]", children: ["Fecha: ", a.fecha] }), (a.tipo.startsWith("image/") || a.tipo === "application/pdf") && (_jsx("a", { href: a.url, target: "_blank", className: "underline text-[var(--app-ink)]", children: "Ver archivo" })), _jsx("button", { onClick: () => borrarArchivo(a.id), className: "app-button-secondary mt-2 text-sm", children: "Borrar" })] }, a.id))), archivos.filter((a) => a.carpeta === carpetaActiva).length === 0 && (_jsx("p", { className: "text-lg text-[var(--app-muted)]", children: "No hay archivos en esta carpeta." }))] })] }));
}
