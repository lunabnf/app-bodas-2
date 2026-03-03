import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuth";
export default function Login() {
    const [email, setEmail] = useState("demo@demo.com");
    const [password, setPassword] = useState("demo");
    const [token, setToken] = useState("");
    const [adminError, setAdminError] = useState("");
    const [guestError, setGuestError] = useState("");
    const login = useAuth((s) => s.login);
    const invitado = useAuth((s) => s.invitado);
    const esAdmin = useAuth((s) => s.esAdmin);
    const nav = useNavigate();
    useEffect(() => {
        setAdminError("");
    }, [email, password]);
    useEffect(() => {
        setGuestError("");
    }, [token]);
    if (esAdmin) {
        return _jsx(Navigate, { to: "/admin/resumen", replace: true });
    }
    if (invitado) {
        return _jsx(Navigate, { to: "/participa/confirmar-asistencia", replace: true });
    }
    async function onAdminSubmit(e) {
        e.preventDefault();
        try {
            await login(email, password);
            nav("/admin/resumen");
        }
        catch (err) {
            setAdminError(err instanceof Error ? err.message : "No se pudo iniciar sesion");
        }
    }
    function onGuestSubmit(e) {
        e.preventDefault();
        const normalizedToken = token.trim();
        if (!normalizedToken) {
            setGuestError("Introduce el codigo de tu invitacion.");
            return;
        }
        nav(`/rsvp/${encodeURIComponent(normalizedToken)}`);
    }
    return (_jsx("section", { className: "mx-auto max-w-6xl px-6 py-12 sm:px-8", children: _jsxs("div", { className: "w-full max-w-5xl grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { className: "app-surface p-8 sm:p-10", children: [_jsx("p", { className: "app-kicker", children: "Acceso" }), _jsx("h1", { className: "app-page-title mt-4", children: "Entra como invitado o como novios." }), _jsx("p", { className: "mt-5 app-subtitle", children: "Los invitados entran con el codigo de su invitacion para ver su panel. Los novios acceden con sus credenciales para configurar toda la web." })] }), _jsxs("div", { className: "grid gap-6", children: [_jsxs("form", { onSubmit: onGuestSubmit, className: "app-surface-soft space-y-4 p-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "app-section-heading", children: "Invitados" }), _jsx("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: "Introduce el codigo de tu invitacion o el token del QR para entrar en tu panel." })] }), _jsx("input", { className: "w-full p-3", value: token, onChange: (e) => setToken(e.target.value), placeholder: "Codigo de invitacion" }), guestError ? _jsx("p", { className: "text-sm text-red-400", children: guestError }) : null, _jsx("button", { className: "app-button-primary w-full", children: "Entrar como invitado" })] }), _jsxs("form", { onSubmit: onAdminSubmit, className: "app-surface-soft space-y-4 p-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "app-section-heading", children: "Novios" }), _jsx("p", { className: "mt-1 text-sm text-[var(--app-muted)]", children: "Acceso al panel de configuracion, invitados, mesas, programa y ajustes de la boda." })] }), _jsx("input", { className: "w-full p-3", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Email" }), _jsx("input", { className: "w-full p-3", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Contrasena" }), adminError ? _jsx("p", { className: "text-sm text-red-400", children: adminError }) : null, _jsx("button", { className: "app-button-secondary w-full", children: "Entrar al panel de novios" })] })] })] }) }));
}
