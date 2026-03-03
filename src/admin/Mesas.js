import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { assignGuestToTable, loadGuestsAdminData } from "../application/adminGuestsService";
export default function MesasAdmin() {
    const [invitados, setInvitados] = useState([]);
    const [mesas, setMesas] = useState([]);
    useEffect(() => {
        void (async () => {
            const { invitados: loadedInvitados, mesas: loadedMesas } = await loadGuestsAdminData();
            setInvitados(loadedInvitados);
            setMesas(loadedMesas);
        })();
    }, []);
    const asignarMesa = async (token, mesaId) => {
        const updated = await assignGuestToTable(invitados, mesas, token, mesaId);
        setInvitados(updated.invitados);
        setMesas(updated.mesas);
    };
    if (mesas.length === 0) {
        return _jsx("p", { className: "text-white p-6", children: "Cargando mesas..." });
    }
    return (_jsxs("section", { className: "text-white p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Gesti\u00F3n de Mesas" }), _jsxs("table", { className: "w-full text-left border border-white/10 rounded-lg overflow-hidden", children: [_jsx("thead", { className: "bg-white/10", children: _jsxs("tr", { children: [_jsx("th", { className: "p-2", children: "Invitado" }), _jsx("th", { className: "p-2", children: "Mesa" })] }) }), _jsx("tbody", { children: invitados.map((inv) => (_jsxs("tr", { className: "border-t border-white/10", children: [_jsx("td", { className: "p-2", children: inv.nombre }), _jsx("td", { className: "p-2", children: _jsxs("select", { value: inv.mesa || "", onChange: (e) => void asignarMesa(inv.token, e.target.value), className: "bg-black/30 border border-white/20 rounded px-2 py-1 text-white", children: [_jsx("option", { value: "", children: "Sin asignar" }), mesas.map((m) => (_jsx("option", { value: m.id, children: m.nombre }, m.id)))] }) })] }, inv.token))) })] })] }));
}
