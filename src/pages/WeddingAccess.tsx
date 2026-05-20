import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getWeddingBySlug, type WeddingMock } from "../data/weddingsMock";
import { supabaseConfig } from "../services/supabaseConfig";
import { getWeddingBundleBySlug, type WeddingBundle } from "../services/weddingsRepository";

type WeddingAccessViewModel = {
  nombre: string;
  slug: string;
  codigo: string | null;
};

function buildWeddingAccessViewModel(
  bundle: WeddingBundle | null,
  fallbackWedding: WeddingMock | null
): WeddingAccessViewModel | null {
  if (bundle) {
    return {
      nombre: bundle.wedding.coupleLabel || bundle.wedding.eventName,
      slug: bundle.wedding.slug,
      codigo: null,
    };
  }

  if (fallbackWedding) {
    return {
      nombre: fallbackWedding.nombre,
      slug: fallbackWedding.slug,
      codigo: fallbackWedding.codigo,
    };
  }

  return null;
}

export default function WeddingAccess() {
  const { slug } = useParams();
  const normalizedSlug = slug?.trim().toLowerCase() ?? "";
  const [wedding, setWedding] = useState<WeddingAccessViewModel | null>(null);
  const [loading, setLoading] = useState(Boolean(normalizedSlug));

  useEffect(() => {
    let cancelled = false;

    async function loadWedding() {
      if (!normalizedSlug) {
        setWedding(null);
        setLoading(false);
        return;
      }

      const fallbackWedding = getWeddingBySlug(normalizedSlug);

      if (!supabaseConfig.enabled) {
        // TODO phase 1.1 remove mock fallback once seeded
        setWedding(buildWeddingAccessViewModel(null, fallbackWedding));
        setLoading(false);
        return;
      }

      try {
        const bundle = await getWeddingBundleBySlug(normalizedSlug);

        if (cancelled) return;

        if (!bundle) {
          setWedding(null);
          setLoading(false);
          return;
        }

        setWedding(buildWeddingAccessViewModel(bundle, null));
        setLoading(false);
      } catch (error) {
        // TODO phase 1.1 remove mock fallback once seeded
        console.warn("[WeddingAccess] Supabase lookup failed, using mock fallback.", error);
        if (cancelled) return;
        setWedding(buildWeddingAccessViewModel(null, fallbackWedding));
        setLoading(false);
      }
    }

    void loadWedding();

    return () => {
      cancelled = true;
    };
  }, [normalizedSlug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
        <section className="mx-auto max-w-3xl app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso</p>
          <h1 className="app-page-title mt-4">Buscando boda...</h1>
          <p className="mt-4 text-[var(--app-muted)]">
            Estamos comprobando si existe una boda con ese identificador.
          </p>
        </section>
      </main>
    );
  }

  if (!wedding) {
    return (
      <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
        <section className="mx-auto max-w-3xl app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso</p>
          <h1 className="app-page-title mt-4">Boda no encontrada</h1>
          <p className="mt-4 text-[var(--app-muted)]">
            No existe ninguna boda con ese identificador.
          </p>
          <div className="mt-6">
            <Link to="/buscar-boda" className="app-button-primary inline-flex">
              Volver a buscar
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-8 text-[var(--app-ink)] sm:px-8">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="app-surface p-8 sm:p-10">
          <p className="app-kicker">Acceso a Boda</p>
          <h1 className="app-page-title mt-4">{wedding.nombre}</h1>
          <p className="mt-4 text-sm text-[var(--app-muted)]">
            slug: /w/{wedding.slug}
            {wedding.codigo ? ` · código: ${wedding.codigo}` : ""}
          </p>
        </div>

        <div className="app-surface-soft p-6 sm:p-8">
          <p className="text-sm text-[var(--app-muted)]">
            Esta puerta está pensada para invitados. Si has recibido tu invitación, accede desde tu enlace o QR personal para identificarte correctamente.
          </p>
          <div className="mt-4">
            <Link to={`/w/${wedding.slug}/rsvp`} className="app-button-primary text-center">
              Continuar como invitado
            </Link>
          </div>
          <div className="mt-4">
            <Link to="/buscar-boda" className="text-sm font-semibold text-[var(--app-ink)]">
              Buscar otra boda como invitado
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
