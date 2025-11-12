import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { NavLink } from "react-router-dom";
export default function SidebarItem({ label, to, children }) {
    const [open, setOpen] = useState(false);
    if (to) {
        return (_jsx(NavLink, { to: to, className: ({ isActive }) => `block rounded px-3 py-2 ${isActive ? "bg-white text-black" : "hover:bg-white/10"}`, children: label }));
    }
    return (_jsxs("div", { children: [_jsx("button", { onClick: () => setOpen((v) => !v), "aria-expanded": open, className: "w-full text-left rounded px-3 py-2 hover:bg-white/10", children: label }), open && children?.length ? (_jsx("div", { className: "ml-3 mt-1 space-y-1 border-l border-white/10 pl-3", children: children.map((c) => (_jsx(NavLink, { to: c.to.startsWith("/") ? c.to : `/${c.to}`, className: ({ isActive }) => `block rounded px-3 py-2 text-sm ${isActive ? "bg-white text-black" : "hover:bg-white/10"}`, children: c.label }, c.to))) })) : null] }));
}
