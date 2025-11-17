import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Invitado {
  token: string;
  [key: string]: unknown;
}

export default function IdentificarInvitado() {
  const { token } = useParams();
  const navigate = useNavigate();

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

    // Guardar como usuario logueado
    localStorage.setItem("wedding.user", JSON.stringify(invitado));

    // Redirigir al panel público del invitado
    navigate("/");
  }, [token, navigate]);

  return (
    <div className="text-white p-6">
      Identificando invitado…
    </div>
  );
}