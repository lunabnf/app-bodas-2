import type { GuestGroupType, GuestSession } from "./guest";

export type ChatAudience = "all" | "adults" | "children" | "groups" | "age_range";

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  audience: ChatAudience;
  allowedGroups?: GuestGroupType[];
  minAge?: number;
  maxAge?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorType: "admin" | "guest";
  authorName: string;
  authorToken?: string;
  body: string;
  createdAt: number;
}

export interface ChatViewer {
  isAdmin: boolean;
  guest: GuestSession | null;
}
