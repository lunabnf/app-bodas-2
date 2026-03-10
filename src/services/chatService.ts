import type {
  ChatMessage,
  ChatRoom,
  ChatViewer,
} from "../domain/chat";
import { z } from "zod";
import { chatMessageSchema, chatRoomSchema } from "../domain/schemas";
import type { GuestGroupType } from "../domain/guest";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { supabaseConfig } from "./supabaseConfig";
import { scopedStorageKey } from "./eventScopeService";

const ROOMS_KEY = "wedding.chat.rooms";
const MESSAGES_KEY = "wedding.chat.messages";
const chatRoomsSchema = z.array(chatRoomSchema);
const chatMessagesSchema = z.array(chatMessageSchema);

const DEFAULT_ROOM: ChatRoom = {
  id: "general",
  name: "General",
  description: "Sala principal para toda la boda.",
  audience: "all",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function normalizeRoom(raw: unknown, index: number): ChatRoom {
  const source = (raw ?? {}) as Partial<ChatRoom>;
  const allowedGroups = Array.isArray(source.allowedGroups)
    ? source.allowedGroups.filter(
        (group): group is GuestGroupType =>
          group === "familia_novia" ||
          group === "familia_novio" ||
          group === "amigos_novia" ||
          group === "amigos_novio" ||
          group === "amigos_comunes" ||
          group === "amigos_trabajo" ||
          group === "amigos_pueblo" ||
          group === "proveedores" ||
          group === "otros"
      )
    : [];

  return {
    id: source.id || `chat-room-${index + 1}`,
    name: source.name?.trim() || `Sala ${index + 1}`,
    description: source.description?.trim() || "",
    audience:
      source.audience === "adults" ||
      source.audience === "children" ||
      source.audience === "groups" ||
      source.audience === "age_range"
        ? source.audience
        : "all",
    ...(allowedGroups.length > 0 ? { allowedGroups } : {}),
    ...(typeof source.minAge === "number" ? { minAge: source.minAge } : {}),
    ...(typeof source.maxAge === "number" ? { maxAge: source.maxAge } : {}),
    createdAt: typeof source.createdAt === "number" ? source.createdAt : Date.now(),
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : Date.now(),
  };
}

function normalizeMessage(raw: unknown, index: number): ChatMessage {
  const source = (raw ?? {}) as Partial<ChatMessage>;

  return {
    id: source.id || `chat-message-${index + 1}`,
    roomId: source.roomId || DEFAULT_ROOM.id,
    authorType: source.authorType === "admin" ? "admin" : "guest",
    authorName: source.authorName?.trim() || "Invitado",
    body: source.body?.trim() || "",
    ...(source.authorToken ? { authorToken: source.authorToken } : {}),
    createdAt: typeof source.createdAt === "number" ? source.createdAt : Date.now(),
  };
}

function readLocalRooms(): ChatRoom[] {
  const scopedRoomsKey = scopedStorageKey(ROOMS_KEY);
  if (!localStorage.getItem(scopedRoomsKey)) {
    const legacyRooms = localStorage.getItem(ROOMS_KEY);
    if (legacyRooms) {
      localStorage.setItem(scopedRoomsKey, legacyRooms);
      localStorage.removeItem(ROOMS_KEY);
    } else {
      writeStorage(scopedRoomsKey, [DEFAULT_ROOM]);
    }
  }

  const parsed = readStorageWithSchema<unknown[]>(scopedRoomsKey, z.array(z.unknown()), []);
  const rooms = parsed.map((item, index) => normalizeRoom(item, index));
  const validated = chatRoomsSchema.safeParse(rooms);
  if (!validated.success || validated.data.length === 0) {
    writeStorage(scopedRoomsKey, [DEFAULT_ROOM]);
    return [DEFAULT_ROOM];
  }
  return validated.data as ChatRoom[];
}

function readLocalMessages(): ChatMessage[] {
  const scopedMessagesKey = scopedStorageKey(MESSAGES_KEY);
  if (!localStorage.getItem(scopedMessagesKey)) {
    const legacyMessages = localStorage.getItem(MESSAGES_KEY);
    if (legacyMessages) {
      localStorage.setItem(scopedMessagesKey, legacyMessages);
      localStorage.removeItem(MESSAGES_KEY);
    } else {
      return [];
    }
  }

  const parsed = readStorageWithSchema<unknown[]>(
    scopedMessagesKey,
    z.array(z.unknown()),
    []
  );
  const messages = parsed
    .map((item, index) => normalizeMessage(item, index))
    .filter((item) => item.body.length > 0);
  const validated = chatMessagesSchema.safeParse(messages);
  return validated.success ? (validated.data as ChatMessage[]) : [];
}

function saveLocalRooms(rooms: ChatRoom[]) {
  writeStorage(scopedStorageKey(ROOMS_KEY), rooms);
}

function saveLocalMessages(messages: ChatMessage[]) {
  writeStorage(scopedStorageKey(MESSAGES_KEY), messages);
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  if (!supabaseConfig.enabled) {
    return readLocalRooms().sort((a, b) => a.name.localeCompare(b.name));
  }

  return [];
}

export async function saveChatRoom(
  input: Omit<ChatRoom, "createdAt" | "updatedAt"> & { createdAt?: number }
): Promise<ChatRoom> {
  const rooms = await getChatRooms();
  const existing = rooms.find((room) => room.id === input.id);
  const nextRoom: ChatRoom = {
    id: input.id,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    audience: input.audience,
    ...(input.allowedGroups?.length ? { allowedGroups: input.allowedGroups } : {}),
    ...(typeof input.minAge === "number" ? { minAge: input.minAge } : {}),
    ...(typeof input.maxAge === "number" ? { maxAge: input.maxAge } : {}),
    createdAt: existing?.createdAt ?? input.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  const nextRooms = existing
    ? rooms.map((room) => (room.id === input.id ? nextRoom : room))
    : [...rooms, nextRoom];

  if (!supabaseConfig.enabled) {
    saveLocalRooms(nextRooms);
  }

  return nextRoom;
}

export async function deleteChatRoom(roomId: string): Promise<void> {
  if (roomId === DEFAULT_ROOM.id) return;

  const [rooms, messages] = await Promise.all([getChatRooms(), getChatMessages()]);
  const nextRooms = rooms.filter((room) => room.id !== roomId);
  const nextMessages = messages.filter((message) => message.roomId !== roomId);

  if (!supabaseConfig.enabled) {
    saveLocalRooms(nextRooms.length > 0 ? nextRooms : [DEFAULT_ROOM]);
    saveLocalMessages(nextMessages);
  }
}

export async function getChatMessages(roomId?: string): Promise<ChatMessage[]> {
  if (!supabaseConfig.enabled) {
    const messages = readLocalMessages().sort((a, b) => a.createdAt - b.createdAt);
    return roomId ? messages.filter((message) => message.roomId === roomId) : messages;
  }

  return [];
}

export async function sendChatMessage(
  input: Omit<ChatMessage, "id" | "createdAt">
): Promise<ChatMessage> {
  const message: ChatMessage = {
    roomId: input.roomId,
    authorType: input.authorType,
    authorName: input.authorName,
    body: input.body,
    ...(input.authorToken ? { authorToken: input.authorToken } : {}),
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const messages = await getChatMessages();
  const nextMessages = [...messages, message];

  if (!supabaseConfig.enabled) {
    saveLocalMessages(nextMessages);
  }

  return message;
}

export function canAccessChatRoom(room: ChatRoom, viewer: ChatViewer): boolean {
  if (viewer.isAdmin) return true;
  if (!viewer.guest) return false;

  switch (room.audience) {
    case "all":
      return true;
    case "adults":
      return viewer.guest.esAdulto !== false;
    case "children":
      return viewer.guest.tipo === "Niño";
    case "groups":
      return room.allowedGroups?.includes(viewer.guest.grupoTipo) ?? false;
    case "age_range": {
      if (typeof viewer.guest.edad !== "number") return false;
      if (typeof room.minAge === "number" && viewer.guest.edad < room.minAge) return false;
      if (typeof room.maxAge === "number" && viewer.guest.edad > room.maxAge) return false;
      return true;
    }
    default:
      return false;
  }
}

export function describeRoomAudience(room: ChatRoom): string {
  switch (room.audience) {
    case "all":
      return "Abierta para todos";
    case "adults":
      return "Solo adultos";
    case "children":
      return "Solo niños";
    case "groups":
      return room.allowedGroups?.length
        ? `Grupos: ${room.allowedGroups.join(", ")}`
        : "Grupos concretos";
    case "age_range": {
      const min = typeof room.minAge === "number" ? room.minAge : 0;
      const max = typeof room.maxAge === "number" ? room.maxAge : 120;
      return `Edad: ${min}-${max}`;
    }
    default:
      return "Acceso personalizado";
  }
}
