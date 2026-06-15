import type { ReactNode } from "react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
};

export default function EmptyState({
  eyebrow = "Todo listo para empezar",
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-[24px] border border-dashed border-[var(--app-line-strong)] bg-[rgba(255,255,255,0.58)] text-center ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-white text-lg">
        +
      </div>
      <p className="app-kicker mt-5">{eyebrow}</p>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--app-muted)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
