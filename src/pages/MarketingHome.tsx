import { Link } from "react-router-dom";
import { loadMarketingContent } from "../services/marketingContentService";

export default function MarketingHome() {
  const content = loadMarketingContent();

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="app-surface p-8 sm:p-12">
          <p className="app-kicker">Lazo</p>
          <h1 className="app-title mt-4 max-w-5xl">{content.hero.title}</h1>
          <p className="app-subtitle mt-6 max-w-4xl">{content.hero.subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={content.hero.primaryCtaHref} className="app-button-primary text-center">
              {content.hero.primaryCtaLabel}
            </Link>
            <Link to={content.hero.secondaryCtaHref} className="app-button-secondary text-center">
              {content.hero.secondaryCtaLabel}
            </Link>
          </div>
        </div>

        <section className="app-surface-soft p-7 sm:p-8">
          <p className="app-kicker">Cómo funciona</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            {content.howItWorks.title}
          </h2>
          <p className="mt-3 app-prose max-w-4xl">{content.howItWorks.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {content.howItWorks.phases.map((phase) => (
              <article key={phase.id} className="app-surface p-5">
                <h3 className="text-xl font-semibold tracking-[-0.02em]">{phase.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--app-muted)]">{phase.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-surface p-7 sm:p-8">
          <p className="app-kicker">Valor</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{content.value.title}</h2>
          <p className="mt-3 app-prose max-w-4xl">{content.value.subtitle}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.value.items.map((item) => (
              <article key={item.id} className="app-surface-soft p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--app-muted)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-surface-soft p-7 sm:p-8">
          <p className="app-kicker">Para quién es</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{content.audience.title}</h2>
          <p className="mt-3 app-prose max-w-4xl">{content.audience.subtitle}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {content.audience.segments.map((segment) => (
              <article key={segment.id} className="app-surface p-5">
                <h3 className="text-lg font-semibold">{segment.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--app-muted)]">{segment.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="app-surface p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-kicker">Cierre</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{content.finalCta.title}</h2>
              <p className="mt-3 app-prose max-w-3xl">{content.finalCta.subtitle}</p>
            </div>
            <Link to={content.finalCta.ctaHref} className="app-button-primary text-center">
              {content.finalCta.ctaLabel}
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
