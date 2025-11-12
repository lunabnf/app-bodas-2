import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
export default function Ceremonia() {
    const allInvitadosBase = [
        { id: "1", nombre: "Carlos", grupo: "Amigos Novio" },
        { id: "2", nombre: "Lucía", grupo: "Familia Novia" },
        { id: "3", nombre: "María", grupo: "Amigos Novia" },
        { id: "4", nombre: "Javier", grupo: "Familia Novio" },
        { id: "5", nombre: "Leticia", grupo: "Novia" },
        { id: "6", nombre: "Eric", grupo: "Novio" },
        { id: "7", nombre: "Raquel", grupo: "Familia Novia" },
        { id: "8", nombre: "Pablo", grupo: "Amigos Novio" },
        { id: "9", nombre: "Laura", grupo: "Amigos Novia" },
        { id: "10", nombre: "Sergio", grupo: "Familia Novio" },
        { id: "11", nombre: "Marta", grupo: "Amigos Novio" },
        { id: "12", nombre: "Andrés", grupo: "Familia Novia" },
    ];
    const [confirmado] = useState(true); // cambiar según lógica real
    const [filas, setFilas] = useState(3);
    const [asientosPorFila, setAsientosPorFila] = useState(4);
    const [seleccionados, setSeleccionados] = useState([]);
    const [invitados, setInvitados] = useState([
        { id: "1", nombre: "Carlos", grupo: "Amigos Novio" },
        { id: "2", nombre: "Lucía", grupo: "Familia Novia" },
        { id: "3", nombre: "María", grupo: "Amigos Novia" },
        { id: "4", nombre: "Javier", grupo: "Familia Novio" },
    ]);
    const [filtro, setFiltro] = useState("Todos");
    const [asientos, setAsientos] = useState({});
    const toggleAsiento = (i) => {
        if (seleccionados.includes(i)) {
            setSeleccionados(seleccionados.filter((s) => s !== i));
        }
        else {
            setSeleccionados([...seleccionados, i]);
        }
    };
    const reset = () => setSeleccionados([]);
    const handleDrop = (result) => {
        if (!result.destination)
            return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId)
            return;
        const destinoValido = destination.droppableId === "invitados" ||
            destination.droppableId.startsWith("left-") ||
            destination.droppableId.startsWith("right-") ||
            ["novio", "novia", "oficiante"].includes(destination.droppableId);
        const origenValido = source.droppableId.startsWith("left-") ||
            source.droppableId.startsWith("right-") ||
            ["novio", "novia", "oficiante"].includes(source.droppableId);
        if (!destinoValido)
            return;
        // 1️⃣ Mover desde la zona superior a una bancada o zona delantera
        if (source.droppableId === "invitados" && destinoValido) {
            setAsientos((prev) => ({ ...prev, [destination.droppableId]: draggableId }));
            setInvitados((prev) => prev.filter((i) => i.id !== draggableId));
            return;
        }
        // 2️⃣ Mover entre asientos
        if (origenValido && destinoValido && destination.droppableId !== "invitados") {
            setAsientos((prev) => {
                const nuevo = { ...prev };
                nuevo[source.droppableId] = null;
                nuevo[destination.droppableId] = draggableId;
                return nuevo;
            });
            return;
        }
        // 3️⃣ Devolver arriba desde una bancada o zona delantera
        if (destination.droppableId === "invitados" && origenValido) {
            const asientoId = source.droppableId;
            const invitadoId = draggableId;
            const invitado = allInvitadosBase.find((i) => i.id === invitadoId);
            if (invitado) {
                setInvitados((prev) => {
                    if (!prev.some((x) => x.id === invitado.id)) {
                        return [...prev, invitado];
                    }
                    return prev;
                });
            }
            setAsientos((prev) => ({ ...prev, [asientoId]: null }));
            return;
        }
    };
    const invitadosFiltrados = filtro === "Todos" ? invitados : invitados.filter((i) => i.grupo === filtro);
    if (!confirmado) {
        return (_jsx("div", { className: "text-white text-center text-lg mt-10", children: "Los novios a\u00FAn no han confirmado su asistencia." }));
    }
    return (_jsx(DragDropContext, { onDragEnd: handleDrop, children: _jsxs("div", { className: "text-white p-6 space-y-6", children: [_jsx("h2", { className: "text-2xl font-semibold text-center", children: "Configuraci\u00F3n de Ceremonia" }), _jsx("div", { className: "flex gap-4 justify-center", children: _jsxs("select", { value: filtro, onChange: (e) => setFiltro(e.target.value), className: "bg-black/40 border border-white/30 rounded px-3 py-1", children: [_jsx("option", { value: "Todos", children: "Todos" }), _jsx("option", { value: "Familia Novia", children: "Familia Novia" }), _jsx("option", { value: "Familia Novio", children: "Familia Novio" }), _jsx("option", { value: "Amigos Novia", children: "Amigos Novia" }), _jsx("option", { value: "Amigos Novio", children: "Amigos Novio" })] }) }), _jsx(Droppable, { droppableId: "invitados", direction: "horizontal", children: (provided) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: "flex flex-wrap justify-center gap-3 bg-black/20 p-4 rounded-lg", children: [invitadosFiltrados.map((i, index) => (_jsx(Draggable, { draggableId: i.id, index: index, children: (provided) => (_jsxs("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, className: "bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm cursor-move w-32 text-center", children: [_jsx("div", { className: "font-semibold", children: i.nombre }), _jsx("div", { className: "text-xs", children: i.grupo })] })) }, i.id))), provided.placeholder] })) }), _jsxs("div", { className: "flex gap-6 justify-center items-center", children: [_jsxs("label", { className: "flex items-center gap-2", children: ["Filas:", _jsx("input", { type: "number", min: 1, value: filas, onChange: (e) => setFilas(parseInt(e.target.value) || 1), className: "w-16 bg-black/30 border border-white/30 rounded px-2 py-1" })] }), _jsxs("label", { className: "flex items-center gap-2", children: ["Asientos por fila (por bancada):", _jsx("input", { type: "number", min: 1, value: asientosPorFila, onChange: (e) => setAsientosPorFila(parseInt(e.target.value) || 1), className: "w-16 bg-black/30 border border-white/30 rounded px-2 py-1" })] })] }), _jsx("div", { className: "space-y-6 scale-90 overflow-x-auto", children: [...Array(filas)].map((_, f) => (_jsxs("div", { className: "flex justify-center items-center gap-16", children: [_jsx("div", { className: "flex gap-3", children: [...Array(asientosPorFila)].map((_, a) => {
                                    const i = f * asientosPorFila + a;
                                    const asientoId = `left-${i}`;
                                    const invitadoId = asientos[asientoId];
                                    const invitado = allInvitadosBase.find((inv) => inv.id === invitadoId);
                                    return (_jsx(Droppable, { droppableId: asientoId, children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: `w-12 h-12 rounded-md flex items-center justify-center text-[10px] font-semibold cursor-pointer transition-all ${snapshot.isDraggingOver ? "bg-green-500" : "bg-white/20 hover:bg-white/30"}`, onClick: () => toggleAsiento(i), children: [invitado ? invitado.nombre : "Vacío", provided.placeholder] })) }, asientoId));
                                }) }), _jsx("div", { className: "w-12" }), _jsx("div", { className: "flex gap-3", children: [...Array(asientosPorFila)].map((_, a) => {
                                    const i = f * asientosPorFila + a + 100;
                                    const asientoId = `right-${i}`;
                                    const invitadoId = asientos[asientoId];
                                    const invitado = allInvitadosBase.find((inv) => inv.id === invitadoId);
                                    return (_jsx(Droppable, { droppableId: asientoId, children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: `w-12 h-12 rounded-md flex items-center justify-center text-[10px] font-semibold cursor-pointer transition-all ${snapshot.isDraggingOver ? "bg-green-500" : "bg-white/20 hover:bg-white/30"}`, onClick: () => toggleAsiento(i), children: [invitado ? invitado.nombre : "Vacío", provided.placeholder] })) }, asientoId));
                                }) })] }, f))) }), _jsx("div", { className: "flex justify-center items-center gap-6 mt-12", children: ["novia", "oficiante", "novio"].map((rol) => (_jsx(Droppable, { droppableId: rol, children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: `w-32 h-16 rounded-md flex items-center justify-center font-semibold text-center transition-all ${snapshot.isDraggingOver ? "bg-green-500" : "bg-white/20 hover:bg-white/30"}`, children: [asientos[rol] ? (allInvitadosBase.find((i) => i.id === asientos[rol])?.nombre) : (_jsx("input", { type: "text", placeholder: rol === "oficiante"
                                        ? "Oficiante"
                                        : rol === "novia"
                                            ? "Novia"
                                            : "Novio", onChange: (e) => setAsientos((prev) => ({ ...prev, [rol]: e.target.value })), className: "bg-transparent text-center outline-none w-full text-white" })), provided.placeholder] })) }, rol))) }), _jsxs("div", { className: "flex gap-4 justify-center mt-8", children: [_jsx("button", { onClick: () => alert("Configuración guardada"), className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded", children: "Guardar" }), _jsx("button", { onClick: reset, className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded", children: "Restablecer" })] })] }) }));
}
