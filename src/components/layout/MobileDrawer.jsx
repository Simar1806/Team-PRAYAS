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
  const { role, user, logout, canManageAccounts, isChief } = useView();

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

  const items = getNavItems(role, { canManageAccounts });

  const linkCls = ({ isActive }) =>
    cn(
      "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150",
      isActive
        ? "bg-white/[0.09] text-white"
        : "text-[#B9BFCE] hover:bg-white/[0.05] hover:text-white",
    );

  return createPortal(
    <div id="mobile-nav" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button aria-label="Close navigation menu" onClick={onClose} className="absolute inset-0 bg-[#1A1815]/40 backdrop-blur-xs animate-fade-in" />
      <div className="sidebar-surface absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col shadow-pop animate-drawer-in">
        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/[0.08]">
          <Logo onDark />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-2.5 px-3 text-[13px] font-semibold text-white/40">
            {role === "admin" ? "Administration" : "Resident Portal"}
          </p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} onClick={onClose} className={linkCls}>
                  <item.icon className="size-5 shrink-0 text-[#E9C27A]" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.05] p-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || (role === "admin" ? "Chief Warden" : "Student Resident")}
              </p>
              <p className="truncate text-[11px] text-[#E9C27A] font-medium">
                {role === "admin" ? "Administrator" : `@${user?.username || "student"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-[#F2B4A8] hover:bg-white/10 transition-colors"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/40">Haven Residence · Academic Year 2026-27</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
