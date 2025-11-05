import type { Api, RSVP } from "./index";

const KEY = "rsvps";
const UID = "demo-uid";

const load = (): RSVP[] => JSON.parse(localStorage.getItem(KEY) || "[]");
const save = (v: RSVP[]) => localStorage.setItem(KEY, JSON.stringify(v));

export const mockApi: Api = {
  async login() { localStorage.setItem("uid", UID); return { uid: UID }; },
  async logout() { localStorage.removeItem("uid"); },
  async me() { return localStorage.getItem("uid") ? { uid: UID } : null; },
  async listRSVP() { return load(); },
  async createRSVP(data) {
    const item: RSVP = { id: crypto.randomUUID(), ...data };
    const all = load(); all.push(item); save(all); return item;
  },
};