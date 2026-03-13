import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../store/useAuth";

export default function BackofficeLogin() {
  const navigate = useNavigate();
  const esSuperAdmin = useAuth((state) => state.esSuperAdmin);
  const loginBackoffice = useAuth((state) => state.loginBackoffice);
  const [email, setEmail] = useState("backoffice@demo.com");
  const [password, setPassword] = useState("backoffice");
  const [error, setError] = useState("");

  if (esSuperAdmin) {
    return <Navigate to="/backoffice" replace />;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await loginBackoffice(email, password);
      navigate("/backoffice", { replace: true });
    } catch {
      setError("Credenciales no válidas para acceso interno.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-8 text-[var(--app-ink)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl">
        <div className="app-surface p-8 sm:p-10">
          <BrandMark variant="main" className="h-10 w-auto" />
          <p className="mt-4 app-kicker">Backoffice Login</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Acceso interno</h1>
          <p className="mt-3 text-sm text-[var(--app-muted)]">
            Zona privada para gestión global del producto.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              className="w-full p-3"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="username"
            />
            <input
              className="w-full p-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <button type="submit" className="app-button-primary w-full text-center">
              Entrar a Backoffice
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
