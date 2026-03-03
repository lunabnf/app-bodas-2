import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { describeRoomAudience, } from "../services/chatService";
import { filterAvailableChatRooms, formatChatHour, loadChatMessages, loadChatRooms, sendGuestChatMessage, } from "../application/chatApplicationService";
import { useAuth } from "../store/useAuth";
export default function ChatPage() {
    const invitado = useAuth((state) => state.invitado);
    const esAdmin = useAuth((state) => state.esAdmin);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const availableRooms = useMemo(() => filterAvailableChatRooms(rooms, { esAdmin, invitado }), [rooms, esAdmin, invitado]);
    useEffect(() => {
        void (async () => {
            setLoading(true);
            const storedRooms = await loadChatRooms();
            setRooms(storedRooms);
            setLoading(false);
        })();
    }, []);
    useEffect(() => {
        if (availableRooms.length === 0) {
            setSelectedRoomId("");
            setMessages([]);
            return;
        }
        setSelectedRoomId((current) => current && availableRooms.some((room) => room.id === current)
            ? current
            : (availableRooms[0]?.id ?? ""));
    }, [availableRooms]);
    useEffect(() => {
        if (!selectedRoomId)
            return;
        void (async () => {
            const roomMessages = await loadChatMessages(selectedRoomId);
            setMessages(roomMessages);
        })();
    }, [selectedRoomId]);
    async function refreshRoomMessages(roomId) {
        const roomMessages = await loadChatMessages(roomId);
        setMessages(roomMessages);
    }
    async function handleSendMessage() {
        const sent = await sendGuestChatMessage({
            selectedRoomId,
            draft,
            esAdmin,
            invitado,
        });
        if (!sent)
            return;
        setDraft("");
        await refreshRoomMessages(selectedRoomId);
    }
    if (!esAdmin && !invitado) {
        return (_jsxs("section", { className: "app-surface mx-auto max-w-3xl p-8 sm:p-10", children: [_jsx("p", { className: "app-kicker", children: "Chat" }), _jsx("h1", { className: "app-page-title mt-4", children: "Accede como invitado para entrar al chat" }), _jsx("p", { className: "mt-4 app-subtitle", children: "Los novios pueden crear salas distintas y decidir qu\u00E9 invitados tienen acceso a cada una." })] }));
    }
    const activeRoom = availableRooms.find((room) => room.id === selectedRoomId) ?? null;
    return (_jsxs("section", { className: "space-y-6 px-1 py-2 sm:px-2", children: [_jsxs("div", { className: "app-surface p-6 sm:p-8", children: [_jsx("p", { className: "app-kicker", children: "Participaci\u00F3n" }), _jsx("h1", { className: "app-page-title mt-4", children: "Chat de la boda" }), _jsx("p", { className: "mt-3 app-subtitle", children: "Salas compartidas para invitados y novios, con acceso controlado desde el panel de administraci\u00F3n." })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]", children: [_jsxs("aside", { className: "app-panel p-4 sm:p-5", children: [_jsx("div", { className: "flex items-center justify-between gap-3", children: _jsxs("div", { children: [_jsx("h2", { className: "app-section-heading", children: "Salas" }), _jsx("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: esAdmin ? "Ves todas las salas." : "Solo ves las salas permitidas para ti." })] }) }), _jsx("div", { className: "mt-4 space-y-3", children: loading ? (_jsx("p", { className: "text-sm text-[var(--app-muted)]", children: "Cargando salas..." })) : availableRooms.length === 0 ? (_jsx("p", { className: "text-sm text-[var(--app-muted)]", children: "No hay salas disponibles para tu perfil." })) : (availableRooms.map((room) => (_jsxs("button", { type: "button", onClick: () => setSelectedRoomId(room.id), className: `w-full rounded-[18px] border px-4 py-3 text-left transition ${room.id === selectedRoomId
                                        ? "border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                                        : "border-[var(--app-line)] bg-white/70 hover:bg-white"}`, children: [_jsx("div", { className: "font-semibold", children: room.name }), room.description ? (_jsx("div", { className: `mt-1 text-sm ${room.id === selectedRoomId ? "text-white/80" : "text-[var(--app-muted)]"}`, children: room.description })) : null, _jsx("div", { className: `mt-2 text-xs uppercase tracking-[0.14em] ${room.id === selectedRoomId ? "text-white/70" : "text-[var(--app-muted)]"}`, children: describeRoomAudience(room) })] }, room.id)))) })] }), _jsx("div", { className: "app-panel flex min-h-[520px] flex-col p-4 sm:p-5", children: activeRoom ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "border-b border-[var(--app-line)] pb-4", children: [_jsx("h2", { className: "app-section-heading", children: activeRoom.name }), _jsx("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: activeRoom.description || describeRoomAudience(activeRoom) })] }), _jsx("div", { className: "flex-1 overflow-auto py-4", children: messages.length === 0 ? (_jsx("div", { className: "app-surface-soft flex h-full min-h-[240px] items-center justify-center p-6 text-center", children: _jsx("p", { className: "text-sm text-[var(--app-muted)]", children: "Todav\u00EDa no hay mensajes. Empieza la conversaci\u00F3n." }) })) : (_jsx("div", { className: "space-y-3", children: messages.map((message) => {
                                            const ownMessage = (esAdmin && message.authorType === "admin") ||
                                                (!!invitado && message.authorToken === invitado.token);
                                            return (_jsxs("article", { className: `max-w-[85%] rounded-[22px] border px-4 py-3 shadow-[var(--app-shadow-soft)] ${ownMessage
                                                    ? "ml-auto border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                                                    : "border-[var(--app-line)] bg-white/78"}`, children: [_jsxs("div", { className: `text-xs uppercase tracking-[0.14em] ${ownMessage ? "text-white/70" : "text-[var(--app-muted)]"}`, children: [message.authorName, " \u00B7 ", formatChatHour(message.createdAt)] }), _jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm leading-6", children: message.body })] }, message.id));
                                        }) })) }), _jsx("div", { className: "border-t border-[var(--app-line)] pt-4", children: _jsxs("div", { className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]", children: [_jsx("textarea", { rows: 3, value: draft, onChange: (event) => setDraft(event.target.value), placeholder: "Escribe tu mensaje...", className: "w-full resize-none p-3" }), _jsx("button", { type: "button", onClick: () => void handleSendMessage(), className: "app-button-primary self-end", children: "Enviar" })] }) })] })) : (_jsx("div", { className: "app-surface-soft flex h-full min-h-[320px] items-center justify-center p-6 text-center", children: _jsx("p", { className: "text-sm text-[var(--app-muted)]", children: "No tienes salas disponibles ahora mismo." }) })) })] })] }));
}
