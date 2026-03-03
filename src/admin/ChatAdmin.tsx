import { useEffect, useMemo, useState } from "react";
import type { ChatAudience, ChatMessage, ChatRoom } from "../domain/chat";
import type { GuestGroupType } from "../domain/guest";
import {
  describeRoomAudience,
} from "../services/chatService";
import {
  deleteAdminChatRoom,
  emptyRoomForm,
  formatChatDate,
  loadChatMessages,
  loadChatRooms,
  mapRoomToForm,
  type RoomFormState,
  saveAdminChatRoom,
  sendAdminChatMessage,
} from "../application/chatApplicationService";
import { useAuth } from "../store/useAuth";

const GROUP_OPTIONS: Array<{ value: GuestGroupType; label: string }> = [
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
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [form, setForm] = useState<RoomFormState>(emptyRoomForm);
  const [draft, setDraft] = useState("");
  const adminName = useAuth((state) => (state.esAdmin ? "Administrador" : ""));

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  async function loadRooms() {
    const storedRooms = await loadChatRooms();
    setRooms(storedRooms);
    setSelectedRoomId((current) =>
      current && storedRooms.some((room) => room.id === current)
        ? current
        : storedRooms[0]?.id || ""
    );
  }

  async function loadMessages(roomId: string) {
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
    } else {
      setForm(emptyRoomForm);
    }
  }, [selectedRoom]);

  async function handleSaveRoom() {
    const room = await saveAdminChatRoom({ form, adminName });
    if (!room) return;
    await loadRooms();
    setSelectedRoomId(room.id);
  }

  async function handleDeleteRoom(roomId: string) {
    const deleted = await deleteAdminChatRoom({ roomId, rooms, adminName });
    if (!deleted) return;
    await loadRooms();
  }

  async function handleSendAdminMessage() {
    const sent = await sendAdminChatMessage({
      selectedRoomId,
      selectedRoomName: selectedRoom?.name || "",
      draft,
      adminName,
    });
    if (!sent) return;
    setDraft("");
    await loadMessages(selectedRoomId);
  }

  function toggleGroup(group: GuestGroupType) {
    setForm((current) => ({
      ...current,
      allowedGroups: current.allowedGroups.includes(group)
        ? current.allowedGroups.filter((entry) => entry !== group)
        : [...current.allowedGroups, group],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="app-surface p-8">
        <p className="app-kicker">Chat</p>
        <h1 className="app-page-title mt-4">Salas del chat</h1>
        <p className="mt-3 app-subtitle">
          Crea salas para todos, para grupos concretos o por rango de edad. Si una sala usa edad,
          el invitado necesita tener ese dato informado en su ficha.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="app-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="app-section-heading">Salas activas</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Gestiona acceso y revisa la conversación reciente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedRoomId("");
                setForm(emptyRoomForm);
              }}
              className="app-button-secondary px-4 py-2 text-sm"
            >
              Nueva
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`rounded-[20px] border p-4 ${
                  room.id === selectedRoomId
                    ? "border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                    : "border-[var(--app-line)] bg-white/72"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className="w-full text-left"
                >
                  <div className="font-semibold">{room.name}</div>
                  <div className={`mt-1 text-sm ${room.id === selectedRoomId ? "text-white/80" : "text-[var(--app-muted)]"}`}>
                    {room.description || "Sin descripción"}
                  </div>
                  <div className={`mt-2 text-xs uppercase tracking-[0.14em] ${room.id === selectedRoomId ? "text-white/70" : "text-[var(--app-muted)]"}`}>
                    {describeRoomAudience(room)}
                  </div>
                </button>
                {room.id !== "general" ? (
                  <button
                    type="button"
                    onClick={() => void handleDeleteRoom(room.id)}
                    className={`mt-3 text-sm ${room.id === selectedRoomId ? "text-white/80" : "text-red-600"}`}
                  >
                    Eliminar sala
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="app-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="app-section-heading">
                  {form.id ? "Editar sala" : "Nueva sala"}
                </h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  Controla nombre, descripción y quién entra en cada sala.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Nombre</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full p-3"
                  placeholder="Ej: Amigos del viernes"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full p-3"
                  placeholder="Qué se comenta aquí o a quién va dirigida la sala"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Acceso</label>
                <select
                  value={form.audience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      audience: event.target.value as ChatAudience,
                    }))
                  }
                  className="w-full p-3"
                >
                  <option value="all">Todos</option>
                  <option value="adults">Solo adultos</option>
                  <option value="children">Solo niños</option>
                  <option value="groups">Grupos concretos</option>
                  <option value="age_range">Rango de edad</option>
                </select>
              </div>

              {form.audience === "age_range" ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Edad mínima</label>
                    <input
                      type="number"
                      min="0"
                      value={form.minAge}
                      onChange={(event) => setForm((current) => ({ ...current, minAge: event.target.value }))}
                      className="w-full p-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Edad máxima</label>
                    <input
                      type="number"
                      min="0"
                      value={form.maxAge}
                      onChange={(event) => setForm((current) => ({ ...current, maxAge: event.target.value }))}
                      className="w-full p-3"
                    />
                  </div>
                </>
              ) : null}

              {form.audience === "groups" ? (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Grupos con acceso</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {GROUP_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 rounded-[18px] border border-[var(--app-line)] bg-white/70 px-4 py-3"
                      >
                        <input
                          type="checkbox"
                          checked={form.allowedGroups.includes(option.value)}
                          onChange={() => toggleGroup(option.value)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleSaveRoom()}
                className="app-button-primary"
              >
                {form.id ? "Guardar cambios" : "Crear sala"}
              </button>
              {form.id ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoomId("");
                    setForm(emptyRoomForm);
                  }}
                  className="app-button-secondary"
                >
                  Limpiar selección
                </button>
              ) : null}
            </div>
          </section>

          <section className="app-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--app-line)] pb-4">
              <div>
                <h2 className="app-section-heading">Vista de conversación</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  {selectedRoom ? selectedRoom.name : "Selecciona una sala"}.
                </p>
              </div>
            </div>

            {selectedRoom ? (
              <>
                <div className="max-h-[340px] overflow-auto py-4">
                  {messages.length === 0 ? (
                    <div className="app-surface-soft p-6 text-sm text-[var(--app-muted)]">
                      Todavía no hay mensajes en esta sala.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <article
                          key={message.id}
                          className={`rounded-[20px] border px-4 py-3 ${
                            message.authorType === "admin"
                              ? "ml-auto max-w-[80%] border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                              : "max-w-[80%] border-[var(--app-line)] bg-white/75"
                          }`}
                        >
                          <div className={`text-xs uppercase tracking-[0.14em] ${message.authorType === "admin" ? "text-white/70" : "text-[var(--app-muted)]"}`}>
                            {message.authorName} · {formatChatDate(message.createdAt)}
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                            {message.body}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--app-line)] pt-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <textarea
                      rows={3}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      className="w-full resize-none p-3"
                      placeholder="Escribe como administrador..."
                    />
                    <button
                      type="button"
                      onClick={() => void handleSendAdminMessage()}
                      className="app-button-primary self-end"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="app-surface-soft mt-4 p-6 text-sm text-[var(--app-muted)]">
                Selecciona una sala para ver mensajes o crear una nueva.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
