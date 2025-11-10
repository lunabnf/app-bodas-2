import { useState } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
};

export default function SidebarItem({ label, to, children }: Props) {
  const [open, setOpen] = useState(false);
  if (to) {
    return (
      <NavLink
        to={to}
        className={({isActive}) =>
          `block rounded px-3 py-2 ${isActive ? "bg-white text-black" : "hover:bg-white/10"}`
        }
      >
        {label}
      </NavLink>
    );
  }
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left rounded px-3 py-2 hover:bg-white/10"
      >
        {label}
      </button>
      {open && children?.length ? (
        <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
          {children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to.startsWith("/") ? c.to : `/${c.to}`}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive ? "bg-white text-black" : "hover:bg-white/10"
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}