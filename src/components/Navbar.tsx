// src/components/Navbar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { eventSitePaths } from "../eventSite/paths";
import { getWeddingSettings } from "../services/weddingSettingsService";
import { useAuth } from "../store/useAuth";

export default function Navbar() {
  const { novio, novia, fecha, hora } = getWeddingSettings();
  const esAdmin = useAuth((state) => state.esAdmin);
  const invitado = useAuth((state) => state.invitado);
  const logout = useAuth((state) => state.logout);

  const titulo =
    novio && novia ? `Boda de ${novio} y ${novia}` : "Momentos Únicos";

  const fechaTexto = fecha
    ? `${fecha}${hora ? " · " + hora : ""}`
    : "";

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="app-navbar text-[var(--app-ink)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-[-0.03em] text-[var(--app-ink)] transition-colors sm:text-xl">
            {titulo}
          </span>

          {fechaTexto && (
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[var(--app-muted)] sm:text-xs">
              {fechaTexto}
            </span>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.9)] text-lg text-[var(--app-ink)] sm:hidden"
          aria-label="Abrir menú"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="ml-auto hidden items-center gap-3 sm:flex">
          {esAdmin ? (
            <>
              <NavLink
                to="/admin/resumen"
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
                to={eventSitePaths.participaConfirmacion}
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
              to="/login"
              className="app-button-primary"
            >
              Acceder
            </NavLink>
          )}
        </div>
      </div>

      <div
        className={`mx-4 overflow-hidden rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.92)] shadow-[var(--app-shadow-soft)] transition-all duration-300 sm:hidden ${
          menuOpen ? "max-h-60 py-3 mb-3" : "max-h-0 py-0 mb-0 border-transparent"
        }`}
      >
        {esAdmin ? (
          <>
            <NavLink
              to="/admin/resumen"
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
              to={eventSitePaths.participaConfirmacion}
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
            to="/login"
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
