import { z } from "zod";
import { readStorageWithSchema, writeStorage } from "../lib/storage";

const MARKETING_CONTENT_KEY = "backoffice.marketing.content.v3";

const heroSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  primaryCtaLabel: z.string(),
  primaryCtaHref: z.string(),
  secondaryCtaLabel: z.string(),
  secondaryCtaHref: z.string(),
});

const infoCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const planSummaryCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  highlight: z.boolean(),
});

const marketingContentSchema = z.object({
  hero: heroSchema,
  howItWorks: z.object({
    title: z.string(),
    subtitle: z.string(),
    phases: z.array(infoCardSchema).min(4),
  }),
  value: z.object({
    title: z.string(),
    subtitle: z.string(),
    items: z.array(infoCardSchema).min(5),
  }),
  audience: z.object({
    title: z.string(),
    subtitle: z.string(),
    segments: z.array(infoCardSchema).min(2),
  }),
  planSummary: z.object({
    title: z.string(),
    subtitle: z.string(),
    plans: z.array(planSummaryCardSchema).min(4),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  finalCta: z.object({
    title: z.string(),
    subtitle: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
});

export type MarketingContent = z.infer<typeof marketingContentSchema>;

const MARKETING_DEFAULTS: MarketingContent = {
  hero: {
    title: "Lazo convierte la organización de vuestra boda en una experiencia premium, ordenada y viva.",
    subtitle:
      "Preparad cada detalle con calma, activad la experiencia de invitados cuando llegue el momento y cerrad el post-boda sin perder recuerdos ni contexto.",
    primaryCtaLabel: "Ver planes",
    primaryCtaHref: "/pricing",
    secondaryCtaLabel: "Entrar",
    secondaryCtaHref: "/buscar-boda",
  },
  howItWorks: {
    title: "Un recorrido claro por fases",
    subtitle:
      "Lazo no es solo una web bonita: es una experiencia pensada para cada momento de la boda.",
    phases: [
      {
        id: "phase-1",
        title: "Preparación privada",
        description:
          "Hasta 12 meses para organizar invitados, grupos, mesas, programa, logística, presupuesto y ajustes desde un panel sereno.",
      },
      {
        id: "phase-2",
        title: "Invitaciones + RSVP",
        description:
          "Hasta 90 días antes, los invitados reciben su invitación digital y confirman asistencia con la información esencial.",
      },
      {
        id: "phase-3",
        title: "Experiencia completa",
        description:
          "Según plan, se activa la parte social: web completa, chat, fotos, música y participación antes del gran día.",
      },
      {
        id: "phase-4",
        title: "Post-boda incluido",
        description:
          "10 días para todos los planes con subida de fotos, interacción final y cierre natural de la experiencia.",
      },
    ],
  },
  value: {
    title: "Todo lo importante, en un solo lugar",
    subtitle:
      "Control para los novios, claridad para los invitados y una experiencia digital elegante de principio a fin.",
    items: [
      {
        id: "value-1",
        title: "Panel único de organización",
        description: "Gestionad tareas y decisiones sin saltar entre herramientas ni documentos dispersos.",
      },
      {
        id: "value-2",
        title: "Invitados y confirmaciones",
        description: "Listas, grupos y RSVP centralizados para saber siempre quién viene y cómo.",
      },
      {
        id: "value-3",
        title: "Mesas, programa y logística",
        description: "Estructurad tiempos, espacios y desplazamientos con una visión global y práctica.",
      },
      {
        id: "value-4",
        title: "Experiencia digital para invitados",
        description: "Acceso claro, información útil y participación activa en el momento adecuado.",
      },
      {
        id: "value-5",
        title: "Fotos, música y recuerdo final",
        description: "Mantened viva la boda antes y después del evento, con todo conectado en la misma experiencia.",
      },
    ],
  },
  audience: {
    title: "Para parejas con estilos distintos",
    subtitle: "Misma experiencia premium, adaptada a cómo queréis vivir y organizar vuestra boda.",
    segments: [
      {
        id: "audience-1",
        title: "Parejas que quieren gestionarlo todo",
        description: "Desde la preparación privada hasta el cierre post-boda, con control total y sin caos.",
      },
      {
        id: "audience-2",
        title: "Parejas que ya organizan fuera",
        description: "Ideal si solo necesitáis la capa digital/social para invitados, RSVP y experiencia compartida.",
      },
    ],
  },
  planSummary: {
    title: "Cuatro planes, una misma filosofía",
    subtitle:
      "Elige cuánto tiempo queréis vivir la experiencia completa. El detalle de fases y precios está en Planes.",
    plans: [
      {
        id: "social",
        name: "Social — 249 €",
        summary: "Para quien quiere sobre todo invitación digital y experiencia social.",
        highlight: false,
      },
      {
        id: "esencial",
        name: "Esencial — 349 €",
        summary: "Base sólida con preparación completa y experiencia activa antes de la boda.",
        highlight: false,
      },
      {
        id: "completo",
        name: "Completo — 549 €",
        summary: "Plan recomendado para disfrutar una ventana más amplia de experiencia completa.",
        highlight: true,
      },
      {
        id: "premium",
        name: "Premium — 799 €",
        summary: "Máxima amplitud de tiempo y recorrido digital para bodas más extensas.",
        highlight: false,
      },
    ],
    ctaLabel: "Comparar planes",
    ctaHref: "/pricing",
  },
  finalCta: {
    title: "Preparad con tiempo, vivid el momento y cerrad la historia con calma.",
    subtitle:
      "Lazo os acompaña desde la organización inicial hasta el último recuerdo compartido.",
    ctaLabel: "Ver planes",
    ctaHref: "/pricing",
  },
};

export function getDefaultMarketingContent(): MarketingContent {
  return JSON.parse(JSON.stringify(MARKETING_DEFAULTS)) as MarketingContent;
}

export function loadMarketingContent(): MarketingContent {
  if (typeof window === "undefined") return getDefaultMarketingContent();
  return readStorageWithSchema<MarketingContent>(
    MARKETING_CONTENT_KEY,
    marketingContentSchema,
    getDefaultMarketingContent()
  );
}

export function saveMarketingContent(content: MarketingContent) {
  if (typeof window === "undefined") return;
  const parsed = marketingContentSchema.safeParse(content);
  if (!parsed.success) {
    throw new Error("Contenido de marketing no válido.");
  }
  writeStorage(MARKETING_CONTENT_KEY, parsed.data);
}

export function resetMarketingContent() {
  if (typeof window === "undefined") return;
  writeStorage(MARKETING_CONTENT_KEY, getDefaultMarketingContent());
}
