import type { ChatAudience, ChatMessage, ChatRoom } from "../domain/chat";
import type { GuestGroupType, GuestSession } from "../domain/guest";
import { registrarActividad } from "../services/actividadService";
import {
  canAccessChatRoom,
  deleteChatRoom,
  getChatMessages,
  getChatRooms,
  saveChatRoom,
  sendChatMessage,
} from "../services/chatService";
import { addLog } from "../services/logsService";

export type RoomFormState = {
  id: string;
  name: string;
  description: string;
  audience: ChatAudience;
  allowedGroups: GuestGroupType[];
  minAge: string;
  maxAge: string;
};

export const emptyRoomForm: RoomFormState = {
  id: "",
  name: "",
  description: "",
  audience: "all",
  allowedGroups: [],
  minAge: "",
  maxAge: "",
};

export function mapRoomToForm(room: ChatRoom): RoomFormState {
  return {
    id: room.id,
    name: room.name,
    description: room.description || "",
    audience: room.audience,
    allowedGroups: room.allowedGroups || [],
    minAge: typeof room.minAge === "number" ? String(room.minAge) : "",
    maxAge: typeof room.maxAge === "number" ? String(room.maxAge) : "",
  };
}

export function formatChatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatChatHour(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function loadChatRooms(): Promise<ChatRoom[]> {
  return getChatRooms();
}

export async function loadChatMessages(roomId: string): Promise<ChatMessage[]> {
  return getChatMessages(roomId);
}

export function filterAvailableChatRooms(
  rooms: ChatRoom[],
  options: { esAdmin: boolean; invitado: GuestSession | null }
): ChatRoom[] {
  return rooms.filter((room) =>
    canAccessChatRoom(room, {
      isAdmin: options.esAdmin,
      guest: options.invitado,
    })
  );
}

export async function sendGuestChatMessage(input: {
  selectedRoomId: string;
  draft: string;
  esAdmin: boolean;
  invitado: GuestSession | null;
}): Promise<boolean> {
  const body = input.draft.trim();
  if (!body || !input.selectedRoomId) return false;
  if (!input.invitado && !input.esAdmin) return false;

  const authorName = input.esAdmin ? "Administrador" : input.invitado?.nombre || "Invitado";

  await sendChatMessage({
    roomId: input.selectedRoomId,
    authorType: input.esAdmin ? "admin" : "guest",
    authorName,
    ...(input.invitado?.token ? { authorToken: input.invitado.token } : {}),
    body,
  });

  if (input.esAdmin) {
    await addLog(authorName, `Envió un mensaje en el chat: ${body.slice(0, 60)}`);
  } else if (input.invitado) {
    await registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "chat_mensaje",
      mensaje: `${input.invitado.nombre} envió un mensaje en el chat`,
      tokenInvitado: input.invitado.token,
    });
  }

  return true;
}

export async function saveAdminChatRoom(input: {
  form: RoomFormState;
  adminName: string;
}): Promise<ChatRoom | null> {
  const name = input.form.name.trim();
  if (!name) return null;

  const room = await saveChatRoom({
    id: input.form.id || crypto.randomUUID(),
    name,
    description: input.form.description.trim(),
    audience: input.form.audience,
    ...(input.form.audience === "groups" && input.form.allowedGroups.length > 0
      ? { allowedGroups: input.form.allowedGroups }
      : {}),
    ...(input.form.audience === "age_range" && input.form.minAge
      ? { minAge: Number(input.form.minAge) }
      : {}),
    ...(input.form.audience === "age_range" && input.form.maxAge
      ? { maxAge: Number(input.form.maxAge) }
      : {}),
  });

  await addLog(
    input.adminName,
    `${input.form.id ? "Actualizó" : "Creó"} sala de chat: ${room.name}`
  );
  await registrarActividad({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    tipo: "chat_admin",
    mensaje: `${input.adminName} ${input.form.id ? "actualizó" : "creó"} la sala "${room.name}"`,
  });

  return room;
}

export async function deleteAdminChatRoom(input: {
  roomId: string;
  rooms: ChatRoom[];
  adminName: string;
}): Promise<boolean> {
  const room = input.rooms.find((entry) => entry.id === input.roomId);
  if (!room || room.id === "general") return false;

  await deleteChatRoom(input.roomId);
  await addLog(input.adminName, `Eliminó sala de chat: ${room.name}`);
  return true;
}

export async function sendAdminChatMessage(input: {
  selectedRoomId: string;
  selectedRoomName: string;
  draft: string;
  adminName: string;
}): Promise<boolean> {
  const body = input.draft.trim();
  if (!body || !input.selectedRoomId) return false;

  await sendChatMessage({
    roomId: input.selectedRoomId,
    authorType: "admin",
    authorName: input.adminName,
    body,
  });

  await addLog(
    input.adminName,
    `Envió un mensaje en la sala: ${input.selectedRoomName || input.selectedRoomId}`
  );
  await registrarActividad({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    tipo: "chat_admin_mensaje",
    mensaje: `${input.adminName} escribió en la sala "${input.selectedRoomName || input.selectedRoomId}"`,
  });

  return true;
}
