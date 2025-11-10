import { useEffect, useMemo, useState } from "react";

/**
 * Cuenta atrás a la fecha de la boda.
 * Lee la fecha desde localStorage("wedding.date") en ISO (p. ej. "2025-08-02T18:00:00")
 * y si no existe, usa un valor por defecto.
 */

function readTargetDate(): Date {
  const fromLS = localStorage.getItem("wedding.date");
  if (fromLS) {
    const d = new Date(fromLS);
    if (!Number.isNaN(d.getTime())) return d;
  }
  // Defecto: 2 de agosto de 2025 a las 18:00
  return new Date("2025-08-02T18:00:00");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownPage() {
  const [target, setTarget] = useState<Date>(() => readTargetDate());
  const [now, setNow] = useState<Date>(() => new Date());

  // Tick por segundo
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = useMemo(() => {
    const ms = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [target, now]);

  function onPickDate(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value; // "YYYY-MM-DDTHH:MM"
    // Safari no soporta segundos en type=datetime-local
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      setTarget(d);
      localStorage.setItem("wedding.date", d.toISOString());
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">Cuenta atrás</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm">
          Fecha de la boda
          <input
            type="datetime-local"
            onChange={onPickDate}
            className="mt-1 block rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
          />
        </label>
        <small className="opacity-70">Actual: {target.toLocaleString()}</small>
      </div>

      <section className="flex flex-wrap gap-3">
        <Box label="Días" value={String(diff.days)} />
        <Box label="Horas" value={pad(diff.hours)} />
        <Box label="Minutos" value={pad(diff.minutes)} />
        <Box label="Segundos" value={pad(diff.seconds)} />
      </section>

      <p className="mt-4 text-xs opacity-70">
        Consejo: esta fecha se guarda en el navegador. Si cambias de dispositivo, vuelve a fijarla.
      </p>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[140px] flex-1 sm:flex-none text-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl px-6 py-5 ring-1 ring-white/10/50 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="text-5xl font-bold leading-none tracking-tight">{value}</div>
      <div className="mt-1 text-xs opacity-80">{label}</div>
    </div>
  );
}