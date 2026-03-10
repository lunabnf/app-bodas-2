import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createOwnerEvent, findOwnerEventBySlug, type OwnerEventPlan } from "../services/ownerEventsService";

const allowedPlans: OwnerEventPlan[] = ["free", "pro", "premium"];

function normalizePlan(value: string | null): OwnerEventPlan {
  if (value === "pro" || value === "premium") return value;
  return "free";
}

export default function MarketingCreateEvent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const suggestedPlan = normalizePlan(params.get("plan"));

  const [coupleLabel, setCoupleLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<OwnerEventPlan>(suggestedPlan);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  const planLabel = useMemo(
    () => ({
      free: "Esencial",
      pro: "Completo",
      premium: "Premium",
    }),
    []
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coupleLabel.trim()) {
      setError("Indica el nombre de la boda.");
      return;
    }

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError("Debes definir email y contraseña para los novios.");
      return;
    }

    if (slug.trim()) {
      const exists = findOwnerEventBySlug(slug);
      if (exists) {
        setError("Ese nombre de boda ya existe. Elige otro slug.");
        return;
      }
    }

    const created = createOwnerEvent({
      coupleLabel,
      plan,
      slug,
      adminEmail,
      adminPassword,
    });

    if (slug.trim() && created.slug !== slug.trim()) {
      // El servicio garantiza unicidad; aquí solo avisamos si se normalizó distinto.
      setError(`Boda creada con slug "${created.slug}" (se ajustó automáticamente).`);
    } else {
      setError("");
    }

    navigate("/acceso");
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Alta de Boda</p>
          <h1 className="app-page-title mt-4">Crea tu evento y activa tu acceso.</h1>
          <p className="mt-5 app-subtitle max-w-3xl">
            Plan seleccionado: <strong>{planLabel[plan]}</strong>. Después podrás entrar por
            nombre de boda en el acceso general.
          </p>
        </div>

        <form onSubmit={onSubmit} className="app-surface-soft grid gap-4 p-6 sm:grid-cols-2">
          <input
            className="w-full p-3 sm:col-span-2"
            value={coupleLabel}
            onChange={(e) => setCoupleLabel(e.target.value)}
            placeholder="Nombre de la boda (ej. Ana y Luis)"
          />
          <input
            className="w-full p-3"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Nombre corto (slug) opcional"
          />
          <select
            className="w-full p-3"
            value={plan}
            onChange={(e) => setPlan(e.target.value as OwnerEventPlan)}
          >
            {allowedPlans.map((item) => (
              <option key={item} value={item}>
                Plan {planLabel[item]}
              </option>
            ))}
          </select>
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

          {error ? <p className="text-sm text-red-400 sm:col-span-2">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
            <button type="submit" className="app-button-primary text-center">
              Crear boda
            </button>
            <Link to="/acceso" className="app-button-secondary text-center">
              Ya tengo acceso
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
