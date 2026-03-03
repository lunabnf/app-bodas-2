import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { applyAppearanceSettings, defaultAppearanceSettings, getAppearanceSettings, saveAppearanceSettings, } from "../services/appearanceService";
import { defaultWeddingSettings, getWeddingSettings, saveWeddingSettings, } from "../services/weddingSettingsService";
export default function Ajustes() {
    const [settings, setSettings] = useState(defaultWeddingSettings);
    const [appearance, setAppearance] = useState(defaultAppearanceSettings);
    useEffect(() => {
        setSettings(getWeddingSettings());
        setAppearance(getAppearanceSettings());
    }, []);
    const subirPortada = (file) => {
        const url = URL.createObjectURL(file);
        const next = { ...settings, portada: url };
        setSettings(next);
        saveWeddingSettings(next);
    };
    const updateSettings = (key, value) => {
        const next = {
            ...settings,
            [key]: value,
        };
        setSettings(next);
        saveWeddingSettings(next);
    };
    const updateAppearance = (key, value) => {
        const next = {
            ...appearance,
            [key]: value,
        };
        setAppearance(next);
        saveAppearanceSettings(next);
        applyAppearanceSettings(next);
    };
    return (_jsxs("div", { className: "mx-auto max-w-5xl space-y-8 px-4 py-6 text-[var(--app-ink)] sm:px-6", children: [_jsxs("div", { className: "app-surface p-8", children: [_jsx("p", { className: "app-kicker", children: "Configuraci\u00F3n" }), _jsx("h1", { className: "app-page-title mt-4", children: "Ajustes y configuraci\u00F3n" }), _jsx("p", { className: "mt-3 max-w-3xl text-[var(--app-muted)]", children: "Controla el contenido general de la boda y tambi\u00E9n la apariencia visual de la aplicaci\u00F3n." })] }), _jsxs("section", { className: "app-panel p-6", children: [_jsx("h2", { className: "app-section-heading mb-4", children: "Datos de la boda" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("input", { type: "text", placeholder: "Nombre del novio / novia 1", value: settings.novio, onChange: (e) => updateSettings("novio", e.target.value), className: "p-3" }), _jsx("input", { type: "text", placeholder: "Nombre del novio / novia 2", value: settings.novia, onChange: (e) => updateSettings("novia", e.target.value), className: "p-3" }), _jsx("input", { type: "date", value: settings.fecha, onChange: (e) => updateSettings("fecha", e.target.value), className: "p-3" }), _jsx("input", { type: "time", value: settings.hora, onChange: (e) => updateSettings("hora", e.target.value), className: "p-3" }), _jsx("input", { type: "text", placeholder: "Ubicaci\u00F3n / direcci\u00F3n", value: settings.ubicacion, onChange: (e) => updateSettings("ubicacion", e.target.value), className: "col-span-1 p-3 md:col-span-2" }), _jsxs("div", { className: "flex flex-col col-span-1 md:col-span-2", children: [_jsx("label", { className: "mb-2 font-semibold text-[var(--app-ink)]", children: "Color principal de la boda" }), _jsx("input", { type: "color", value: settings.color, onChange: (e) => updateSettings("color", e.target.value), className: "h-12 w-24 p-1" })] })] })] }), _jsxs("section", { className: "app-panel p-6", children: [_jsx("h2", { className: "app-section-heading mb-4", children: "Apariencia visual" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsxs("label", { className: "space-y-2", children: [_jsxs("span", { className: "text-sm font-medium text-[var(--app-muted)]", children: ["Tama\u00F1o t\u00EDtulo principal: ", appearance.heroTitleMaxRem.toFixed(1), "rem"] }), _jsx("input", { type: "range", min: "4", max: "7", step: "0.1", value: appearance.heroTitleMaxRem, onChange: (e) => updateAppearance("heroTitleMaxRem", Number(e.target.value)), className: "w-full" })] }), _jsxs("label", { className: "space-y-2", children: [_jsxs("span", { className: "text-sm font-medium text-[var(--app-muted)]", children: ["Tama\u00F1o t\u00EDtulo de p\u00E1gina: ", appearance.pageTitleRem.toFixed(1), "rem"] }), _jsx("input", { type: "range", min: "2.2", max: "4.4", step: "0.1", value: appearance.pageTitleRem, onChange: (e) => updateAppearance("pageTitleRem", Number(e.target.value)), className: "w-full" })] }), _jsxs("label", { className: "space-y-2", children: [_jsxs("span", { className: "text-sm font-medium text-[var(--app-muted)]", children: ["Tama\u00F1o t\u00EDtulos de bloque: ", appearance.sectionTitleRem.toFixed(1), "rem"] }), _jsx("input", { type: "range", min: "1.2", max: "2.4", step: "0.1", value: appearance.sectionTitleRem, onChange: (e) => updateAppearance("sectionTitleRem", Number(e.target.value)), className: "w-full" })] }), _jsxs("label", { className: "space-y-2", children: [_jsxs("span", { className: "text-sm font-medium text-[var(--app-muted)]", children: ["Opacidad paneles principales: ", Math.round(appearance.surfaceOpacity * 100), "%"] }), _jsx("input", { type: "range", min: "0.72", max: "1", step: "0.01", value: appearance.surfaceOpacity, onChange: (e) => updateAppearance("surfaceOpacity", Number(e.target.value)), className: "w-full" })] }), _jsxs("label", { className: "space-y-2 md:col-span-2", children: [_jsxs("span", { className: "text-sm font-medium text-[var(--app-muted)]", children: ["Opacidad paneles suaves: ", Math.round(appearance.softSurfaceOpacity * 100), "%"] }), _jsx("input", { type: "range", min: "0.84", max: "1", step: "0.01", value: appearance.softSurfaceOpacity, onChange: (e) => updateAppearance("softSurfaceOpacity", Number(e.target.value)), className: "w-full" })] })] })] }), _jsxs("section", { className: "app-panel p-6", children: [_jsx("h2", { className: "app-section-heading mb-4", children: "Foto de portada" }), _jsx("button", { onClick: () => document.getElementById("filePortada")?.click(), className: "app-button-secondary mb-4", children: "Subir portada" }), _jsx("input", { id: "filePortada", type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                            if (e.target.files && e.target.files[0])
                                subirPortada(e.target.files[0]);
                        } }), settings.portada && (_jsx("div", { className: "mt-4", children: _jsx("img", { src: settings.portada, alt: "Portada", className: "w-full max-h-60 object-cover rounded" }) }))] }), _jsxs("section", { className: "app-panel p-6", children: [_jsx("h2", { className: "app-section-heading mb-4", children: "Invitaciones" }), _jsx("textarea", { placeholder: "Mensaje personalizado para las invitaciones", value: settings.mensajeInvitacion, onChange: (e) => updateSettings("mensajeInvitacion", e.target.value), className: "mb-3 w-full p-3", rows: 4 }), _jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("input", { type: "checkbox", checked: settings.mostrarPrograma, onChange: () => updateSettings("mostrarPrograma", !settings.mostrarPrograma) }), _jsx("label", { children: "Mostrar programa a los invitados" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: settings.mostrarMesas, onChange: () => updateSettings("mostrarMesas", !settings.mostrarMesas) }), _jsx("label", { children: "Mostrar mesas a los invitados" })] })] }), _jsxs("section", { className: "app-panel p-6", children: [_jsx("h2", { className: "app-section-heading mb-4", children: "Gesti\u00F3n de datos" }), _jsxs("div", { className: "flex flex-col md:flex-row gap-3", children: [_jsx("button", { className: "app-button-secondary", children: "Exportar datos" }), _jsx("button", { className: "app-button-primary", children: "Reiniciar boda (vaciar todo)" })] })] })] }));
}
