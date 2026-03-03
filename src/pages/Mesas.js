import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { obtenerInvitados } from "../services/invitadosService";
import { obtenerMesas } from "../services/mesasService";
export default function Mesas() {
    const [guests, setGuests] = useState([]);
    const [tables, setTables] = useState([]);
    useEffect(() => {
        void (async () => {
            const [storedGuests, storedTables] = await Promise.all([
                obtenerInvitados(),
                obtenerMesas(),
            ]);
            setGuests(storedGuests);
            setTables(storedTables);
        })();
    }, []);
    if (tables.length === 0 || guests.length === 0) {
        return (_jsxs("section", { className: "min-h-screen text-white px-4 py-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Distribuci\u00F3n de Mesas" }), _jsx("p", { className: "text-white/70", children: "Todav\u00EDa no se ha publicado la organizaci\u00F3n de mesas." })] }));
    }
    return (_jsxs("section", { className: "min-h-screen text-white px-4 py-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6", children: "Distribuci\u00F3n de Mesas" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: tables.map(t => {
                    const assigned = guests.filter(g => g.mesa === t.id);
                    const captain = assigned.find(g => g.token === t.captainToken);
                    return (_jsxs("article", { className: "rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: t.nombre }), assigned.length === 0 ? (_jsx("p", { className: "text-white/70 italic", children: "No hay invitados asignados." })) : (_jsx("ul", { className: "space-y-2", children: assigned.map(g => (_jsxs("li", { className: "flex items-center gap-2 text-sm opacity-90", children: [g.nombre, captain && captain.token === g.token && (_jsx("span", { className: "text-yellow-400 text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 select-none", children: "\u2B50 Capit\u00E1n" }))] }, g.token))) }))] }, t.id));
                }) })] }));
}
