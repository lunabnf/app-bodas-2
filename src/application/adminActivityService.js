import { limpiarActividad, obtenerActividad, } from "../services/actividadService";
import { obtenerAlojamientos, obtenerSolicitudesAlojamiento, } from "../services/alojamientosService";
import { limpiarLogs, obtenerLogs } from "../services/logsService";
import { obtenerTodosLosRSVP } from "../services/rsvpService";
import { obtenerSolicitudesTransporte, obtenerTransportes, } from "../services/transporteService";
function buildRsvpSummary(item) {
    const totalAlergias = item.detalles.reduce((acc, detail) => acc +
        detail.alergias.length +
        (detail.intolerancias && detail.intolerancias.trim() ? 1 : 0), 0);
    return [
        item.attending === "si"
            ? `Confirma asistencia: ${item.adultos} adulto(s), ${item.ninos} niño(s)`
            : item.attending === "no"
                ? "No asistirá"
                : "Respuesta pendiente",
        totalAlergias > 0 ? `${totalAlergias} alergia(s)/intolerancia(s)` : null,
        item.nota ? "Incluye nota adicional" : null,
    ]
        .filter(Boolean)
        .join(" · ");
}
export function formatActivityDate(ts) {
    return new Date(ts).toLocaleString("es-ES", {
        dateStyle: "short",
        timeStyle: "short",
    });
}
export async function loadActivityDashboardData() {
    const [actividad, logs, storedRsvps, lodgingOptions, lodgingData, transportOptions, transportData,] = await Promise.all([
        obtenerActividad(),
        obtenerLogs(),
        obtenerTodosLosRSVP(),
        obtenerAlojamientos(),
        obtenerSolicitudesAlojamiento(),
        obtenerTransportes(),
        obtenerSolicitudesTransporte(),
    ]);
    const lodgingNames = Object.fromEntries(lodgingOptions.map((item) => [item.id, item.nombre]));
    const transportNames = Object.fromEntries(transportOptions.map((item) => [item.id, item.nombre]));
    const timeline = [
        ...actividad.map((item) => ({
            id: `actividad-${item.id}`,
            timestamp: item.timestamp,
            actor: item.tokenInvitado || "Sistema",
            category: item.tipo,
            detail: item.mensaje,
            source: "actividad",
        })),
        ...logs.map((item) => ({
            id: `log-${item.id}`,
            timestamp: item.timestamp,
            actor: item.user,
            category: "admin",
            detail: item.action,
            source: "admin",
        })),
        ...storedRsvps.map((item) => ({
            id: `rsvp-${item.guestToken}`,
            timestamp: item.timestamp,
            actor: item.guestName || item.guestToken,
            category: "rsvp",
            detail: buildRsvpSummary(item),
            source: "respuesta",
        })),
        ...lodgingData.map((item) => ({
            id: `lodging-${item.id}`,
            timestamp: item.updatedAt,
            actor: item.guestName,
            category: "alojamiento",
            detail: item.needsLodging
                ? `Necesita alojamiento${item.lodgingId ? ` · ${lodgingNames[item.lodgingId] ?? "Sin preferencia"}` : ""}`
                : "No necesita alojamiento",
            source: "respuesta",
        })),
        ...transportData.map((item) => ({
            id: `transport-${item.id}`,
            timestamp: item.updatedAt,
            actor: item.guestName,
            category: "transporte",
            detail: `${transportNames[item.transportId] ?? "Transporte"} · ${item.seats} plaza(s)`,
            source: "respuesta",
        })),
    ].sort((a, b) => b.timestamp - a.timestamp);
    const rsvps = [...storedRsvps].sort((a, b) => b.timestamp - a.timestamp);
    const transportRequests = [...transportData].sort((a, b) => b.updatedAt - a.updatedAt);
    return {
        timeline,
        rsvps,
        lodgingRequests: [...lodgingData].sort((a, b) => b.updatedAt - a.updatedAt),
        transportRequests,
        rawActivity: [...actividad].sort((a, b) => b.timestamp - a.timestamp),
        adminLogs: [...logs].sort((a, b) => b.timestamp - a.timestamp),
        lodgingNames,
        transportNames,
        metrics: {
            confirmados: rsvps.filter((item) => item.attending === "si").length,
            rechazados: rsvps.filter((item) => item.attending === "no").length,
            totalPlazasTransporte: transportRequests.reduce((acc, item) => acc + item.seats, 0),
            totalConAlergias: rsvps.filter((item) => item.detalles.some((detail) => detail.alergias.length > 0 ||
                Boolean(detail.intolerancias && detail.intolerancias.trim()))).length,
        },
    };
}
export async function clearAdminActivityHistory() {
    await Promise.all([limpiarActividad(), limpiarLogs()]);
}
