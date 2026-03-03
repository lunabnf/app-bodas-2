import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { describeRoomAudience, } from "../services/chatService";
import { deleteAdminChatRoom, emptyRoomForm, formatChatDate, loadChatMessages, loadChatRooms, mapRoomToForm, saveAdminChatRoom, sendAdminChatMessage, } from "../application/chatApplicationService";
import { useAuth } from "../store/useAuth";
const GROUP_OPTIONS = [
    { value: "familia_novia", label: "Familia de la novia" },
    { value: "familia_novio", label: "Familia del novio" },
    { value: "amigos_novia", label: "Amigos de la novia" },
    { value: "amigos_novio", label: "Amigos del novio" },
    { value: "amigos_comunes", label: "Amigos comunes" },
    { value: "amigos_trabajo", label: "Amigos del trabajo" },
    { value: "amigos_pueblo", label: "Amigos del pueblo" },
    { value: "proveedores", label: "Proveedores" },
    { value: "otros", label: "Otros" },
];
export default function ChatAdmin() {
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [form, setForm] = useState(emptyRoomForm);
    const [draft, setDraft] = useState("");
    const adminName = useAuth((state) => (state.esAdmin ? "Administrador" : ""));
    const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId) ?? null, [rooms, selectedRoomId]);
    async function loadRooms() {
        const storedRooms = await loadChatRooms();
        setRooms(storedRooms);
        setSelectedRoomId((current) => current && storedRooms.some((room) => room.id === current)
            ? current
            : storedRooms[0]?.id || "");
    }
    async function loadMessages(roomId) {
        const roomMessages = await loadChatMessages(roomId);
        setMessages(roomMessages);
    }
    useEffect(() => {
        void loadRooms();
    }, []);
    useEffect(() => {
        if (!selectedRoomId) {
            setMessages([]);
            return;
        }
        void loadMessages(selectedRoomId);
    }, [selectedRoomId]);
    useEffect(() => {
        if (selectedRoom) {
            setForm(mapRoomToForm(selectedRoom));
        }
        else {
            setForm(emptyRoomForm);
        }
    }, [selectedRoom]);
    async function handleSaveRoom() {
        const room = await saveAdminChatRoom({ form, adminName });
        if (!room)
            return;
        await loadRooms();
        setSelectedRoomId(room.id);
    }
    async function handleDeleteRoom(roomId) {
        const deleted = await deleteAdminChatRoom({ roomId, rooms, adminName });
        if (!deleted)
            return;
        await loadRooms();
    }
    async function handleSendAdminMessage() {
        const sent = await sendAdminChatMessage({
            selectedRoomId,
            selectedRoomName: selectedRoom?.name || "",
            draft,
            adminName,
        });
        if (!sent)
            return;
        setDraft("");
        await loadMessages(selectedRoomId);
    }
    function toggleGroup(group) {
        setForm((current) => ({
            ...current,
            allowedGroups: current.allowedGroups.includes(group)
                ? current.allowedGroups.filter((entry) => entry !== group)
                : [...current.allowedGroups, group],
        }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "app-surface p-8", children: [_jsx("p", { className: "app-kicker", children: "Chat" }), _jsx("h1", { className: "app-page-title mt-4", children: "Salas del chat" }), _jsx("p", { className: "mt-3 app-subtitle", children: "Crea salas para todos, para grupos concretos o por rango de edad. Si una sala usa edad, el invitado necesita tener ese dato informado en su ficha." })] }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]", children: [_jsxs("aside", { className: "app-panel p-5", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "app-section-heading", children: "Salas activas" }), _jsx("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: "Gestiona acceso y revisa la conversaci\u00F3n reciente." })] }), _jsx("button", { type: "button", onClick: () => {
                                            setSelectedRoomId("");
                                            setForm(emptyRoomForm);
                                        }, className: "app-button-secondary px-4 py-2 text-sm", children: "Nueva" })] }), _jsx("div", { className: "mt-4 space-y-3", children: rooms.map((room) => (_jsxs("div", { className: `rounded-[20px] border p-4 ${room.id === selectedRoomId
                                        ? "border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                                        : "border-[var(--app-line)] bg-white/72"}`, children: [_jsxs("button", { type: "button", onClick: () => setSelectedRoomId(room.id), className: "w-full text-left", children: [_jsx("div", { className: "font-semibold", children: room.name }), _jsx("div", { className: `mt-1 text-sm ${room.id === selectedRoomId ? "text-white/80" : "text-[var(--app-muted)]"}`, children: room.description || "Sin descripción" }), _jsx("div", { className: `mt-2 text-xs uppercase tracking-[0.14em] ${room.id === selectedRoomId ? "text-white/70" : "text-[var(--app-muted)]"}`, children: describeRoomAudience(room) })] }), room.id !== "general" ? (_jsx("button", { type: "button", onClick: () => void handleDeleteRoom(room.id), className: `mt-3 text-sm ${room.id === selectedRoomId ? "text-white/80" : "text-red-600"}`, children: "Eliminar sala" })) : null] }, room.id))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("section", { className: "app-panel p-5 sm:p-6", children: [_jsx("div", { className: "flex items-center justify-between gap-4", children: _jsxs("div", { children: [_jsx("h2", { className: "app-section-heading", children: form.id ? "Editar sala" : "Nueva sala" }), _jsx("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: "Controla nombre, descripci\u00F3n y qui\u00E9n entra en cada sala." })] }) }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Nombre" }), _jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), className: "w-full p-3", placeholder: "Ej: Amigos del viernes" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Descripci\u00F3n" }), _jsx("textarea", { rows: 3, value: form.description, onChange: (event) => setForm((current) => ({ ...current, description: event.target.value })), className: "w-full p-3", placeholder: "Qu\u00E9 se comenta aqu\u00ED o a qui\u00E9n va dirigida la sala" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Acceso" }), _jsxs("select", { value: form.audience, onChange: (event) => setForm((current) => ({
                                                            ...current,
                                                            audience: event.target.value,
                                                        })), className: "w-full p-3", children: [_jsx("option", { value: "all", children: "Todos" }), _jsx("option", { value: "adults", children: "Solo adultos" }), _jsx("option", { value: "children", children: "Solo ni\u00F1os" }), _jsx("option", { value: "groups", children: "Grupos concretos" }), _jsx("option", { value: "age_range", children: "Rango de edad" })] })] }), form.audience === "age_range" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Edad m\u00EDnima" }), _jsx("input", { type: "number", min: "0", value: form.minAge, onChange: (event) => setForm((current) => ({ ...current, minAge: event.target.value })), className: "w-full p-3" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Edad m\u00E1xima" }), _jsx("input", { type: "number", min: "0", value: form.maxAge, onChange: (event) => setForm((current) => ({ ...current, maxAge: event.target.value })), className: "w-full p-3" })] })] })) : null, form.audience === "groups" ? (_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "mb-2 block text-sm font-medium", children: "Grupos con acceso" }), _jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: GROUP_OPTIONS.map((option) => (_jsxs("label", { className: "flex items-center gap-3 rounded-[18px] border border-[var(--app-line)] bg-white/70 px-4 py-3", children: [_jsx("input", { type: "checkbox", checked: form.allowedGroups.includes(option.value), onChange: () => toggleGroup(option.value) }), _jsx("span", { className: "text-sm", children: option.label })] }, option.value))) })] })) : null] }), _jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [_jsx("button", { type: "button", onClick: () => void handleSaveRoom(), className: "app-button-primary", children: form.id ? "Guardar cambios" : "Crear sala" }), form.id ? (_jsx("button", { type: "button", onClick: () => {
                                                    setSelectedRoomId("");
                                                    setForm(emptyRoomForm);
                                                }, className: "app-button-secondary", children: "Limpiar selecci\u00F3n" })) : null] })] }), _jsxs("section", { className: "app-panel p-5 sm:p-6", children: [_jsx("div", { className: "flex items-center justify-between gap-3 border-b border-[var(--app-line)] pb-4", children: _jsxs("div", { children: [_jsx("h2", { className: "app-section-heading", children: "Vista de conversaci\u00F3n" }), _jsxs("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: [selectedRoom ? selectedRoom.name : "Selecciona una sala", "."] })] }) }), selectedRoom ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "max-h-[340px] overflow-auto py-4", children: messages.length === 0 ? (_jsx("div", { className: "app-surface-soft p-6 text-sm text-[var(--app-muted)]", children: "Todav\u00EDa no hay mensajes en esta sala." })) : (_jsx("div", { className: "space-y-3", children: messages.map((message) => (_jsxs("article", { className: `rounded-[20px] border px-4 py-3 ${message.authorType === "admin"
                                                            ? "ml-auto max-w-[80%] border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                                                            : "max-w-[80%] border-[var(--app-line)] bg-white/75"}`, children: [_jsxs("div", { className: `text-xs uppercase tracking-[0.14em] ${message.authorType === "admin" ? "text-white/70" : "text-[var(--app-muted)]"}`, children: [message.authorName, " \u00B7 ", formatChatDate(message.createdAt)] }), _jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm leading-6", children: message.body })] }, message.id))) })) }), _jsx("div", { className: "border-t border-[var(--app-line)] pt-4", children: _jsxs("div", { className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]", children: [_jsx("textarea", { rows: 3, value: draft, onChange: (event) => setDraft(event.target.value), className: "w-full resize-none p-3", placeholder: "Escribe como administrador..." }), _jsx("button", { type: "button", onClick: () => void handleSendAdminMessage(), className: "app-button-primary self-end", children: "Enviar" })] }) })] })) : (_jsx("div", { className: "app-surface-soft mt-4 p-6 text-sm text-[var(--app-muted)]", children: "Selecciona una sala para ver mensajes o crear una nueva." }))] })] })] })] }));
}
