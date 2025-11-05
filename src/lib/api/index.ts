export type RSVP = { id: string; name: string; attending: boolean; notes?: string };

export interface Api {
  login(email: string, password: string): Promise<{ uid: string }>;
  logout(): Promise<void>;
  me(): Promise<{ uid: string } | null>;
  listRSVP(): Promise<RSVP[]>;
  createRSVP(data: Omit<RSVP, "id">): Promise<RSVP>;
}

export let api: Api;
export function setApi(impl: Api) { api = impl; }