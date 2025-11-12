import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const ALLERGY_OPTIONS = [
    { value: "gluten", label: "Gluten / Celiaquía" },
    { value: "lacteos", label: "Lácteos" },
    { value: "frutos-secos", label: "Frutos secos" },
    { value: "marisco", label: "Marisco" },
    { value: "huevo", label: "Huevo" },
    { value: "pescado", label: "Pescado" },
    { value: "soja", label: "Soja" },
    { value: "diabetes", label: "Diabetes" },
    { value: "otro", label: "Otro" },
];
function uuid() {
    const c = globalThis.crypto;
    if (c && "randomUUID" in c) {
        const maybe = c;
        if (typeof maybe.randomUUID === "function")
            return maybe.randomUUID();
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
export default function ConfirmarAsistencia() {
    const [attending, setAttending] = useState("");
    const [numAdults, setNumAdults] = useState(0);
    const [numChildren, setNumChildren] = useState(0);
    const [adults, setAdults] = useState([]);
    const [children, setChildren] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    // Ajusta arrays según cantidades
    useEffect(() => {
        setAdults(prev => {
            const copy = [...prev];
            if (numAdults > copy.length) {
                while (copy.length < numAdults)
                    copy.push({ fullName: "", hasAllergy: false, allergies: [] });
            }
            else if (numAdults < copy.length) {
                copy.length = Math.max(numAdults, 0);
            }
            return copy;
        });
    }, [numAdults]);
    useEffect(() => {
        setChildren(prev => {
            const copy = [...prev];
            if (numChildren > copy.length) {
                while (copy.length < numChildren)
                    copy.push({ fullName: "", hasAllergy: false, allergies: [] });
            }
            else if (numChildren < copy.length) {
                copy.length = Math.max(numChildren, 0);
            }
            return copy;
        });
    }, [numChildren]);
    function onAdultChange(idx, field, value) {
        setAdults(prev => {
            const next = [...prev];
            const item = { ...next[idx], [field]: value };
            if (field === "hasAllergy" && value === false) {
                item.customAllergy = undefined;
                item.allergies = [];
            }
            next[idx] = item;
            return next;
        });
    }
    function onChildChange(idx, field, value) {
        setChildren(prev => {
            const next = [...prev];
            const item = { ...next[idx], [field]: value };
            if (field === "hasAllergy" && value === false) {
                item.customAllergy = undefined;
                item.allergies = [];
            }
            next[idx] = item;
            return next;
        });
    }
    function toggleAllergy(list, setList, idx, option, checked) {
        setList(prev => {
            const copy = [...prev];
            const item = { ...copy[idx] };
            const set = new Set(item.allergies || []);
            if (checked)
                set.add(option);
            else
                set.delete(option);
            item.allergies = Array.from(set);
            if (option === "otro" && !checked) {
                // Si desmarca "otro", limpia el texto libre
                item.customAllergy = undefined;
            }
            copy[idx] = item;
            return copy;
        });
    }
    // Vista previa de tarjetas individuales locales
    const previewCards = useMemo(() => {
        if (attending !== "si")
            return [];
        const adultsCards = adults.map((a, i) => ({
            id: uuid(),
            label: a.fullName.trim() || `Adulto ${i + 1}`,
            type: "adulto",
            allergy: a.hasAllergy
                ? ([...(a.allergies || []).map(x => ALLERGY_OPTIONS.find(o => o.value === x)?.label || x), a.customAllergy]
                    .filter(Boolean)
                    .join(", "))
                : undefined,
        }));
        const childrenCards = children.map((c, i) => ({
            id: uuid(),
            label: c.fullName.trim() || `Niño/a ${i + 1}`,
            type: "niño",
            allergy: c.hasAllergy
                ? ([...(c.allergies || []).map(x => ALLERGY_OPTIONS.find(o => o.value === x)?.label || x), c.customAllergy]
                    .filter(Boolean)
                    .join(", "))
                : undefined,
        }));
        return [...adultsCards, ...childrenCards];
    }, [attending, adults, children]);
    function onSubmit(e) {
        e.preventDefault();
        // Aquí, en el futuro, enviar a Firestore o API y crear tarjetas vinculadas
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    }
    return (_jsxs("section", { className: "min-h-screen flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-md px-6 py-10", children: [_jsx("h1", { className: "text-4xl font-bold text-pink-300 mb-6", children: "\uD83D\uDC8C Confirmar asistencia" }), _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-2xl bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 space-y-6", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-sm text-white/70 mb-2", children: "\u00BFAsistir\u00E1s a la boda?" }), _jsxs("div", { className: "flex gap-6", children: [_jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "attending", value: "si", checked: attending === "si", onChange: () => setAttending("si"), required: true }), "S\u00ED"] }), _jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "attending", value: "no", checked: attending === "no", onChange: () => setAttending("no"), required: true }), "No"] })] })] }), attending === "si" && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Adultos" }), _jsx("input", { type: "number", min: 0, value: numAdults, onChange: (e) => setNumAdults(Math.max(0, Number(e.target.value || 0))), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Ni\u00F1os" }), _jsx("input", { type: "number", min: 0, value: numChildren, onChange: (e) => setNumChildren(Math.max(0, Number(e.target.value || 0))), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "0" })] })] })), attending === "si" && (_jsxs(_Fragment, { children: [adults.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold mb-3", children: "Datos de adultos" }), _jsx("div", { className: "space-y-3", children: adults.map((a, idx) => (_jsxs("div", { className: "rounded-lg border border-white/15 bg-black/20 p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Nombre y apellidos" }), _jsx("input", { type: "text", value: a.fullName, onChange: (e) => onAdultChange(idx, "fullName", e.target.value), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: `Adulto ${idx + 1}` })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { id: `adult-al-${idx}`, type: "checkbox", checked: a.hasAllergy, onChange: (e) => onAdultChange(idx, "hasAllergy", e.target.checked) }), _jsx("label", { htmlFor: `adult-al-${idx}`, className: "text-sm", children: "\u00BFAlergias o intolerancias?" })] })] }), a.hasAllergy && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: ALLERGY_OPTIONS.map(opt => (_jsxs("label", { className: "flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10", children: [_jsx("input", { type: "checkbox", checked: (a.allergies || []).includes(opt.value), onChange: (e) => toggleAllergy(adults, setAdults, idx, opt.value, e.target.checked) }), opt.label] }, opt.value))) }), (a.allergies || []).includes("otro") && (_jsx("input", { className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "Especifica otras alergias o intolerancias", value: a.customAllergy ?? "", onChange: (e) => onAdultChange(idx, "customAllergy", e.target.value) }))] }))] }, `adult-${idx}`))) })] })), children.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold mb-3", children: "Datos de ni\u00F1os" }), _jsx("div", { className: "space-y-3", children: children.map((c, idx) => (_jsxs("div", { className: "rounded-lg border border-white/15 bg-black/20 p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Nombre" }), _jsx("input", { type: "text", value: c.fullName, onChange: (e) => onChildChange(idx, "fullName", e.target.value), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: `Niño/a ${idx + 1}` })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Edad (opcional)" }), _jsx("input", { type: "number", min: 0, value: c.age ?? "", onChange: (e) => onChildChange(idx, "age", e.target.value ? Number(e.target.value) : undefined), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { id: `child-al-${idx}`, type: "checkbox", checked: c.hasAllergy, onChange: (e) => onChildChange(idx, "hasAllergy", e.target.checked) }), _jsx("label", { htmlFor: `child-al-${idx}`, className: "text-sm", children: "\u00BFAlergias o intolerancias?" })] })] }), c.hasAllergy && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: ALLERGY_OPTIONS.map(opt => (_jsxs("label", { className: "flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10", children: [_jsx("input", { type: "checkbox", checked: (c.allergies || []).includes(opt.value), onChange: (e) => toggleAllergy(children, setChildren, idx, opt.value, e.target.checked) }), opt.label] }, opt.value))) }), (c.allergies || []).includes("otro") && (_jsx("input", { className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "Especifica otras alergias o intolerancias", value: c.customAllergy ?? "", onChange: (e) => onChildChange(idx, "customAllergy", e.target.value) }))] }))] }, `child-${idx}`))) })] }))] })), _jsxs("div", { className: "pt-2", children: [_jsx("button", { type: "submit", className: "w-full py-2 rounded-md bg-pink-500 hover:bg-pink-400 font-semibold transition", children: "Enviar confirmaci\u00F3n" }), submitted && (_jsx("p", { className: "text-center text-sm text-green-400 mt-2", children: "Guardado localmente (demo). Pr\u00F3ximamente se crear\u00E1n tarjetas individuales." }))] })] }), attending === "si" && previewCards.length > 0 && (_jsx("div", { className: "w-full max-w-2xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3", children: previewCards.map(card => (_jsxs("article", { className: "rounded-xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 shadow", children: [_jsx("header", { className: "text-sm opacity-80", children: card.type === "adulto" ? "Adulto" : "Niño/a" }), _jsx("div", { className: "text-base font-medium", children: card.label }), card.allergy && _jsxs("div", { className: "text-xs opacity-80 mt-1", children: ["Alergias: ", card.allergy] })] }, card.id))) }))] }));
}
