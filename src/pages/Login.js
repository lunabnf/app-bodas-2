import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuth";
export default function Login() {
    const [email, setEmail] = useState("demo@demo.com");
    const [password, setPassword] = useState("demo");
    const login = useAuth((s) => s.login);
    const nav = useNavigate();
    async function onSubmit(e) {
        e.preventDefault();
        await login(email, password);
        nav("/admin");
    }
    return (_jsxs("form", { onSubmit: onSubmit, className: "space-y-3 max-w-sm", children: [_jsx("input", { className: "w-full p-2 bg-neutral-800", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { className: "w-full p-2 bg-neutral-800", type: "password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { className: "px-4 py-2 bg-white text-black", children: "Entrar" })] }));
}
