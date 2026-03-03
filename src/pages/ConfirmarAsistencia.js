import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { cleanChildForm, cleanPersonBase, loadGuestRsvpForm, submitGuestRsvp, syncAdultForms, syncChildForms, } from "../application/guestParticipationService";
import { useAuth } from "../store/useAuth";
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
    const invitado = useAuth((state) => state.invitado);
    const [attending, setAttending] = useState("");
    const [numAdults, setNumAdults] = useState(0);
    const [numChildren, setNumChildren] = useState(0);
    const [adults, setAdults] = useState([]);
    const [children, setChildren] = useState([]);
    const [nota, setNota] = useState("");
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        setAdults((prev) => syncAdultForms(numAdults, prev));
    }, [numAdults]);
    useEffect(() => {
        setChildren((prev) => syncChildForms(numChildren, prev));
    }, [numChildren]);
    useEffect(() => {
        if (!invitado)
            return;
        void (async () => {
            const existing = await loadGuestRsvpForm(invitado.token);
            if (!existing)
                return;
            setAttending(existing.attending);
            setNumAdults(existing.numAdults);
            setNumChildren(existing.numChildren);
            setNota(existing.nota);
            setAdults(existing.adults);
            setChildren(existing.children);
        })();
    }, [invitado]);
    function onAdultChange(idx, field, value) {
        setAdults((prev) => {
            const next = [...prev];
            const item = cleanPersonBase({ ...next[idx], [field]: value });
            if (field === "hasAllergy" && value === false) {
                delete item.customAllergy;
                item.allergies = [];
            }
            next[idx] = item;
            return next;
        });
    }
    function onChildChange(idx, field, value) {
        setChildren((prev) => {
            const next = [...prev];
            const item = cleanChildForm({ ...next[idx], [field]: value });
            if (field === "hasAllergy" && value === false) {
                delete item.customAllergy;
                item.allergies = [];
            }
            next[idx] = item;
            return next;
        });
    }
    function toggleAllergy(setList, idx, option, checked) {
        setList((prev) => {
            const copy = [...prev];
            const item = { ...copy[idx] };
            const set = new Set(item.allergies || []);
            if (checked)
                set.add(option);
            else
                set.delete(option);
            item.allergies = Array.from(set);
            if (option === "otro" && !checked) {
                delete item.customAllergy;
            }
            copy[idx] = ("age" in item ? cleanChildForm(item) : cleanPersonBase(item));
            return copy;
        });
    }
    const previewCards = useMemo(() => {
        if (attending !== "si") {
            return [];
        }
        const adultsCards = adults.map((adult, index) => ({
            id: uuid(),
            label: adult.fullName.trim() || `Adulto ${index + 1}`,
            type: "adulto",
            allergy: adult.hasAllergy
                ? ([...(adult.allergies || []).map((item) => ALLERGY_OPTIONS.find((opt) => opt.value === item)?.label || item), adult.customAllergy]
                    .filter(Boolean)
                    .join(", "))
                : undefined,
        }));
        const childrenCards = children.map((child, index) => ({
            id: uuid(),
            label: child.fullName.trim() || `Niño/a ${index + 1}`,
            type: "niño",
            allergy: child.hasAllergy
                ? ([...(child.allergies || []).map((item) => ALLERGY_OPTIONS.find((opt) => opt.value === item)?.label || item), child.customAllergy]
                    .filter(Boolean)
                    .join(", "))
                : undefined,
        }));
        return [...adultsCards, ...childrenCards];
    }, [attending, adults, children]);
    async function onSubmit(e) {
        e.preventDefault();
        if (!invitado)
            return;
        await submitGuestRsvp({
            invitado,
            attending,
            numAdults,
            numChildren,
            adults,
            children,
            nota,
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    }
    return (_jsxs("section", { className: "min-h-screen flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-md px-6 py-10", children: [_jsx("h1", { className: "text-4xl font-bold text-pink-300 mb-6", children: "\uD83D\uDC8C Confirmar asistencia" }), !invitado ? (_jsx("div", { className: "w-full max-w-2xl rounded-lg border border-white/15 bg-white/10 p-6 text-center", children: _jsx("p", { className: "text-white/80", children: "Necesitas identificarte como invitado para guardar tu confirmaci\u00F3n." }) })) : (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-2xl bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 space-y-6", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-sm text-white/70 mb-2", children: "\u00BFAsistir\u00E1s a la boda?" }), _jsxs("div", { className: "flex gap-6", children: [_jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "attending", value: "si", checked: attending === "si", onChange: () => setAttending("si"), required: true }), "S\u00ED"] }), _jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "attending", value: "no", checked: attending === "no", onChange: () => setAttending("no"), required: true }), "No"] })] })] }), attending === "si" && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Adultos" }), _jsx("input", { type: "number", min: 0, value: numAdults, onChange: (e) => setNumAdults(Math.max(0, Number(e.target.value || 0))), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Ni\u00F1os" }), _jsx("input", { type: "number", min: 0, value: numChildren, onChange: (e) => setNumChildren(Math.max(0, Number(e.target.value || 0))), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "0" })] })] })), attending === "si" && (_jsxs(_Fragment, { children: [adults.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold mb-3", children: "Datos de adultos" }), _jsx("div", { className: "space-y-3", children: adults.map((adult, idx) => (_jsxs("div", { className: "rounded-lg border border-white/15 bg-black/20 p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Nombre y apellidos" }), _jsx("input", { type: "text", value: adult.fullName, onChange: (e) => onAdultChange(idx, "fullName", e.target.value), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: `Adulto ${idx + 1}` })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { id: `adult-al-${idx}`, type: "checkbox", checked: adult.hasAllergy, onChange: (e) => onAdultChange(idx, "hasAllergy", e.target.checked) }), _jsx("label", { htmlFor: `adult-al-${idx}`, className: "text-sm", children: "\u00BFAlergias o intolerancias?" })] })] }), adult.hasAllergy ? (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: ALLERGY_OPTIONS.map((opt) => (_jsxs("label", { className: "flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10", children: [_jsx("input", { type: "checkbox", checked: (adult.allergies || []).includes(opt.value), onChange: (e) => toggleAllergy(setAdults, idx, opt.value, e.target.checked) }), opt.label] }, opt.value))) }), (adult.allergies || []).includes("otro") ? (_jsx("input", { className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "Especifica otras alergias o intolerancias", value: adult.customAllergy ?? "", onChange: (e) => onAdultChange(idx, "customAllergy", e.target.value) })) : null] })) : null] }, `adult-${idx}`))) })] })), children.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-semibold mb-3", children: "Datos de ni\u00F1os" }), _jsx("div", { className: "space-y-3", children: children.map((child, idx) => (_jsxs("div", { className: "rounded-lg border border-white/15 bg-black/20 p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Nombre" }), _jsx("input", { type: "text", value: child.fullName, onChange: (e) => onChildChange(idx, "fullName", e.target.value), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: `Niño/a ${idx + 1}` })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Edad (opcional)" }), _jsx("input", { type: "number", min: 0, value: child.age ?? "", onChange: (e) => onChildChange(idx, "age", e.target.value ? Number(e.target.value) : undefined), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { id: `child-al-${idx}`, type: "checkbox", checked: child.hasAllergy, onChange: (e) => onChildChange(idx, "hasAllergy", e.target.checked) }), _jsx("label", { htmlFor: `child-al-${idx}`, className: "text-sm", children: "\u00BFAlergias o intolerancias?" })] })] }), child.hasAllergy ? (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: ALLERGY_OPTIONS.map((opt) => (_jsxs("label", { className: "flex items-center gap-2 text-sm bg-black/20 px-2 py-1 rounded border border-white/10", children: [_jsx("input", { type: "checkbox", checked: (child.allergies || []).includes(opt.value), onChange: (e) => toggleAllergy(setChildren, idx, opt.value, e.target.checked) }), opt.label] }, opt.value))) }), (child.allergies || []).includes("otro") ? (_jsx("input", { className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "Especifica otras alergias o intolerancias", value: child.customAllergy ?? "", onChange: (e) => onChildChange(idx, "customAllergy", e.target.value) })) : null] })) : null] }, `child-${idx}`))) })] }))] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-white/70 mb-1", children: "Nota adicional" }), _jsx("textarea", { value: nota, onChange: (e) => setNota(e.target.value), className: "w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400", placeholder: "Dietas, horarios, carrito de beb\u00E9, lo que necesit\u00E9is contarnos" })] }), _jsxs("div", { className: "pt-2", children: [_jsx("button", { type: "submit", className: "w-full py-2 rounded-md bg-pink-500 hover:bg-pink-400 font-semibold transition", children: "Enviar confirmaci\u00F3n" }), submitted ? (_jsx("p", { className: "text-center text-sm text-green-400 mt-2", children: "Respuesta guardada correctamente." })) : null] })] }), attending === "si" && previewCards.length > 0 ? (_jsx("div", { className: "w-full max-w-2xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3", children: previewCards.map((card) => (_jsxs("article", { className: "rounded-xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3 shadow", children: [_jsx("header", { className: "text-sm opacity-80", children: card.type === "adulto" ? "Adulto" : "Niño/a" }), _jsx("div", { className: "text-base font-medium", children: card.label }), card.allergy ? (_jsxs("div", { className: "text-xs opacity-80 mt-1", children: ["Alergias: ", card.allergy] })) : null] }, card.id))) })) : null] }))] }));
}
