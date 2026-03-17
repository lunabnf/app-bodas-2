export function TransportKpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <article className="app-surface-soft p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {helper ? <p className="mt-1 text-sm text-[var(--app-muted)]">{helper}</p> : null}
    </article>
  );
}
