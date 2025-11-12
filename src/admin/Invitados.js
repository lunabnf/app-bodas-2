import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
export default function Invitados() {
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todos");
    const [invitados, setInvitados] = useState([
        { id: 1, nombre: "Ana Pérez", tipo: "Adulto", grupo: "Familia novia", grupoTipo: "familia_novia", estado: "confirmado", mesa: "Mesa 3" },
        { id: 2, nombre: "Carlos Ruiz", tipo: "Adulto", grupo: "Amigos novio", grupoTipo: "amigos_novio", estado: "pendiente" },
        { id: 3, nombre: "Lucía Gómez", tipo: "Niño", grupo: "Familia novio", grupoTipo: "familia_novio", estado: "rechazado" },
    ]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoInvitado, setNuevoInvitado] = useState({
        id: 0,
        nombre: "",
        tipo: "Adulto",
        grupo: "",
        grupoTipo: "otros",
        estado: "confirmado",
        mesa: "",
    });
    const [mostrarQR, setMostrarQR] = useState(false);
    const [invitadoQR, setInvitadoQR] = useState(null);
    const invitadosFiltrados = invitados.filter((i) => (filtro === "todos" || i.estado === filtro) &&
        i.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    const resumenGrupos = invitados.reduce((acc, inv) => {
        acc[inv.grupoTipo] = (acc[inv.grupoTipo] || 0) + 1;
        return acc;
    }, {});
    const abrirModal = () => {
        setNuevoInvitado({
            id: 0,
            nombre: "",
            tipo: "Adulto",
            grupo: "",
            grupoTipo: "otros",
            estado: "confirmado",
            mesa: "",
        });
        setMostrarModal(true);
    };
    const guardarInvitado = () => {
        if (nuevoInvitado.nombre.trim() === "" || nuevoInvitado.grupo.trim() === "") {
            // Podrías añadir validación y mostrar mensaje, pero no se pidió.
            return;
        }
        const nuevoId = invitados.length > 0 ? Math.max(...invitados.map(i => i.id)) + 1 : 1;
        const invitadoAGuardar = {
            id: nuevoId,
            nombre: nuevoInvitado.nombre.trim(),
            tipo: nuevoInvitado.tipo,
            grupo: nuevoInvitado.grupo.trim(),
            grupoTipo: nuevoInvitado.grupoTipo,
            estado: nuevoInvitado.estado,
            mesa: nuevoInvitado.mesa?.trim() || undefined,
        };
        setInvitados([...invitados, invitadoAGuardar]);
        setMostrarModal(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-black/40 text-white p-6 backdrop-blur-md", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-pink-400", children: "Gesti\u00F3n de invitados" }), _jsx("button", { onClick: abrirModal, className: "bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-md transition", children: "+ A\u00F1adir invitado" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8", children: [_jsxs("div", { className: "bg-white/10 p-4 rounded-lg border border-white/10 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-green-400", children: "Confirmados" }), _jsx("p", { className: "text-2xl font-bold", children: invitados.filter(i => i.estado === "confirmado").length })] }), _jsxs("div", { className: "bg-white/10 p-4 rounded-lg border border-white/10 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-yellow-400", children: "Pendientes" }), _jsx("p", { className: "text-2xl font-bold", children: invitados.filter(i => i.estado === "pendiente").length })] }), _jsxs("div", { className: "bg-white/10 p-4 rounded-lg border border-white/10 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-red-400", children: "Rechazados" }), _jsx("p", { className: "text-2xl font-bold", children: invitados.filter(i => i.estado === "rechazado").length })] })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8", children: Object.entries(resumenGrupos).map(([grupo, cantidad]) => (_jsxs("div", { className: "bg-white/10 p-3 rounded-lg border border-white/10 text-center", children: [_jsx("p", { className: "capitalize text-sm text-white/70", children: grupo.replace("_", " ") }), _jsx("p", { className: "text-2xl font-bold text-pink-400", children: cantidad })] }, grupo))) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 mb-6", children: [_jsx("input", { type: "text", placeholder: "Buscar por nombre...", className: "w-full sm:w-1/3 bg-white/10 border border-white/20 rounded-md p-2 text-white placeholder-white/50 focus:ring-2 focus:ring-pink-400", value: busqueda, onChange: (e) => setBusqueda(e.target.value) }), _jsxs("select", { className: "bg-white/10 border border-white/20 rounded-md p-2 text-white focus:ring-2 focus:ring-pink-400", value: filtro, onChange: (e) => setFiltro(e.target.value), children: [_jsx("option", { value: "todos", children: "Todos" }), _jsx("option", { value: "confirmado", children: "Confirmados" }), _jsx("option", { value: "pendiente", children: "Pendientes" }), _jsx("option", { value: "rechazado", children: "Rechazados" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-white/10", children: [_jsx("th", { className: "p-3 border-b border-white/10", children: "Nombre" }), _jsx("th", { className: "p-3 border-b border-white/10", children: "Tipo" }), _jsx("th", { className: "p-3 border-b border-white/10", children: "Grupo" }), _jsx("th", { className: "p-3 border-b border-white/10", children: "Estado" }), _jsx("th", { className: "p-3 border-b border-white/10", children: "Mesa" }), _jsx("th", { className: "p-3 border-b border-white/10", children: "QR" }), _jsx("th", { className: "p-3 border-b border-white/10", children: "Acciones" })] }) }), _jsx("tbody", { children: invitadosFiltrados.map((inv) => (_jsxs("tr", { className: "hover:bg-white/5 transition", children: [_jsx("td", { className: "p-3 border-b border-white/10", children: inv.nombre }), _jsx("td", { className: "p-3 border-b border-white/10", children: inv.tipo }), _jsx("td", { className: "p-3 border-b border-white/10", children: inv.grupo }), _jsx("td", { className: "p-3 border-b border-white/10 capitalize", children: inv.estado }), _jsx("td", { className: "p-3 border-b border-white/10", children: inv.mesa || "-" }), _jsx("td", { className: "p-3 border-b border-white/10", children: _jsx("button", { onClick: () => {
                                                setInvitadoQR(inv);
                                                setMostrarQR(true);
                                            }, className: "bg-pink-400 text-black px-2 py-1 rounded text-sm hover:bg-pink-300 transition", children: "Ver QR" }) }), _jsxs("td", { className: "p-3 border-b border-white/10", children: [_jsx("button", { className: "bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm mr-2", children: "Editar" }), _jsx("button", { className: "bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded text-sm", children: "Eliminar" })] })] }, inv.id))) })] }) }), _jsxs("div", { className: "mt-8 flex flex-wrap gap-4", children: [_jsx("button", { className: "bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md transition", children: "Exportar lista (CSV)" }), _jsx("button", { className: "bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-md transition", children: "Generar QRs" }), _jsx("button", { className: "bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md transition", children: "Enviar recordatorios" })] }), mostrarModal && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50", children: _jsxs("div", { className: "bg-white bg-opacity-90 backdrop-blur-md rounded-lg p-6 w-full max-w-md text-black", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "A\u00F1adir nuevo invitado" }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                guardarInvitado();
                            }, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 font-semibold", children: "Nombre" }), _jsx("input", { type: "text", className: "w-full border border-gray-300 rounded px-3 py-2", value: nuevoInvitado.nombre, onChange: (e) => setNuevoInvitado({ ...nuevoInvitado, nombre: e.target.value }), required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 font-semibold", children: "Tipo" }), _jsxs("select", { className: "w-full border border-gray-300 rounded px-3 py-2", value: nuevoInvitado.tipo, onChange: (e) => setNuevoInvitado({ ...nuevoInvitado, tipo: e.target.value }), children: [_jsx("option", { value: "Adulto", children: "Adulto" }), _jsx("option", { value: "Ni\u00F1o", children: "Ni\u00F1o" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 font-semibold", children: "Grupo" }), _jsx("input", { type: "text", className: "w-full border border-gray-300 rounded px-3 py-2", value: nuevoInvitado.grupo, onChange: (e) => setNuevoInvitado({ ...nuevoInvitado, grupo: e.target.value }), required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 font-semibold", children: "Tipo de grupo" }), _jsxs("select", { className: "w-full border border-gray-300 rounded px-3 py-2", value: nuevoInvitado.grupoTipo, onChange: (e) => setNuevoInvitado({
                                                ...nuevoInvitado,
                                                grupoTipo: e.target.value,
                                            }), children: [_jsx("option", { value: "familia_novia", children: "Familia de la novia" }), _jsx("option", { value: "familia_novio", children: "Familia del novio" }), _jsx("option", { value: "amigos_novia", children: "Amigos de la novia" }), _jsx("option", { value: "amigos_novio", children: "Amigos del novio" }), _jsx("option", { value: "amigos_comunes", children: "Amigos comunes" }), _jsx("option", { value: "amigos_trabajo", children: "Amigos del trabajo" }), _jsx("option", { value: "amigos_pueblo", children: "Amigos del pueblo" }), _jsx("option", { value: "proveedores", children: "Proveedores" }), _jsx("option", { value: "otros", children: "Otros" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 font-semibold", children: "Estado" }), _jsxs("select", { className: "w-full border border-gray-300 rounded px-3 py-2", value: nuevoInvitado.estado, onChange: (e) => setNuevoInvitado({
                                                ...nuevoInvitado,
                                                estado: e.target.value,
                                            }), children: [_jsx("option", { value: "confirmado", children: "Confirmado" }), _jsx("option", { value: "pendiente", children: "Pendiente" }), _jsx("option", { value: "rechazado", children: "Rechazado" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block mb-1 font-semibold", children: "Mesa (opcional)" }), _jsx("input", { type: "text", className: "w-full border border-gray-300 rounded px-3 py-2", value: nuevoInvitado.mesa || "", onChange: (e) => setNuevoInvitado({ ...nuevoInvitado, mesa: e.target.value }) })] }), _jsxs("div", { className: "flex justify-end gap-4", children: [_jsx("button", { type: "button", onClick: () => setMostrarModal(false), className: "px-4 py-2 rounded bg-gray-300 hover:bg-gray-400", children: "Cancelar" }), _jsx("button", { type: "submit", className: "px-4 py-2 rounded bg-pink-500 hover:bg-pink-400 text-white", children: "Guardar" })] })] })] }) })), mostrarQR && invitadoQR && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50", children: _jsxs("div", { className: "bg-white bg-opacity-90 backdrop-blur-md rounded-lg p-6 text-center text-black shadow-xl w-[320px]", children: [_jsxs("h2", { className: "text-xl font-bold mb-3", children: ["QR de ", invitadoQR.nombre] }), _jsx(QRCodeCanvas, { value: `https://bodaleticiayeric.com/rsvp/${invitadoQR.id}`, size: 200, bgColor: "#ffffff", fgColor: "#000000", includeMargin: true }), _jsxs("p", { className: "text-sm text-gray-700 mt-3 break-all", children: ["https://bodaleticiayeric.com/rsvp/", invitadoQR.id] }), _jsx("button", { onClick: () => setMostrarQR(false), className: "mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-400", children: "Cerrar" })] }) }))] }));
}
