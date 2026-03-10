const EVENT_BASE = "/w/demo";

export const eventSitePaths = {
  home: EVENT_BASE,
  programa: `${EVENT_BASE}/programa`,
  confirmarAsistencia: `${EVENT_BASE}/rsvp`,
  alojamientos: `${EVENT_BASE}/alojamientos`,
  desplazamientos: `${EVENT_BASE}/desplazamientos`,
  countdown: `${EVENT_BASE}/countdown`,
  contacto: `${EVENT_BASE}/contacto`,
  participaConfirmacion: `${EVENT_BASE}/rsvp`,
  participaMesas: `${EVENT_BASE}/mesas`,
  participaAsientos: `${EVENT_BASE}/mesas`,
  participaMusica: `${EVENT_BASE}/musica`,
  participaChat: `${EVENT_BASE}/chat`,
  participaFotos: `${EVENT_BASE}/fotos`,
  guestAccess: (token: string) => `${EVENT_BASE}/rsvp/${encodeURIComponent(token)}`,
};
