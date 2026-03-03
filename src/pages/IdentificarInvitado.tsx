import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { GuestSession } from "../domain/guest";
import { eventSitePaths } from "../eventSite/paths";
import { registrarActividad } from "../services/actividadService";
import { obtenerInvitadoPorToken } from "../services/invitadosService";
import { useAuth } from "../store/useAuth";

export default function IdentificarInvitado() {
  const { token } = useParams();
  const navigate = useNavigate();
  const loginAsGuest = useAuth((s) => s.loginAsGuest);

  useEffect(() => {
    if (!token) {
      navigate(eventSitePaths.home);
      return;
    }

    void (async () => {
      const invitado = await obtenerInvitadoPorToken(token);

      if (!invitado) {
        navigate(eventSitePaths.home);
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

      loginAsGuest(guestSession);
      navigate(eventSitePaths.participaConfirmacion);
    })();
  }, [token, navigate, loginAsGuest]);

  return (
    <div className="text-white p-6">
      Identificando invitado…
    </div>
  );
}
