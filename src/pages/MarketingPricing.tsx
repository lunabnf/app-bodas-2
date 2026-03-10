import { Link } from "react-router-dom";

const plans = [
  {
    key: "free",
    name: "Esencial",
    price: "199 EUR",
    description: "Web de boda, programa, RSVP y panel básico de gestión.",
    items: ["Web del evento", "RSVP", "Panel de novios", "Mesas y programa"],
  },
  {
    key: "pro",
    name: "Completo",
    price: "349 EUR",
    description: "La experiencia completa con logística, música, chat y archivos.",
    items: ["Todo lo anterior", "Alojamientos", "Transportes", "Chat y fotos"],
  },
  {
    key: "premium",
    name: "Premium",
    price: "A medida",
    description: "Pensado para personalización avanzada y acompañamiento más cercano.",
    items: ["Diseño personalizado", "Onboarding guiado", "Soporte prioritario", "Dominio/subdominio"],
  },
];

export default function MarketingPricing() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Planes</p>
          <h1 className="app-page-title mt-4">Una base clara para cada tipo de boda.</h1>
          <p className="mt-5 app-subtitle max-w-3xl">
            Esta parte todavía está en evolución, pero ya separa bien la capa comercial del sitio
            de evento. Los precios se pueden refinar después cuando conectemos onboarding y pago.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="app-surface-soft p-7">
              <p className="app-kicker">{plan.name}</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{plan.price}</p>
              <p className="mt-4 app-prose">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-[var(--app-muted)]">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-2">
                <Link to={`/demo?plan=${plan.key}`} className="app-button-secondary text-center">
                  Ver demo de este plan
                </Link>
                <Link to={`/crear-evento?plan=${plan.key}`} className="app-button-primary text-center">
                  Elegir este plan
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="app-surface p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-kicker">Siguiente paso</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Registro, onboarding y activación del evento.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/demo" className="app-button-secondary text-center">
                Volver a demo
              </Link>
              <Link to="/buscar-boda" className="app-button-primary text-center">
                Ya tengo acceso
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
