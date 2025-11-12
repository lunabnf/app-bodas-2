import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
export default function MesasAdmin() {
    const [invitados, setInvitados] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [plantilla, setPlantilla] = useState("Romántico");
    const nombresMesas = {
        Romántico: ["Amor Eterno", "Pasión", "Luna de Miel", "Felicidad", "Caricias", "Sueños"],
        Divertido: ["Los Fiesteros", "El Desmadre", "La Resaca", "Los Valientes", "Brindis", "Buen Rollo"],
        Elegante: ["Cristal", "Diamante", "Plata", "Oro", "Rubí", "Zafiro"],
        Viajes: ["París", "Roma", "Tokio", "Londres", "Nueva York", "Bali"],
    };
    // Cargar datos de demo o reales desde localStorage
    useEffect(() => {
        try {
            const storedInvitados = localStorage.getItem("wedding.guests");
            const storedMesas = localStorage.getItem("wedding.tables");
            if (storedInvitados && storedMesas) {
                setInvitados(JSON.parse(storedInvitados));
                setMesas(JSON.parse(storedMesas));
            }
            else {
                const demoMesas = [
                    { id: "1", nombre: "Mesa Amor Eterno" },
                    { id: "2", nombre: "Mesa Pasión" },
                ];
                const demoInvitados = [
                    { id: "a", nombre: "Luis Luna", mesa: "1" },
                    { id: "b", nombre: "Tatiana", mesa: "1" },
                    { id: "c", nombre: "Daniel Castañenas", mesa: "2" },
                    { id: "d", nombre: "Raquel" },
                    { id: "e", nombre: "Pablo" },
                ];
                setMesas(demoMesas);
                setInvitados(demoInvitados);
                localStorage.setItem("wedding.tables", JSON.stringify(demoMesas));
                localStorage.setItem("wedding.guests", JSON.stringify(demoInvitados));
            }
        }
        catch (error) {
            console.error("Error al cargar datos:", error);
            setMesas([]);
            setInvitados([]);
        }
    }, []);
    const saveState = (newInvitados, newMesas) => {
        setInvitados(newInvitados);
        setMesas(newMesas);
        localStorage.setItem("wedding.guests", JSON.stringify(newInvitados));
        localStorage.setItem("wedding.tables", JSON.stringify(newMesas));
    };
    const handleDrop = (result) => {
        if (!result.destination)
            return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId)
            return;
        const invitado = invitados.find((i) => i.id === draggableId);
        if (!invitado)
            return;
        const updated = invitados.map((i) => {
            if (i.id === draggableId) {
                if (destination.droppableId === "sinMesa") {
                    return { ...i, mesa: undefined };
                }
                else {
                    return { ...i, mesa: destination.droppableId };
                }
            }
            return i;
        });
        saveState(updated, mesas);
    };
    const addMesa = () => {
        const usados = mesas.map((m) => m.nombre.replace("Mesa ", ""));
        const opciones = nombresMesas[plantilla].filter((n) => !usados.includes(n));
        let nuevoNombre = opciones[0];
        if (!nuevoNombre) {
            nuevoNombre = `${mesas.length + 1}`; // Nombres numéricos cuando se acaban los predeterminados
        }
        const nuevaMesa = {
            id: Date.now().toString(),
            nombre: `Mesa ${nuevoNombre}`,
        };
        const nuevas = [...mesas, nuevaMesa];
        saveState(invitados, nuevas);
    };
    const removeMesa = (id) => {
        const nuevasMesas = mesas.filter((m) => m.id !== id);
        const invitadosActualizados = invitados.map((i) => i.mesa === id ? { ...i, mesa: undefined } : i);
        saveState(invitadosActualizados, nuevasMesas);
    };
    const resetMesas = () => {
        const invitadosReseteados = invitados.map((i) => ({ ...i, mesa: undefined }));
        setInvitados(invitadosReseteados);
        localStorage.setItem("wedding.guests", JSON.stringify(invitadosReseteados));
    };
    // Siempre mostrar invitados arriba
    const invitadosSinMesa = invitados.filter((i) => !i.mesa).length > 0
        ? invitados.filter((i) => !i.mesa)
        : invitados;
    return (_jsxs("section", { className: "text-white p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4 text-center", children: "Distribuci\u00F3n de Mesas" }), _jsx("div", { className: "flex justify-center gap-3 mb-4", children: _jsxs("label", { className: "text-sm font-semibold flex items-center gap-2", children: ["Estilo de nombres:", _jsxs("select", { value: plantilla, onChange: (e) => setPlantilla(e.target.value), className: "bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm", children: [_jsx("option", { value: "Rom\u00E1ntico", children: "Rom\u00E1ntico" }), _jsx("option", { value: "Divertido", children: "Divertido" }), _jsx("option", { value: "Elegante", children: "Elegante" }), _jsx("option", { value: "Viajes", children: "Viajes" })] })] }) }), _jsxs("div", { className: "flex justify-center gap-3 mb-6", children: [_jsx("button", { onClick: addMesa, className: "bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm", children: "\u2795 A\u00F1adir Mesa" }), _jsx("button", { onClick: resetMesas, className: "bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded text-sm", children: "\u21BA Restablecer Distribuci\u00F3n" })] }), _jsxs(DragDropContext, { onDragEnd: handleDrop, children: [_jsx(Droppable, { droppableId: "sinMesa", direction: "horizontal", children: (provided) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: "mb-10 bg-white/5 p-4 rounded-lg border border-white/10 flex flex-wrap gap-3 min-h-[80px]", children: [invitadosSinMesa.map((inv, index) => (_jsx(Draggable, { draggableId: inv.id, index: index, children: (provided) => (_jsx("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, className: "bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm cursor-move", children: inv.nombre })) }, inv.id))), provided.placeholder] })) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: mesas.map((mesa) => (_jsx(Droppable, { droppableId: mesa.id, children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: `bg-white/10 border border-white/20 rounded-lg p-4 shadow-md transition-all ${snapshot.isDraggingOver ? "bg-green-600/40" : ""}`, children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("h3", { className: "text-xl font-semibold", children: mesa.nombre }), _jsx("button", { onClick: () => removeMesa(mesa.id), className: "text-red-400 text-xs hover:text-red-300", children: "Eliminar" })] }), _jsxs("div", { className: "space-y-2 min-h-[60px]", children: [invitados
                                                .filter((i) => i.mesa === mesa.id)
                                                .map((inv, index) => (_jsx(Draggable, { draggableId: inv.id, index: index, children: (provided) => (_jsx("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, className: "bg-white/20 rounded px-3 py-1 flex justify-between items-center text-sm cursor-move", children: _jsx("span", { children: inv.nombre }) })) }, inv.id))), provided.placeholder, invitados.filter((i) => i.mesa === mesa.id).length === 0 && (_jsx("p", { className: "text-white/50 text-sm text-center", children: "Sin invitados" }))] })] })) }, mesa.id))) })] })] }));
}
