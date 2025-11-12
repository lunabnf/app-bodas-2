import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Navbar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (_jsxs("nav", { className: "fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10 text-white", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-3", children: [_jsx("h1", { className: "text-lg sm:text-xl font-semibold tracking-wider text-pink-300 hover:text-pink-400 transition-colors select-none", children: "\uD83D\uDC8D Momentos \u00DAnicos" }), _jsx("button", { onClick: () => setMenuOpen(!menuOpen), className: "sm:hidden text-white focus:outline-none text-2xl", "aria-label": "Abrir men\u00FA", children: menuOpen ? "✕" : "☰" }), _jsx("div", { className: "hidden sm:flex gap-6 text-sm font-medium ml-auto", children: _jsx(NavLink, { to: "/admin/resumen", className: "text-pink-400 hover:text-pink-300 font-semibold transition-colors", children: "Panel de Novios" }) })] }), _jsx("div", { className: `sm:hidden flex flex-col items-center bg-black/80 backdrop-blur-md transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-60 py-4" : "max-h-0 py-0"}`, children: _jsx(NavLink, { to: "/admin/resumen", onClick: () => setMenuOpen(false), className: "py-2 text-pink-300 hover:text-white transition-colors", children: "Panel de Novios" }) })] }));
}
