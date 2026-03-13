export default function BackofficeDashboard() {
  return (
    <section className="space-y-4">
      <div>
        <p className="app-kicker">Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Resumen interno</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Marketing activo</p>
          <p className="mt-2 text-2xl font-semibold">6 bloques</p>
        </article>
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Planes publicados</p>
          <p className="mt-2 text-2xl font-semibold">3</p>
        </article>
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Bodas en sistema</p>
          <p className="mt-2 text-2xl font-semibold">Mock</p>
        </article>
        <article className="app-surface p-5">
          <p className="text-sm text-[var(--app-muted)]">Estado global</p>
          <p className="mt-2 text-2xl font-semibold">Operativo</p>
        </article>
      </div>
    </section>
  );
}
