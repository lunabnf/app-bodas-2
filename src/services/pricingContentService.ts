import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

const PRICING_CONTENT_KEY = "backoffice.pricing.content.v2";

const pricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  period: z.string(),
  description: z.string(),
  badge: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  features: z.array(z.string()),
});

const pricingContentSchema = z.object({
  header: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  plans: z.array(pricingPlanSchema).min(1),
  finalCta: z.object({
    title: z.string(),
    description: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
});

export type PricingContent = z.infer<typeof pricingContentSchema>;
export type PricingPlan = z.infer<typeof pricingPlanSchema>;

const PRICING_DEFAULTS: PricingContent = {
  header: {
    title: "Elige cuánto tiempo queréis vivir la experiencia completa.",
    subtitle:
      "Todos los planes comparten una base clara por fases: preparación, invitaciones + RSVP, experiencia completa antes de la boda y 10 días post-boda incluidos.",
  },
  plans: [
    {
      id: "social",
      name: "Social",
      price: "249 EUR",
      period: "pago único",
      description:
        "Para parejas que organizan la boda fuera y quieren una capa digital/social potente.",
      badge: "Solo digital + social",
      ctaLabel: "Elegir Social",
      ctaHref: "/crear-evento?plan=social",
      features: [
        "Panel simplificado",
        "Web de boda + invitaciones digitales",
        "RSVP",
        "Chat, fotos y música",
        "30 días de experiencia completa antes de la boda",
        "10 días post-boda",
      ],
    },
    {
      id: "esencial",
      name: "Esencial",
      price: "349 EUR",
      period: "pago único",
      description:
        "Base completa de gestión con 12 meses de preparación y tramo social controlado.",
      badge: "",
      ctaLabel: "Elegir Esencial",
      ctaHref: "/crear-evento?plan=esencial",
      features: [
        "12 meses de preparación",
        "Invitaciones + RSVP hasta 90 días antes",
        "30 días de experiencia completa antes de la boda",
        "10 días post-boda",
        "Total experiencia completa: 40 días",
      ],
    },
    {
      id: "completo",
      name: "Completo",
      price: "549 EUR",
      period: "pago único",
      description:
        "Plan recomendado para vivir una experiencia más larga y completa con invitados.",
      badge: "Más popular",
      ctaLabel: "Elegir Completo",
      ctaHref: "/crear-evento?plan=completo",
      features: [
        "12 meses de preparación",
        "Invitaciones + RSVP hasta 90 días antes",
        "60 días de experiencia completa antes de la boda",
        "10 días post-boda",
        "Total experiencia completa: 70 días",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "799 EUR",
      period: "pago único",
      description:
        "Máximo recorrido para bodas con ventana extendida de participación y contenido.",
      badge: "",
      ctaLabel: "Elegir Premium",
      ctaHref: "/crear-evento?plan=premium",
      features: [
        "12 meses de preparación",
        "Invitaciones + RSVP hasta 90 días antes",
        "100 días de experiencia completa antes de la boda",
        "10 días post-boda",
        "Total experiencia completa: 110 días",
      ],
    },
  ],
  finalCta: {
    title: "Activad hoy y planificad con calma.",
    description:
      "Empieza por preparación privada y activa la experiencia completa cuando se acerque vuestro gran día.",
    ctaLabel: "Ya tengo acceso",
    ctaHref: "/buscar-boda",
  },
};

export function getDefaultPricingContent(): PricingContent {
  return JSON.parse(JSON.stringify(PRICING_DEFAULTS)) as PricingContent;
}

export function loadPricingContent(): PricingContent {
  if (typeof window === "undefined") return getDefaultPricingContent();
  return readStorageWithSchema<PricingContent>(
    PRICING_CONTENT_KEY,
    pricingContentSchema,
    getDefaultPricingContent()
  );
}

export function savePricingContent(content: PricingContent) {
  if (typeof window === "undefined") return;
  const parsed = pricingContentSchema.safeParse(content);
  if (!parsed.success) {
    throw new Error("Contenido de pricing no válido.");
  }
  writeStorage(PRICING_CONTENT_KEY, parsed.data);
}

export function resetPricingContent() {
  if (typeof window === "undefined") return;
  writeStorage(PRICING_CONTENT_KEY, getDefaultPricingContent());
}
