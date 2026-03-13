import { Link } from "react-router-dom";
import { loadPricingContent } from "../services/pricingContentService";

export default function MarketingPricing() {
  const content = loadPricingContent();

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Planes</p>
          <h1 className="app-page-title mt-4">{content.header.title}</h1>
          <p className="mt-5 app-subtitle max-w-3xl">{content.header.subtitle}</p>
        </div>

        <div className="app-surface-soft p-6 sm:p-7">
          <p className="app-kicker">Modelo por fases</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article>
              <h2 className="text-lg font-semibold">1. Modo Preparación</h2>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Hasta 12 meses para novios/organizadores: invitados, grupos, mesas, programa,
                alojamientos, desplazamientos, presupuesto y ajustes.
              </p>
            </article>
            <article>
              <h2 className="text-lg font-semibold">2. Invitaciones + RSVP</h2>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Disponible hasta 90 días antes de la boda para activar invitación digital y
                confirmación de asistencia.
              </p>
            </article>
            <article>
              <h2 className="text-lg font-semibold">3. Experiencia completa</h2>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Web completa, chat, fotos, música y participación social durante los días incluidos
                según plan.
              </p>
            </article>
            <article>
              <h2 className="text-lg font-semibold">4. Post-boda fijo</h2>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Todos los planes incluyen 10 días tras la boda para cierre de experiencia,
                interacciones finales y subida de fotos.
              </p>
            </article>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {content.plans.map((plan) => (
            <article
              key={plan.id}
              className={`app-surface-soft p-7 ${
                plan.id === "completo" ? "ring-2 ring-[rgba(24,24,23,0.35)]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="app-kicker">{plan.name}</p>
                {plan.badge ? (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      plan.id === "completo"
                        ? "border-[var(--app-ink)] bg-[var(--app-ink)] text-white"
                        : "border-[var(--app-line)] bg-[rgba(255,255,255,0.9)] text-[var(--app-ink)]"
                    }`}
                  >
                    {plan.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{plan.price}</p>
              {plan.period ? <p className="mt-1 text-sm text-[var(--app-muted)]">{plan.period}</p> : null}
              <p className="mt-4 app-prose">{plan.description}</p>
              {plan.id === "social" ? (
                <p className="mt-3 text-sm font-medium text-[var(--app-muted)]">
                  Ideal si la organización principal la lleváis fuera y buscáis solo capa digital/social.
                </p>
              ) : null}
              <ul className="mt-5 space-y-2 text-sm text-[var(--app-muted)]">
                {plan.features.map((item, featureIndex) => (
                  <li key={`${plan.id}-feature-${featureIndex}`}>{item}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-2">
                <Link to={`/demo?plan=${encodeURIComponent(plan.id)}`} className="app-button-secondary text-center">
                  Ver demo de este plan
                </Link>
                <Link to={plan.ctaHref || "/crear-evento"} className="app-button-primary text-center">
                  {plan.ctaLabel || "Elegir este plan"}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="app-surface p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-kicker">Siguiente paso</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{content.finalCta.title}</h2>
              <p className="mt-3 app-prose">{content.finalCta.description}</p>
            </div>
            <Link to={content.finalCta.ctaHref || "/buscar-boda"} className="app-button-primary text-center">
              {content.finalCta.ctaLabel || "Ya tengo acceso"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
