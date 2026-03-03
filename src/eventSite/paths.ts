const EVENT_BASE = "/evento/demo";

export const eventSitePaths = {
  home: EVENT_BASE,
  programa: `${EVENT_BASE}/programa`,
  confirmarAsistencia: `${EVENT_BASE}/confirmar-asistencia`,
  alojamientos: `${EVENT_BASE}/info/alojamientos`,
  desplazamientos: `${EVENT_BASE}/info/desplazamientos`,
  countdown: `${EVENT_BASE}/countdown`,
  contacto: `${EVENT_BASE}/contacto`,
  participaConfirmacion: `${EVENT_BASE}/participa/confirmar-asistencia`,
  participaMesas: `${EVENT_BASE}/participa/mesas`,
  participaAsientos: `${EVENT_BASE}/participa/asientos-ceremonia`,
  participaMusica: `${EVENT_BASE}/participa/musica`,
  participaChat: `${EVENT_BASE}/participa/chat`,
  participaFotos: `${EVENT_BASE}/participa/fotos`,
  guestAccess: (token: string) => `${EVENT_BASE}/rsvp/${encodeURIComponent(token)}`,
};
