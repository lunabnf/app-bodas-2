// src/components/Navbar.tsx
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { getWeddingSettings } from "../services/weddingSettingsService";
import { useAuth } from "../store/useAuth";
import BrandMark from "./BrandMark";

export default function Navbar() {
  const { novio, novia, fecha, hora } = getWeddingSettings();
  const esAdmin = useAuth((state) => state.esAdmin);
  const esOwner = useAuth((state) => state.esOwner);
  const invitado = useAuth((state) => state.invitado);
  const logout = useAuth((state) => state.logout);
  const { slug } = useParams();

  const titulo =
    novio && novia ? `Boda de ${novio} y ${novia}` : "Lazo";

  const fechaTexto = fecha
    ? `${fecha}${hora ? " · " + hora : ""}`
    : "";

  const [menuOpen, setMenuOpen] = useState(false);

  const adminPath = slug ? `/w/${slug}/admin` : "/w/demo/admin";
  const guestPath = slug ? `/w/${slug}/rsvp` : eventSitePaths.participaConfirmacion;
  const showWeddingAdminLink = Boolean(slug);
  const showStandaloneWeddingAdminLink = showWeddingAdminLink && !esOwner && !esAdmin;

  return (
    <nav className="app-navbar text-[var(--app-ink)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.72)] px-2 py-1.5"
          aria-label="Ir al inicio"
        >
          <BrandMark variant="icon" className="h-7 w-7 rounded-full object-cover" />
          <span className="hidden text-sm font-semibold tracking-[-0.02em] text-[var(--app-ink)] lg:inline">
            Lazo
          </span>
        </NavLink>

        <div className="min-w-0 flex-1 md:flex-none">
          <span className="block truncate text-base font-semibold tracking-[-0.03em] text-[var(--app-ink)] transition-colors sm:text-lg lg:text-xl">
            {titulo}
          </span>

          {fechaTexto && (
            <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.2em] text-[var(--app-muted)] sm:text-xs">
              {fechaTexto}
            </span>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.9)] text-lg text-[var(--app-ink)] md:hidden"
          aria-label="Abrir menú"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="ml-auto hidden max-w-[62%] flex-wrap items-center justify-end gap-2 md:flex">
          {showStandaloneWeddingAdminLink ? (
            <NavLink
              to={adminPath}
              className="app-button-secondary"
            >
              Panel de Novios
            </NavLink>
          ) : null}
          {esOwner ? (
            <>
              <NavLink
                to="/owner"
                className="app-button-secondary"
              >
                Panel Owner
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="app-button-primary"
              >
                Salir
              </button>
            </>
          ) : esAdmin ? (
            <>
              <NavLink
                to={adminPath}
                className="app-button-secondary"
              >
                Panel de Novios
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="app-button-primary"
              >
                Salir
              </button>
            </>
          ) : invitado ? (
            <>
              <NavLink
                to={guestPath}
                className="app-button-secondary"
              >
                Mi panel
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="app-button-primary"
              >
                Salir
              </button>
            </>
          ) : (
            <NavLink
              to="/buscar-boda"
              className="app-button-primary"
            >
              Acceder
            </NavLink>
          )}
        </div>
      </div>

      <div
        className={`mx-4 overflow-hidden rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.92)] shadow-[var(--app-shadow-soft)] transition-all duration-300 md:hidden ${
          menuOpen ? "mb-3 max-h-80 py-3" : "mb-0 max-h-0 border-transparent py-0"
        }`}
      >
        {showWeddingAdminLink ? (
          <NavLink
            to={adminPath}
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
          >
            Panel de Novios
          </NavLink>
        ) : null}
        {esOwner ? (
          <>
            <NavLink
              to="/owner"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
            >
              Panel Owner
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-[var(--app-muted)]"
            >
              Salir
            </button>
          </>
        ) : esAdmin ? (
          <>
            <NavLink
              to={adminPath}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
            >
              Panel de Novios
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-[var(--app-muted)]"
            >
              Salir
            </button>
          </>
        ) : invitado ? (
          <>
            <NavLink
              to={guestPath}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
            >
              Mi panel
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-[var(--app-muted)]"
            >
              Salir
            </button>
          </>
        ) : (
          <NavLink
            to="/buscar-boda"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
          >
            Acceder
          </NavLink>
        )}
      </div>
    </nav>
  );
}
