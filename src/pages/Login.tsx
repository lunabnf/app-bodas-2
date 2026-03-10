import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { useAuth } from "@/store/useAuth";
import {
  findOwnerEventBySlug,
  validateOwnerEventAdminAccess,
} from "../services/ownerEventsService";
import { setAccessEventContext } from "../services/accessEventContextService";

export default function Login() {
  const [ownerEmail, setOwnerEmail] = useState("owner@demo.com");
  const [ownerPassword, setOwnerPassword] = useState("owner");

  const [weddingSlug, setWeddingSlug] = useState("demo");
  const [adminEmail, setAdminEmail] = useState("demo@demo.com");
  const [adminPassword, setAdminPassword] = useState("demo");

  const [guestWeddingSlug, setGuestWeddingSlug] = useState("demo");
  const [guestToken, setGuestToken] = useState("");

  const [adminError, setAdminError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [guestError, setGuestError] = useState("");

  const login = useAuth((s) => s.login);
  const loginAsEventAdmin = useAuth((s) => s.loginAsEventAdmin);
  const invitado = useAuth((s) => s.invitado);
  const esAdmin = useAuth((s) => s.esAdmin);
  const esOwner = useAuth((s) => s.esOwner);
  const nav = useNavigate();

  useEffect(() => {
    setAdminError("");
  }, [weddingSlug, adminEmail, adminPassword]);

  useEffect(() => {
    setOwnerError("");
  }, [ownerEmail, ownerPassword]);

  useEffect(() => {
    setGuestError("");
  }, [guestWeddingSlug, guestToken]);

  if (esOwner) {
    return <Navigate to="/owner" replace />;
  }

  if (esAdmin) {
    return <Navigate to="/admin/resumen" replace />;
  }

  if (invitado) {
    return <Navigate to={eventSitePaths.participaConfirmacion} replace />;
  }

  async function onOwnerSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(ownerEmail, ownerPassword);
      nav("/owner");
    } catch (err) {
      setOwnerError(err instanceof Error ? err.message : "No se pudo iniciar sesion");
    }
  }

  function onAdminSubmit(e: React.FormEvent) {
    e.preventDefault();

    const event = validateOwnerEventAdminAccess({
      slug: weddingSlug,
      email: adminEmail,
      password: adminPassword,
    });

    if (!event) {
      setAdminError("No hemos podido validar la boda o las credenciales de novios.");
      return;
    }

    setAccessEventContext({
      eventId: event.id,
      slug: event.slug,
      coupleLabel: event.coupleLabel,
    });
    loginAsEventAdmin({
      eventId: event.id,
      slug: event.slug,
      coupleLabel: event.coupleLabel,
      email: adminEmail,
    });
    nav("/admin/resumen");
  }

  function onGuestSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedToken = guestToken.trim();
    if (!normalizedToken) {
      setGuestError("Introduce el codigo de invitado.");
      return;
    }

    const event = findOwnerEventBySlug(guestWeddingSlug);
    if (!event) {
      setGuestError("No existe una boda con ese nombre.");
      return;
    }

    setAccessEventContext({
      eventId: event.id,
      slug: event.slug,
      coupleLabel: event.coupleLabel,
    });
    nav(`/evento/${event.slug}/rsvp/${encodeURIComponent(normalizedToken)}`);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-2">
        <div className="app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso</p>
          <h1 className="app-page-title mt-4">Accede por tipo de usuario y nombre de boda.</h1>
          <p className="mt-5 app-subtitle">
            Los novios y los invitados acceden indicando su boda (slug). Tú, como dueño de la app,
            accedes desde Owner para gestionar todo globalmente.
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={onOwnerSubmit} className="app-surface-soft space-y-4 p-6">
            <div>
              <h2 className="app-section-heading">Owner</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Acceso global para administración completa.
              </p>
            </div>
            <input
              className="w-full p-3"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="Email owner"
            />
            <input
              className="w-full p-3"
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Contrasena owner"
            />
            {ownerError ? <p className="text-sm text-red-400">{ownerError}</p> : null}
            <button className="app-button-primary w-full">Entrar como owner</button>
          </form>

          <form onSubmit={onAdminSubmit} className="app-surface-soft space-y-4 p-6">
            <div>
              <h2 className="app-section-heading">Novios (admin de evento)</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Acceso por boda + credenciales del evento.
              </p>
            </div>
            <input
              className="w-full p-3"
              value={weddingSlug}
              onChange={(e) => setWeddingSlug(e.target.value)}
              placeholder="Nombre de boda (slug), ej: ana-y-luis"
            />
            <input
              className="w-full p-3"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Email novios"
            />
            <input
              className="w-full p-3"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Contrasena novios"
            />
            {adminError ? <p className="text-sm text-red-400">{adminError}</p> : null}
            <button className="app-button-secondary w-full">Entrar al panel de boda</button>
          </form>

          <form onSubmit={onGuestSubmit} className="app-surface-soft space-y-4 p-6">
            <div>
              <h2 className="app-section-heading">Invitados</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Acceso por boda + token de invitación.
              </p>
            </div>
            <input
              className="w-full p-3"
              value={guestWeddingSlug}
              onChange={(e) => setGuestWeddingSlug(e.target.value)}
              placeholder="Nombre de boda (slug)"
            />
            <input
              className="w-full p-3"
              value={guestToken}
              onChange={(e) => setGuestToken(e.target.value)}
              placeholder="Codigo de invitacion"
            />
            {guestError ? <p className="text-sm text-red-400">{guestError}</p> : null}
            <button className="app-button-primary w-full">Entrar como invitado</button>
          </form>
        </div>
      </div>
    </section>
  );
}
