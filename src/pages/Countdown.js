import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { getWeddingSettings } from "../services/weddingSettingsService";
/**
 * Cuenta atrás a la fecha de la boda.
 * Lee la fecha desde localStorage("wedding.date") en ISO (p. ej. "2025-08-02T18:00:00")
 * y si no existe, usa un valor por defecto.
 */
function readTargetDate() {
    const { fecha, hora } = getWeddingSettings();
    if (fecha && hora) {
        const iso = `${fecha}T${hora}:00`;
        const d = new Date(iso);
        if (!Number.isNaN(d.getTime()))
            return d;
    }
    return new Date("2025-08-02T18:00:00");
}
function pad(n) {
    return String(n).padStart(2, "0");
}
export default function CountdownPage() {
    const [target] = useState(() => readTargetDate());
    const [now, setNow] = useState(() => new Date());
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
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-3", children: "Cuenta atr\u00E1s" }), _jsxs("p", { className: "mb-4 text-sm opacity-80", children: ["Fecha de la boda: ", target.toLocaleString()] }), _jsxs("section", { className: "flex flex-wrap gap-3", children: [_jsx(Box, { label: "D\u00EDas", value: String(diff.days) }), _jsx(Box, { label: "Horas", value: pad(diff.hours) }), _jsx(Box, { label: "Minutos", value: pad(diff.minutes) }), _jsx(Box, { label: "Segundos", value: pad(diff.seconds) })] }), _jsx("p", { className: "mt-4 text-xs opacity-70", children: "Consejo: esta fecha se guarda en el navegador. Si cambias de dispositivo, vuelve a fijarla." })] }));
}
function Box({ label, value }) {
    return (_jsxs("div", { className: "min-w-[140px] flex-1 sm:flex-none text-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl px-6 py-5 ring-1 ring-white/10/50 transition-transform duration-200 hover:-translate-y-0.5", children: [_jsx("div", { className: "text-5xl font-bold leading-none tracking-tight", children: value }), _jsx("div", { className: "mt-1 text-xs opacity-80", children: label })] }));
}
