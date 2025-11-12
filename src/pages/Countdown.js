import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
/**
 * Cuenta atrás a la fecha de la boda.
 * Lee la fecha desde localStorage("wedding.date") en ISO (p. ej. "2025-08-02T18:00:00")
 * y si no existe, usa un valor por defecto.
 */
function readTargetDate() {
    const fromLS = localStorage.getItem("wedding.date");
    if (fromLS) {
        const d = new Date(fromLS);
        if (!Number.isNaN(d.getTime()))
            return d;
    }
    // Defecto: 2 de agosto de 2025 a las 18:00
    return new Date("2025-08-02T18:00:00");
}
function pad(n) {
    return String(n).padStart(2, "0");
}
export default function CountdownPage() {
    const [target, setTarget] = useState(() => readTargetDate());
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
    function onPickDate(e) {
        const value = e.target.value; // "YYYY-MM-DDTHH:MM"
        // Safari no soporta segundos en type=datetime-local
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
            setTarget(d);
            localStorage.setItem("wedding.date", d.toISOString());
        }
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-3", children: "Cuenta atr\u00E1s" }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-4", children: [_jsxs("label", { className: "text-sm", children: ["Fecha de la boda", _jsx("input", { type: "datetime-local", onChange: onPickDate, className: "mt-1 block rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md" })] }), _jsxs("small", { className: "opacity-70", children: ["Actual: ", target.toLocaleString()] })] }), _jsxs("section", { className: "flex flex-wrap gap-3", children: [_jsx(Box, { label: "D\u00EDas", value: String(diff.days) }), _jsx(Box, { label: "Horas", value: pad(diff.hours) }), _jsx(Box, { label: "Minutos", value: pad(diff.minutes) }), _jsx(Box, { label: "Segundos", value: pad(diff.seconds) })] }), _jsx("p", { className: "mt-4 text-xs opacity-70", children: "Consejo: esta fecha se guarda en el navegador. Si cambias de dispositivo, vuelve a fijarla." })] }));
}
function Box({ label, value }) {
    return (_jsxs("div", { className: "min-w-[140px] flex-1 sm:flex-none text-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-xl px-6 py-5 ring-1 ring-white/10/50 transition-transform duration-200 hover:-translate-y-0.5", children: [_jsx("div", { className: "text-5xl font-bold leading-none tracking-tight", children: value }), _jsx("div", { className: "mt-1 text-xs opacity-80", children: label })] }));
}
