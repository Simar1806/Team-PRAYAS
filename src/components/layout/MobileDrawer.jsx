import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { getNavItems } from "./nav.js";
import { useView } from "../../state/demo.jsx";
import { Logo } from "./Logo.jsx";

export function MobileDrawer({ open, onClose }) {
  const closeRef = useRef(null);
  const { role, user, logout } = useView();

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const items = getNavItems(role);

  const linkCls = ({ isActive }) =>
    cn(
      "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150",
      isActive
        ? "bg-[#E6F3FC] text-[#0866A8] shadow-xs"
        : "text-[#696B70] hover:bg-[#F3FAFC] hover:text-[#0866A8]",
    );

  return createPortal(
    <div id="mobile-nav" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button aria-label="Close navigation menu" onClick={onClose} className="absolute inset-0 bg-[#0E1013]/40 backdrop-blur-xs animate-fade-in" />
      <div className="sidebar-surface absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-pop animate-drawer-in">
        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-[#E8EDF0]">
          <Logo />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-[#696B70] transition-colors hover:bg-[#F3FAFC] hover:text-[#17191D]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-2.5 px-3 text-[11px] font-bold tracking-[0.16em] text-[#696B70] uppercase">
            {role === "admin" ? "Administration" : "Resident Portal"}
          </p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} onClick={onClose} className={linkCls}>
                  <item.icon className="size-5 shrink-0 text-[#087CC9]" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-[#E8EDF0] space-y-2.5">
          <div className="flex items-center justify-between rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] p-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#17191D]">
                {user?.name || (role === "admin" ? "Chief Warden" : "Student Resident")}
              </p>
              <p className="truncate text-[10px] text-[#087CC9] font-medium uppercase">
                {role === "admin" ? "Administrator" : `@${user?.username || "student"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E8EDF0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#B43B3B] hover:bg-[#FDF2F2] transition-colors"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#696B70]">Haven Residence · Academic Year 2026-27</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
