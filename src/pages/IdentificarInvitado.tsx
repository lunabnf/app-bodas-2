import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registrarActividad } from "../services/actividadService";
import { useAuth } from "../store/useAuth";

interface Invitado {
  token: string;
  nombre: string;
  [key: string]: unknown;
}

export default function IdentificarInvitado() {
  const { token } = useParams();
  const navigate = useNavigate();
  const loginAsGuest = useAuth((s) => s.loginAsGuest);

  useEffect(() => {
    if (!token) return;

    // Leer invitados guardados (temporal hasta Firestore)
    const raw = localStorage.getItem("wedding.invitados");
    if (!raw) {
      navigate("/"); 
      return;
    }

    let invitados: Invitado[] = [];
    try {
      invitados = JSON.parse(raw) as Invitado[];
    } catch {
      navigate("/");
      return;
    }

    const invitado = invitados.find((i) => i.token === token);

    if (!invitado) {
      navigate("/");
      return;
    }

    registrarActividad({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tipo: "login_invitado",
      mensaje: `${invitado.nombre} ha accedido desde su invitación QR`,
      tokenInvitado: invitado.token,
    });

    loginAsGuest(invitado as Invitado);

    // Redirigir al panel público del invitado
    navigate("/");
  }, [token, navigate, loginAsGuest]);

  return (
    <div className="text-white p-6">
      Identificando invitado…
    </div>
  );
}