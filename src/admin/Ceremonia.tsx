import { useEffect, useState } from "react";
import { loadWeddingInsights, type WeddingInsights } from "../application/weddingInsightsService";

export default function Ceremonia() {
  const [insights, setInsights] = useState<WeddingInsights | null>(null);

  useEffect(() => {
    void loadWeddingInsights().then(setInsights);
  }, []);

  return (
    <section className="space-y-4 text-[var(--app-ink)]">
      <div className="app-surface p-6 sm:p-8">
        <p className="app-kicker">Ceremonia</p>
        <h1 className="app-page-title mt-4">Control de ceremonia</h1>
        <p className="mt-3 text-sm text-[var(--app-muted)]">
          Vista logística basada en asistentes confirmados reales del flujo RSVP.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="app-surface-soft p-5">
          <p className="text-sm text-[var(--app-muted)]">Total confirmados</p>
          <p className="mt-2 text-2xl font-semibold">{insights?.confirmados ?? 0}</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-sm text-[var(--app-muted)]">Adultos</p>
          <p className="mt-2 text-2xl font-semibold">{insights?.adultosConfirmados ?? 0}</p>
        </article>
        <article className="app-surface-soft p-5">
          <p className="text-sm text-[var(--app-muted)]">Niños</p>
          <p className="mt-2 text-2xl font-semibold">{insights?.ninosConfirmados ?? 0}</p>
        </article>
      </div>

      <div className="app-surface-soft p-5 sm:p-6">
        <p className="text-sm text-[var(--app-muted)]">
          Esta vista queda preparada para gestionar asientos de ceremonia usando el mismo origen de verdad de asistentes.
        </p>
      </div>
    </section>
  );
}
