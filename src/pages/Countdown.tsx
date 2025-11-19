import { useEffect, useMemo, useState } from "react";

/**
 * Cuenta atrás a la fecha de la boda.
 * Lee la fecha desde localStorage("wedding.date") en ISO (p. ej. "2025-08-02T18:00:00")
 * y si no existe, usa un valor por defecto.
 */

function readTargetDate(): Date {
  const fecha = localStorage.getItem("wedding.fecha"); // "YYYY-MM-DD"
  const hora = localStorage.getItem("wedding.hora");   // "HH:MM"
  if (fecha && hora) {
    const iso = `${fecha}T${hora}:00`;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date("2025-08-02T18:00:00");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownPage() {
const [target] = useState<Date>(() => readTargetDate());
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">Cuenta atrás</h1>

      <p className="mb-4 text-sm opacity-80">
        Fecha de la boda: {target.toLocaleString()}
      </p>

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