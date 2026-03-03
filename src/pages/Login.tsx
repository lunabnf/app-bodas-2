import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { useAuth } from "@/store/useAuth";

export default function Login() {
  const [email, setEmail] = useState("demo@demo.com");
  const [password, setPassword] = useState("demo");
  const [token, setToken] = useState("");
  const [adminError, setAdminError] = useState("");
  const [guestError, setGuestError] = useState("");
  const login = useAuth((s) => s.login);
  const invitado = useAuth((s) => s.invitado);
  const esAdmin = useAuth((s) => s.esAdmin);
  const nav = useNavigate();

  useEffect(() => {
    setAdminError("");
  }, [email, password]);

  useEffect(() => {
    setGuestError("");
  }, [token]);

  if (esAdmin) {
    return <Navigate to="/admin/resumen" replace />;
  }

  if (invitado) {
    return <Navigate to={eventSitePaths.participaConfirmacion} replace />;
  }

  async function onAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/admin/resumen");
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "No se pudo iniciar sesion");
    }
  }

  function onGuestSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedToken = token.trim();
    if (!normalizedToken) {
      setGuestError("Introduce el codigo de tu invitacion.");
      return;
    }

    nav(eventSitePaths.guestAccess(normalizedToken));
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-2">
        <div className="app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso</p>
          <h1 className="app-page-title mt-4">
            Entra como invitado o como novios.
          </h1>
          <p className="mt-5 app-subtitle">
            Los invitados entran con el codigo de su invitacion para ver su panel. Los novios acceden
            con sus credenciales para configurar toda la web.
          </p>
        </div>

        <div className="grid gap-6">
          <form
            onSubmit={onGuestSubmit}
            className="app-surface-soft space-y-4 p-6"
          >
            <div>
              <h2 className="app-section-heading">Invitados</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Introduce el codigo de tu invitacion o el token del QR para entrar en tu panel.
              </p>
            </div>
            <input
              className="w-full p-3"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Codigo de invitacion"
            />
            {guestError ? <p className="text-sm text-red-400">{guestError}</p> : null}
            <button className="app-button-primary w-full">
              Entrar como invitado
            </button>
          </form>

          <form
            onSubmit={onAdminSubmit}
            className="app-surface-soft space-y-4 p-6"
          >
            <div>
              <h2 className="app-section-heading">Novios</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Acceso al panel de configuracion, invitados, mesas, programa y ajustes de la boda.
              </p>
            </div>
            <input
              className="w-full p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="w-full p-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contrasena"
            />
            {adminError ? <p className="text-sm text-red-400">{adminError}</p> : null}
            <button className="app-button-secondary w-full">
              Entrar al panel de novios
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
