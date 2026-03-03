import { useEffect, useMemo, useState } from "react";
import type { ChatMessage, ChatRoom } from "../domain/chat";
import {
  describeRoomAudience,
} from "../services/chatService";
import {
  filterAvailableChatRooms,
  formatChatHour,
  loadChatMessages,
  loadChatRooms,
  sendGuestChatMessage,
} from "../application/chatApplicationService";
import { useAuth } from "../store/useAuth";

export default function ChatPage() {
  const invitado = useAuth((state) => state.invitado);
  const esAdmin = useAuth((state) => state.esAdmin);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const availableRooms = useMemo(
    () => filterAvailableChatRooms(rooms, { esAdmin, invitado }),
    [rooms, esAdmin, invitado]
  );

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

    setSelectedRoomId((current) =>
      current && availableRooms.some((room) => room.id === current)
        ? current
        : (availableRooms[0]?.id ?? "")
    );
  }, [availableRooms]);

  useEffect(() => {
    if (!selectedRoomId) return;

    void (async () => {
      const roomMessages = await loadChatMessages(selectedRoomId);
      setMessages(roomMessages);
    })();
  }, [selectedRoomId]);

  async function refreshRoomMessages(roomId: string) {
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
    if (!sent) return;

    setDraft("");
    await refreshRoomMessages(selectedRoomId);
  }

  if (!esAdmin && !invitado) {
    return (
      <section className="app-surface mx-auto max-w-3xl p-8 sm:p-10">
        <p className="app-kicker">Chat</p>
        <h1 className="app-page-title mt-4">Accede como invitado para entrar al chat</h1>
        <p className="mt-4 app-subtitle">
          Los novios pueden crear salas distintas y decidir qué invitados tienen acceso a cada una.
        </p>
      </section>
    );
  }

  const activeRoom = availableRooms.find((room) => room.id === selectedRoomId) ?? null;

  return (
    <section className="space-y-6 px-1 py-2 sm:px-2">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Participación</p>
        <h1 className="app-page-title mt-4">Chat de la boda</h1>
        <p className="mt-3 app-subtitle">
          Salas compartidas para invitados y novios, con acceso controlado desde el panel de administración.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="app-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="app-section-heading">Salas</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                {esAdmin ? "Ves todas las salas." : "Solo ves las salas permitidas para ti."}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-[var(--app-muted)]">Cargando salas...</p>
            ) : availableRooms.length === 0 ? (
              <p className="text-sm text-[var(--app-muted)]">
                No hay salas disponibles para tu perfil.
              </p>
            ) : (
              availableRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${
                    room.id === selectedRoomId
                      ? "border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                      : "border-[var(--app-line)] bg-white/70 hover:bg-white"
                  }`}
                >
                  <div className="font-semibold">{room.name}</div>
                  {room.description ? (
                    <div className={`mt-1 text-sm ${room.id === selectedRoomId ? "text-white/80" : "text-[var(--app-muted)]"}`}>
                      {room.description}
                    </div>
                  ) : null}
                  <div className={`mt-2 text-xs uppercase tracking-[0.14em] ${room.id === selectedRoomId ? "text-white/70" : "text-[var(--app-muted)]"}`}>
                    {describeRoomAudience(room)}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="app-panel flex min-h-[520px] flex-col p-4 sm:p-5">
          {activeRoom ? (
            <>
              <div className="border-b border-[var(--app-line)] pb-4">
                <h2 className="app-section-heading">{activeRoom.name}</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  {activeRoom.description || describeRoomAudience(activeRoom)}
                </p>
              </div>

              <div className="flex-1 overflow-auto py-4">
                {messages.length === 0 ? (
                  <div className="app-surface-soft flex h-full min-h-[240px] items-center justify-center p-6 text-center">
                    <p className="text-sm text-[var(--app-muted)]">
                      Todavía no hay mensajes. Empieza la conversación.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const ownMessage =
                        (esAdmin && message.authorType === "admin") ||
                        (!!invitado && message.authorToken === invitado.token);

                      return (
                        <article
                          key={message.id}
                          className={`max-w-[85%] rounded-[22px] border px-4 py-3 shadow-[var(--app-shadow-soft)] ${
                            ownMessage
                              ? "ml-auto border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                              : "border-[var(--app-line)] bg-white/78"
                          }`}
                        >
                          <div className={`text-xs uppercase tracking-[0.14em] ${ownMessage ? "text-white/70" : "text-[var(--app-muted)]"}`}>
                            {message.authorName} · {formatChatHour(message.createdAt)}
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                            {message.body}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--app-line)] pt-4">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <textarea
                    rows={3}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full resize-none p-3"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    className="app-button-primary self-end"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="app-surface-soft flex h-full min-h-[320px] items-center justify-center p-6 text-center">
              <p className="text-sm text-[var(--app-muted)]">
                No tienes salas disponibles ahora mismo.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
