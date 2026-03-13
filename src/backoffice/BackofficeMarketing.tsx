import { useState } from "react";
import {
  getDefaultMarketingContent,
  loadMarketingContent,
  resetMarketingContent,
  saveMarketingContent,
  type MarketingContent,
} from "../services/marketingContentService";

type CardField = "title" | "description";
type PlanField = "name" | "summary";

function updateCardCollection(
  prev: MarketingContent,
  section: "phases" | "valueItems" | "audienceSegments",
  index: number,
  field: CardField,
  value: string
): MarketingContent {
  if (section === "phases") {
    const phases = prev.howItWorks.phases.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );
    return { ...prev, howItWorks: { ...prev.howItWorks, phases } };
  }

  if (section === "valueItems") {
    const items = prev.value.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );
    return { ...prev, value: { ...prev.value, items } };
  }

  const segments = prev.audience.segments.map((item, itemIndex) =>
    itemIndex === index ? { ...item, [field]: value } : item
  );
  return { ...prev, audience: { ...prev.audience, segments } };
}

function updatePlanSummaryCard(
  prev: MarketingContent,
  index: number,
  field: PlanField,
  value: string
): MarketingContent {
  const plans = prev.planSummary.plans.map((plan, planIndex) =>
    planIndex === index ? { ...plan, [field]: value } : plan
  );
  return { ...prev, planSummary: { ...prev.planSummary, plans } };
}

function togglePlanHighlight(prev: MarketingContent, index: number): MarketingContent {
  const plans = prev.planSummary.plans.map((plan, planIndex) =>
    planIndex === index
      ? { ...plan, highlight: !plan.highlight }
      : plan
  );
  return { ...prev, planSummary: { ...prev.planSummary, plans } };
}

