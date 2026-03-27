import { supabaseConfig } from "./supabaseConfig";

export type WeddingBundle = {
  wedding: {
    id: string;
    slug: string;
    eventName: string;
    coupleLabel: string | null;
    weddingDate: string | null;
    status: "draft" | "active" | "paused";
  };
  settings: {
    fecha: string | null;
    hora: string | null;
    novio: string | null;
    novia: string | null;
    portada: string | null;
    guestHomeEnabled: boolean;
    mostrarPrograma: boolean;
    mostrarMesas: boolean;
    guestHomeTitle: string | null;
    guestHomeSubtitle: string | null;
  } | null;
  programItems: Array<{
    id: string;
    sortOrder: number;
    startsAt: string | null;
    title: string;
    description: string | null;
    location: string | null;
  }>;
};

type WeddingRow = {
  id: string;
  slug: string;
  event_name: string;
  couple_label: string | null;
  wedding_date: string | null;
  status: "draft" | "active" | "paused";
};

type WeddingSettingsRow = {
  fecha: string | null;
  hora: string | null;
  novio: string | null;
  novia: string | null;
  portada: string | null;
  guest_home_enabled: boolean;
  mostrar_programa: boolean;
  mostrar_mesas: boolean;
  guest_home_title: string | null;
  guest_home_subtitle: string | null;
};

type WeddingProgramItemRow = {
  id: string;
  sort_order: number;
  starts_at: string | null;
  title: string;
  description: string | null;
  location: string | null;
};

export async function getWeddingBundleBySlug(slug: string): Promise<WeddingBundle | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;
  if (!supabaseConfig.enabled || !supabaseConfig.client) return null;

  const { data: wedding, error: weddingError } = await supabaseConfig.client
    .from("weddings")
    .select("id, slug, event_name, couple_label, wedding_date, status")
    .eq("slug", normalizedSlug)
    .maybeSingle<WeddingRow>();

  if (weddingError) {
    throw weddingError;
  }

  if (!wedding) {
    return null;
  }

  const [settingsResult, programItemsResult] = await Promise.all([
    supabaseConfig.client
      .from("wedding_settings")
      .select(
        "fecha, hora, novio, novia, portada, guest_home_enabled, mostrar_programa, mostrar_mesas, guest_home_title, guest_home_subtitle"
      )
      .eq("wedding_id", wedding.id)
      .maybeSingle<WeddingSettingsRow>(),
    supabaseConfig.client
      .from("wedding_program_items")
      .select("id, sort_order, starts_at, title, description, location")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .order("starts_at", { ascending: true })
      .returns<WeddingProgramItemRow[]>(),
  ]);

  if (settingsResult.error) {
    throw settingsResult.error;
  }

  if (programItemsResult.error) {
    throw programItemsResult.error;
  }

  return {
    wedding: {
      id: wedding.id,
      slug: wedding.slug,
      eventName: wedding.event_name,
      coupleLabel: wedding.couple_label,
      weddingDate: wedding.wedding_date,
      status: wedding.status,
    },
    settings: settingsResult.data
      ? {
          fecha: settingsResult.data.fecha,
          hora: settingsResult.data.hora,
          novio: settingsResult.data.novio,
          novia: settingsResult.data.novia,
          portada: settingsResult.data.portada,
          guestHomeEnabled: settingsResult.data.guest_home_enabled,
          mostrarPrograma: settingsResult.data.mostrar_programa,
          mostrarMesas: settingsResult.data.mostrar_mesas,
          guestHomeTitle: settingsResult.data.guest_home_title,
          guestHomeSubtitle: settingsResult.data.guest_home_subtitle,
        }
      : null,
    programItems: (programItemsResult.data ?? []).map((item) => ({
      id: item.id,
      sortOrder: item.sort_order,
      startsAt: item.starts_at,
      title: item.title,
      description: item.description,
      location: item.location,
    })),
  };
}
