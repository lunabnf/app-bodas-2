import { useState } from "react";
import {
  getDefaultPricingContent,
  loadPricingContent,
  resetPricingContent,
  savePricingContent,
  type PricingContent,
} from "../services/pricingContentService";

function updatePlanField(
  prev: PricingContent,
  index: number,
  field: "id" | "name" | "price" | "period" | "description" | "badge" | "ctaLabel" | "ctaHref",
  value: string
): PricingContent {
  const plans = prev.plans.map((plan, planIndex) =>
    planIndex === index ? { ...plan, [field]: value } : plan
  );
  return { ...prev, plans };
}

function updatePlanFeature(
  prev: PricingContent,
  planIndex: number,
  featureIndex: number,
  value: string
): PricingContent {
  const plans = prev.plans.map((plan, currentPlanIndex) => {
    if (currentPlanIndex !== planIndex) return plan;
    const features = plan.features.map((feature, currentFeatureIndex) =>
      currentFeatureIndex === featureIndex ? value : feature
    );
    return { ...plan, features };
  });
  return { ...prev, plans };
}

export default function BackofficePricing() {
  const [form, setForm] = useState<PricingContent>(() => loadPricingContent());
  const [savedAt, setSavedAt] = useState("");
  const [error, setError] = useState("");

  function handleSave() {
    try {
      setError("");
      savePricingContent(form);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar pricing.");
    }
  }

  function handleResetDefaults() {
    resetPricingContent();
    setForm(getDefaultPricingContent());
    setSavedAt("");
    setError("");
  }

  function handleReload() {
    setForm(loadPricingContent());
    setSavedAt("");
    setError("");
  }

  function handleAddPlan() {
    setForm((prev) => ({
      ...prev,
      plans: [
        ...prev.plans,
        {
          id: `plan-${prev.plans.length + 1}`,
          name: "Nuevo plan",
          price: "",
          period: "",
          description: "",
          badge: "",
          ctaLabel: "Elegir este plan",
          ctaHref: "/crear-evento",
          features: [""],
        },
      ],
    }));
  }

  function handleDeletePlan(index: number) {
    setForm((prev) => {
      if (prev.plans.length <= 1) return prev;
      return { ...prev, plans: prev.plans.filter((_, i) => i !== index) };
    });
  }

  function handleAddFeature(planIndex: number) {
    setForm((prev) => {
      const plans = prev.plans.map((plan, currentPlanIndex) =>
        currentPlanIndex === planIndex ? { ...plan, features: [...plan.features, ""] } : plan
      );
      return { ...prev, plans };
    });
  }

  function handleDeleteFeature(planIndex: number, featureIndex: number) {
    setForm((prev) => {
      const plans = prev.plans.map((plan, currentPlanIndex) => {
        if (currentPlanIndex !== planIndex) return plan;
        if (plan.features.length <= 1) return plan;
        return { ...plan, features: plan.features.filter((_, i) => i !== featureIndex) };
      });
      return { ...prev, plans };
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="app-kicker">Pricing</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Editor de planes y precios</h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Cambios persistidos en local y aplicados a la página pública de pricing.
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
      {savedAt ? <p className="text-sm text-emerald-600">Guardado a las {savedAt}.</p> : null}

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">Encabezado</p>
        <div className="mt-4 grid gap-3">
          <label className="space-y-1">
            <span className="text-sm text-[var(--app-muted)]">Título</span>
            <input
              className="w-full p-3"
              value={form.header.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, header: { ...prev.header, title: e.target.value } }))
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-[var(--app-muted)]">Subtítulo</span>
            <textarea
              className="w-full p-3"
              rows={3}
              value={form.header.subtitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, header: { ...prev.header, subtitle: e.target.value } }))
              }
            />
          </label>
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="app-kicker mr-auto">Planes</p>
          <button type="button" className="app-button-secondary" onClick={handleAddPlan}>
            Añadir plan
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {form.plans.map((plan, planIndex) => (
            <div key={`${plan.id}-${planIndex}`} className="app-surface-soft p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[var(--app-muted)]">Plan {planIndex + 1}</p>
                <button
                  type="button"
                  className="ml-auto text-sm font-semibold text-red-600"
                  onClick={() => handleDeletePlan(planIndex)}
                >
                  Eliminar plan
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">ID</span>
                  <input
                    className="w-full p-3"
                    value={plan.id}
                    onChange={(e) => setForm((prev) => updatePlanField(prev, planIndex, "id", e.target.value))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Nombre</span>
                  <input
                    className="w-full p-3"
                    value={plan.name}
                    onChange={(e) => setForm((prev) => updatePlanField(prev, planIndex, "name", e.target.value))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Precio</span>
                  <input
                    className="w-full p-3"
                    value={plan.price}
                    onChange={(e) => setForm((prev) => updatePlanField(prev, planIndex, "price", e.target.value))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Periodo / texto</span>
                  <input
                    className="w-full p-3"
                    value={plan.period}
                    onChange={(e) => setForm((prev) => updatePlanField(prev, planIndex, "period", e.target.value))}
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-[var(--app-muted)]">Descripción</span>
                  <textarea
                    className="w-full p-3"
                    rows={3}
                    value={plan.description}
                    onChange={(e) =>
                      setForm((prev) => updatePlanField(prev, planIndex, "description", e.target.value))
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">Badge (opcional)</span>
                  <input
                    className="w-full p-3"
                    value={plan.badge}
                    onChange={(e) => setForm((prev) => updatePlanField(prev, planIndex, "badge", e.target.value))}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-[var(--app-muted)]">CTA texto</span>
                  <input
                    className="w-full p-3"
                    value={plan.ctaLabel}
                    onChange={(e) =>
                      setForm((prev) => updatePlanField(prev, planIndex, "ctaLabel", e.target.value))
                    }
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-[var(--app-muted)]">CTA destino</span>
                  <input
                    className="w-full p-3"
                    value={plan.ctaHref}
                    onChange={(e) => setForm((prev) => updatePlanField(prev, planIndex, "ctaHref", e.target.value))}
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center">
                  <p className="text-sm font-semibold text-[var(--app-muted)]">Features</p>
                  <button
                    type="button"
                    className="ml-auto text-sm font-semibold text-[var(--app-ink)]"
                    onClick={() => handleAddFeature(planIndex)}
                  >
                    + Añadir feature
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={`${plan.id}-feature-${featureIndex}`} className="flex items-center gap-2">
                      <input
                        className="w-full p-3"
                        value={feature}
                        onChange={(e) =>
                          setForm((prev) =>
                            updatePlanFeature(prev, planIndex, featureIndex, e.target.value)
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-sm font-semibold text-red-600"
                        onClick={() => handleDeleteFeature(planIndex, featureIndex)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="app-surface p-5 sm:p-6">
        <p className="app-kicker">CTA final</p>
        <div className="mt-4 grid gap-3">
          <label className="space-y-1">
            <span className="text-sm text-[var(--app-muted)]">Título</span>
            <input
              className="w-full p-3"
              value={form.finalCta.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, title: e.target.value } }))
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-[var(--app-muted)]">Descripción</span>
            <textarea
              className="w-full p-3"
              rows={3}
              value={form.finalCta.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, description: e.target.value } }))
              }
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">CTA texto</span>
              <input
                className="w-full p-3"
                value={form.finalCta.ctaLabel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, ctaLabel: e.target.value } }))
                }
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-[var(--app-muted)]">CTA destino</span>
              <input
                className="w-full p-3"
                value={form.finalCta.ctaHref}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, finalCta: { ...prev.finalCta, ctaHref: e.target.value } }))
                }
              />
            </label>
          </div>
        </div>
      </article>
    </section>
  );
}
