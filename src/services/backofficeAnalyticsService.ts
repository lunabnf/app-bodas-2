import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

const ANALYTICS_STORAGE_KEY = "backoffice.analytics.v1";
const SESSION_STORAGE_KEY = "backoffice.analytics.currentSession";
const MAX_SESSIONS = 80;
const MAX_ACTIONS_PER_SESSION = 120;

const actionSchema = z.object({
  id: z.string(),
  at: z.string(),
  type: z.literal("route_view"),
  path: z.string(),
});

const sessionSchema = z.object({
  id: z.string(),
  startedAt: z.string(),
  lastAt: z.string(),
  actions: z.array(actionSchema),
});

const analyticsSchema = z.object({
  sessions: z.array(sessionSchema),
});

export type AnalyticsAction = z.infer<typeof actionSchema>;
export type AnalyticsSession = z.infer<typeof sessionSchema>;

export type AnalyticsSnapshot = {
  sessions: AnalyticsSession[];
  totalVisits: number;
  totalActions: number;
};

function createId(prefix: string) {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${randomPart}`;
}

function getDefaultStore() {
  return { sessions: [] as AnalyticsSession[] };
}

function loadStore() {
  if (typeof window === "undefined") return getDefaultStore();
  return readStorageWithSchema(ANALYTICS_STORAGE_KEY, analyticsSchema, getDefaultStore());
}

function saveStore(sessions: AnalyticsSession[]) {
  if (typeof window === "undefined") return;
  const trimmedSessions = sessions.slice(0, MAX_SESSIONS).map((session) => ({
    ...session,
    actions: session.actions.slice(-MAX_ACTIONS_PER_SESSION),
  }));
  writeStorage(ANALYTICS_STORAGE_KEY, { sessions: trimmedSessions });
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  const current = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (current) return current;
  const created = createId("visit");
  sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function trackRouteView(path: string) {
  if (typeof window === "undefined") return;

  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  const now = new Date().toISOString();
  const action: AnalyticsAction = {
    id: createId("action"),
    at: now,
    type: "route_view",
    path,
  };

  const store = loadStore();
  const sessionIndex = store.sessions.findIndex((session) => session.id === sessionId);

  if (sessionIndex === -1) {
    const createdSession: AnalyticsSession = {
      id: sessionId,
      startedAt: now,
      lastAt: now,
      actions: [action],
    };
    saveStore([createdSession, ...store.sessions]);
    return;
  }

  const currentSession = store.sessions[sessionIndex];
  if (!currentSession) {
    return;
  }
  const prevAction = currentSession.actions[currentSession.actions.length - 1];

  if (prevAction?.path === path) {
    const refreshedSession: AnalyticsSession = {
      ...currentSession,
      lastAt: now,
    };
    const sessions = [...store.sessions];
    sessions[sessionIndex] = refreshedSession;
    saveStore(sessions);
    return;
  }

  const updatedSession: AnalyticsSession = {
    ...currentSession,
    lastAt: now,
    actions: [...currentSession.actions, action],
  };

  const sessions = [...store.sessions];
  sessions[sessionIndex] = updatedSession;
  saveStore(sessions);
}

export function getAnalyticsSnapshot(): AnalyticsSnapshot {
  const store = loadStore();
  const totalActions = store.sessions.reduce((sum, session) => sum + session.actions.length, 0);
  return {
    sessions: store.sessions,
    totalVisits: store.sessions.length,
    totalActions,
  };
}

export function clearAnalyticsSnapshot() {
  if (typeof window === "undefined") return;
  writeStorage(ANALYTICS_STORAGE_KEY, getDefaultStore());
}