export default function BackofficeMarketing() {
  const [form, setForm] = useState<MarketingContent>(() => loadMarketingContent());
  const [savedAt, setSavedAt] = useState<string>("");
  const [error, setError] = useState<string>("");

  function handleSave() {
    try {
      setError("");
      saveMarketingContent(form);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el contenido.");
    }
  }

  function handleResetDefaults() {
    resetMarketingContent();
    setForm(getDefaultMarketingContent());
    setSavedAt("");
    setError("");
  }

  function handleReload() {
    setForm(loadMarketingContent());
    setError("");
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="app-kicker">Marketing</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Editor de Home comercial
          </h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Narrativa premium de inicio: idea, fases, valor, audiencia, planes y cierre.
          </p>
        </div>
        <button type="button" onClick={handleReload} className="app-button-secondary">
          Recargar
        </button>
        <button type="button" onClick={handleResetDefaults} className="app-button-secondary">
          Restaurar defaults
        </button>
        <button type="button" onClick={handleSave} className="app-button-primary">
          Guardar cambios
        </button>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {savedAt ? <p className="text-sm text-emerald-600">Guardado correctamente a las {savedAt}.</p> : null}

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">Hero</p>
        <div className="mt-4 grid gap-3">
          <label className="space-y-1">
            <span className="text-sm text-[var(--app-muted)]">Título</span>
            <textarea
              className="w-full p-3"
              rows={3}
              value={form.hero.title}
              onChange={(e) => setForm((prev) => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-[var(--app-muted)]">Subtítulo</span>
            <textarea
              className="w-full p-3"
              rows={3}
              value={form.hero.subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))
              }
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">CTA principal texto</span>
              <input
                className="w-full p-3"
                value={form.hero.primaryCtaLabel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hero: { ...prev.hero, primaryCtaLabel: e.target.value } }))
                }
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">CTA principal destino</span>
              <input
                className="w-full p-3"
                value={form.hero.primaryCtaHref}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hero: { ...prev.hero, primaryCtaHref: e.target.value } }))
                }
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">CTA secundario texto</span>
              <input
                className="w-full p-3"
                value={form.hero.secondaryCtaLabel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hero: { ...prev.hero, secondaryCtaLabel: e.target.value } }))
                }
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">CTA secundario destino</span>
              <input
                className="w-full p-3"
                value={form.hero.secondaryCtaHref}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hero: { ...prev.hero, secondaryCtaHref: e.target.value } }))
                }
              />
            </label>
          </div>
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">Cómo funciona</p>
        <div className="mt-4 grid gap-3">
          <input
            className="w-full p-3"
            value={form.howItWorks.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, howItWorks: { ...prev.howItWorks, title: e.target.value } }))
            }
          />
          <textarea
            className="w-full p-3"
            rows={2}
            value={form.howItWorks.subtitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, howItWorks: { ...prev.howItWorks, subtitle: e.target.value } }))
            }
          />
          <div className="space-y-3">
            {form.howItWorks.phases.map((phase, index) => (
              <div key={phase.id} className="app-surface-soft p-4">
                <p className="text-sm font-semibold text-[var(--app-muted)]">Fase {index + 1}</p>
                <input
                  className="mt-2 w-full p-3"
                  value={phase.title}
                  onChange={(e) =>
                    setForm((prev) => updateCardCollection(prev, "phases", index, "title", e.target.value))
                  }
                />
                <textarea
                  className="mt-2 w-full p-3"
                  rows={2}
                  value={phase.description}
                  onChange={(e) =>
                    setForm((prev) => updateCardCollection(prev, "phases", index, "description", e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">Bloque de valor</p>
        <input
          className="mt-4 w-full p-3"
          value={form.value.title}
          onChange={(e) => setForm((prev) => ({ ...prev, value: { ...prev.value, title: e.target.value } }))}
        />
        <textarea
          className="mt-2 w-full p-3"
          rows={2}
          value={form.value.subtitle}
          onChange={(e) => setForm((prev) => ({ ...prev, value: { ...prev.value, subtitle: e.target.value } }))}
        />
        <div className="mt-3 space-y-3">
          {form.value.items.map((item, index) => (
            <div key={item.id} className="app-surface-soft p-4">
              <input
                className="w-full p-3"
                value={item.title}
                onChange={(e) =>
                  setForm((prev) => updateCardCollection(prev, "valueItems", index, "title", e.target.value))
                }
              />
              <textarea
                className="mt-2 w-full p-3"
                rows={2}
                value={item.description}
                onChange={(e) =>
                  setForm((prev) =>
                    updateCardCollection(prev, "valueItems", index, "description", e.target.value)
                  )
                }
              />
            </div>
          ))}
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">Para quién es</p>
        <input
          className="mt-4 w-full p-3"
          value={form.audience.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, audience: { ...prev.audience, title: e.target.value } }))
          }
        />
        <textarea
          className="mt-2 w-full p-3"
          rows={2}
          value={form.audience.subtitle}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, audience: { ...prev.audience, subtitle: e.target.value } }))
          }
        />
        <div className="mt-3 space-y-3">
          {form.audience.segments.map((segment, index) => (
            <div key={segment.id} className="app-surface-soft p-4">
              <input
                className="w-full p-3"
                value={segment.title}
                onChange={(e) =>
                  setForm((prev) =>
                    updateCardCollection(prev, "audienceSegments", index, "title", e.target.value)
                  )
                }
              />
              <textarea
                className="mt-2 w-full p-3"
                rows={2}
                value={segment.description}
                onChange={(e) =>
                  setForm((prev) =>
                    updateCardCollection(prev, "audienceSegments", index, "description", e.target.value)
                  )
                }
              />
            </div>
          ))}
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">Resumen de planes</p>
        <input
          className="mt-4 w-full p-3"
          value={form.planSummary.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, planSummary: { ...prev.planSummary, title: e.target.value } }))
          }
        />
        <textarea
          className="mt-2 w-full p-3"
          rows={2}
          value={form.planSummary.subtitle}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, planSummary: { ...prev.planSummary, subtitle: e.target.value } }))
          }
        />
        <div className="mt-3 space-y-3">
          {form.planSummary.plans.map((plan, index) => (
            <div key={plan.id} className="app-surface-soft p-4">
              <input
                className="w-full p-3"
                value={plan.name}
                onChange={(e) =>
                  setForm((prev) => updatePlanSummaryCard(prev, index, "name", e.target.value))
                }
              />
              <textarea
                className="mt-2 w-full p-3"
                rows={2}
                value={plan.summary}
                onChange={(e) =>
                  setForm((prev) => updatePlanSummaryCard(prev, index, "summary", e.target.value))
                }
              />
              <label className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--app-muted)]">
                <input
                  type="checkbox"
                  checked={plan.highlight}
                  onChange={() => setForm((prev) => togglePlanHighlight(prev, index))}
                />
                Destacar como recomendado
              </label>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="w-full p-3"
            value={form.planSummary.ctaLabel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, planSummary: { ...prev.planSummary, ctaLabel: e.target.value } }))
            }
          />
          <input
            className="w-full p-3"
            value={form.planSummary.ctaHref}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, planSummary: { ...prev.planSummary, ctaHref: e.target.value } }))
            }
          />
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">CTA final</p>
        <input
          className="mt-4 w-full p-3"
          value={form.finalCta.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, title: e.target.value } }))
          }
        />
        <textarea
          className="mt-2 w-full p-3"
          rows={2}
          value={form.finalCta.subtitle}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, subtitle: e.target.value } }))
          }
        />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="w-full p-3"
            value={form.finalCta.ctaLabel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, ctaLabel: e.target.value } }))
            }
          />
          <input
            className="w-full p-3"
            value={form.finalCta.ctaHref}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, ctaHref: e.target.value } }))
            }
          />
        </div>
      </article>
    </section>
  );
}
