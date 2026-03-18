export function buildEventSitePaths(slug = "demo") {
  const safeSlug = slug.trim() || "demo";
  const eventBase = `/w/${safeSlug}`;

  return {
    home: eventBase,
    programa: `${eventBase}/programa`,
    confirmarAsistencia: `${eventBase}/rsvp`,
    alojamientos: `${eventBase}/alojamientos`,
    desplazamientos: `${eventBase}/desplazamientos`,
    countdown: `${eventBase}/countdown`,
    contacto: `${eventBase}/contacto`,
    miResumen: `${eventBase}/mi-resumen`,
    participaConfirmacion: `${eventBase}/rsvp`,
    participaMesas: `${eventBase}/mesas`,
    participaAsientos: `${eventBase}/mesas`,
    participaMusica: `${eventBase}/musica`,
    participaChat: `${eventBase}/chat`,
    participaFotos: `${eventBase}/fotos`,
    guestAccess: (token: string) => `${eventBase}/rsvp/${encodeURIComponent(token)}`,
  };
}

export const eventSitePaths = buildEventSitePaths();
