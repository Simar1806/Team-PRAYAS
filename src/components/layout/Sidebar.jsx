import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/cn";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { Avatar, Button, Dialog, useToast } from "../ui/index.js";
import { getNavItems } from "./nav.js";
import { Logo, LogoMark } from "./Logo.jsx";

function SidebarLink({ to, label, icon: Icon, end = false, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center rounded-lg text-[14px] font-medium transition-colors duration-150",
          collapsed ? "mx-auto size-11 justify-center" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-white/[0.08] text-white"
            : "text-[#AEB5C6] hover:bg-white/[0.04] hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className={cn(
                "absolute rounded-full bg-[#E2A93B]",
                collapsed ? "bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2" : "top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2",
              )}
              aria-hidden="true"
            />
          )}
          <Icon
            className={cn("size-[18px] shrink-0", isActive ? "text-[#E9C27A]" : "text-[#8C94A8] group-hover:text-white")}
            aria-hidden="true"
          />
          <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ collapsed = false }) {
  const { role, user, logout, canManageAccounts, isChief } = useView();
  const { dispatch } = useHaven();
  const pushToast = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const items = getNavItems(role, { canManageAccounts });

  const doReset = () => {
    dispatch(actions.resetDemo());
    setConfirmReset(false);
    pushToast("success", "Records restored", "Hostel records have been reset to default state.");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || (role === "admin" ? "Chief Warden" : "Student Resident");

  return (
    <aside
      className={cn(
        "sidebar-surface fixed inset-y-0 left-0 z-40 hidden flex-col transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
      aria-label="Sidebar"
    >
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center" : "px-5")}>
        {collapsed ? <LogoMark className="size-9" /> : <Logo onDark />}
      </div>

      <nav aria-label="Primary" className={cn("flex-1 overflow-y-auto py-5", collapsed ? "px-2" : "px-4")}>
        {!collapsed && (
          <p className="mb-2 px-3 text-[12px] font-medium text-white/35">
            {role === "admin" ? "Administration" : "Resident Portal"}
          </p>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarLink
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.to === "/"}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn("border-t border-white/[0.06] py-4", collapsed ? "px-2" : "px-4")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {role === "admin" ? (
              <span
                title={displayName}
                className="inline-flex size-9 items-center justify-center rounded-lg bg-[#E2A93B]/15 text-[#E9C27A]"
              >
                <ShieldCheck className="size-4" />
              </span>
            ) : (
              <span title={displayName}>
                <Avatar name={displayName} size="sm" />
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-[#F2B4A8]"
            >
              <LogOut className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              title="Restore default data"
              aria-label="Restore default data"
              className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] p-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                {role === "admin" ? (
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#E2A93B]/15 text-[#E9C27A]">
                    <ShieldCheck className="size-4" />
                  </span>
                ) : (
                  <Avatar name={displayName} size="sm" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">{displayName}</p>
                  <p className="truncate text-[11px] text-white/45">
                    {role === "admin" ? (isChief ? "Chief Administrator" : "Administrator") : `@${user?.username || "resident"}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-[#F2B4A8]"
              >
                <LogOut className="size-4" />
              </button>
            </div>
            <button
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-1 text-[12px] text-white/40 transition-colors hover:text-white"
            >
              <RotateCcw className="size-3" />
              Restore default data
            </button>
          </div>
        )}
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore original records?"
        description="This will reset students, rooms, complaints, mess menu, and announcements to their default initial state."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doReset}>
              Restore records
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#6F6A62]">
          Any newly added students, filed complaints, or edited meals will be replaced with the original baseline data.
        </p>
      </Dialog>
    </aside>
  );
}
