import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { GuestSession } from "../domain/guest";
import { eventSitePaths } from "../eventSite/paths";
import { registrarActividad } from "../services/actividadService";
import { obtenerInvitadoPorToken } from "../services/invitadosService";
import { findOwnerEventBySlug } from "../services/ownerEventsService";
import { setAccessEventContext } from "../services/accessEventContextService";
import { useAuth } from "../store/useAuth";

export default function IdentificarInvitado() {
  const { token, slug } = useParams();
  const navigate = useNavigate();
  const loginAsGuestForEvent = useAuth((s) => s.loginAsGuestForEvent);

  useEffect(() => {
    if (!token) {
      navigate(eventSitePaths.home);
      return;
    }

    void (async () => {
      const normalizedSlug = slug ?? "demo";
      const event = findOwnerEventBySlug(normalizedSlug);
      if (!event) {
        navigate("/");
        return;
      }

      setAccessEventContext({
        eventId: event.id,
        slug: event.slug,
        coupleLabel: event.coupleLabel,
      });

      const invitado = await obtenerInvitadoPorToken(token);

      if (!invitado) {
        navigate("/buscar-boda");
        return;
      }

      await registrarActividad({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        tipo: "login_invitado",
        mensaje: `${invitado.nombre} ha accedido desde su invitación QR`,
        tokenInvitado: invitado.token,
      });

      const guestSession: GuestSession = {
        token: invitado.token,
        nombre: invitado.nombre,
        ...(invitado.mesa ? { mesa: invitado.mesa } : {}),
        ...(typeof invitado.esAdulto === "boolean" ? { esAdulto: invitado.esAdulto } : {}),
        ...(typeof invitado.edad === "number" ? { edad: invitado.edad } : {}),
        grupoTipo: invitado.grupoTipo,
        tipo: invitado.tipo,
      };

      loginAsGuestForEvent(guestSession, {
        eventId: event.id,
        slug: event.slug,
        coupleLabel: event.coupleLabel,
      });
      navigate(eventSitePaths.participaConfirmacion);
    })();
  }, [token, slug, navigate, loginAsGuestForEvent]);

  return (
    <div className="px-4 py-4 text-white sm:px-6">
      Identificando invitado…
    </div>
  );
}
