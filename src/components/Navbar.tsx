// src/components/Navbar.tsx
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { buildEventSitePaths } from "../eventSite/paths";
import { getWeddingSettings } from "../services/weddingSettingsService";
import { useAuth } from "../store/useAuth";
import BrandMark from "./BrandMark";

export default function Navbar() {
  const { novio, novia, fecha, hora } = getWeddingSettings();
  const esAdmin = useAuth((state) => state.esAdmin);
  const esSuperAdmin = useAuth((state) => state.esSuperAdmin);
  const invitado = useAuth((state) => state.invitado);
  const logout = useAuth((state) => state.logout);
  const { slug } = useParams();
  const paths = buildEventSitePaths(slug);

  const titulo =
    novio && novia ? `Boda de ${novio} y ${novia}` : "Lazo";

  const fechaTexto = fecha
    ? `${fecha}${hora ? " · " + hora : ""}`
    : "";

  const [menuOpen, setMenuOpen] = useState(false);

  const adminPath = slug ? `/w/${slug}/admin` : "/w/demo/admin";
  const showWeddingAdminLink = Boolean(slug);
  const showStandaloneWeddingAdminLink = showWeddingAdminLink && !esAdmin;

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
          {esSuperAdmin ? (
            <>
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
                to={paths.miResumen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.9)] text-sm font-semibold text-[var(--app-ink)]"
                aria-label="Abrir mi resumen"
                title="Mi resumen"
              >
                i
              </NavLink>
              <NavLink
                to={paths.miResumen}
                className="app-button-secondary"
              >
                Mi resumen
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
        className={`mx-4 overflow-hidden rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.94)] shadow-[var(--app-shadow-soft)] transition-all duration-300 md:hidden ${
          menuOpen ? "mb-3 max-h-[36rem] py-3" : "mb-0 max-h-0 border-transparent py-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-1 border-b border-[var(--app-line)] px-3 pb-3">
          {[
            { label: "Inicio", to: paths.home },
            { label: "Programa", to: paths.programa },
            { label: "Confirmar", to: paths.participaConfirmacion },
            { label: "Música", to: paths.participaMusica },
            { label: "Alojamiento", to: paths.alojamientos },
            { label: "Cómo llegar", to: paths.desplazamientos },
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-[16px] px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-[var(--app-ink)] text-[#f8f7f3]" : "text-[var(--app-ink)] hover:bg-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {showStandaloneWeddingAdminLink ? (
          <NavLink
            to={adminPath}
            onClick={() => setMenuOpen(false)}
            className="mt-2 block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
          >
            Panel de Novios
          </NavLink>
        ) : null}
        {esSuperAdmin ? (
          <>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="mt-2 block w-full px-4 py-2 text-left text-sm font-medium text-[var(--app-muted)]"
            >
              Salir
            </button>
          </>
        ) : esAdmin ? (
          <>
            <NavLink
              to={adminPath}
              onClick={() => setMenuOpen(false)}
              className="mt-2 block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
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
              to={paths.miResumen}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
            >
              Mi resumen
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
            className="mt-2 block px-4 py-2 text-sm font-medium text-[var(--app-ink)]"
          >
            Acceder
          </NavLink>
        )}
      </div>
    </nav>
  );
}
