import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/cn";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { Avatar, Button, Dialog, useToast } from "../ui/index.js";
import { getNavItems } from "./nav.js";
import { Logo } from "./Logo.jsx";

function SidebarLink({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "nav-link group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
          isActive
            ? "bg-[#E6F3FC] text-[#0866A8] shadow-xs"
            : "text-[#696B70] hover:bg-[#F3FAFC] hover:text-[#0866A8]",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#087CC9] transition-all duration-200",
              isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50",
            )}
            aria-hidden="true"
          />
          <Icon
            className={cn(
              "size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
              isActive ? "text-[#087CC9]" : "text-[#696B70] group-hover:text-[#0866A8]",
            )}
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { role, user, logout } = useView();
  const { dispatch } = useHaven();
  const pushToast = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const items = getNavItems(role);

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
    <aside className="sidebar-surface fixed inset-y-0 left-0 z-40 hidden w-72 flex-col lg:flex" aria-label="Sidebar">
      <div className="px-6 pt-7 pb-6 border-b border-[#E8EDF0]">
        <Logo />
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-2.5 px-3.5 text-[11px] font-bold tracking-[0.16em] text-[#696B70] uppercase">
          {role === "admin" ? "Administration" : "Resident Portal"}
        </p>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarLink to={item.to} label={item.label} icon={item.icon} end={item.to === "/"} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#E8EDF0] space-y-3">
        {/* User profile card */}
        <div className="rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {role === "admin" ? (
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E6F3FC] text-[#0866A8] shrink-0">
                <ShieldCheck className="size-4" />
              </span>
            ) : (
              <Avatar name={displayName} size="sm" />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#17191D]">{displayName}</p>
              <p className="truncate text-[10px] text-[#696B70]">
                {role === "admin" ? "Warden Office" : `@${user?.username || "resident"}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-1.5 rounded-lg text-[#696B70] hover:text-[#B43B3B] hover:bg-[#FDF2F2] transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        {/* Demo reset helper */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#696B70] transition-colors hover:text-[#087CC9]"
          >
            <RotateCcw className="size-3" />
            Restore default data
          </button>
          <span className="size-1.5 rounded-full bg-[#16865A]" title="System connected" />
        </div>
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
        <p className="text-sm text-[#696B70]">
          Any newly added students, filed complaints, or edited meals will be replaced with the original baseline data.
        </p>
      </Dialog>
    </aside>
  );
}
