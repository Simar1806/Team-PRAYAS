import { GraduationCap, Menu, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn.js";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { getStudent } from "../../data/selectors.js";
import { Avatar } from "../ui/Avatar.jsx";
import { Logo } from "./Logo.jsx";
import { getNavItems } from "./nav.js";

const VIEWS = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

export function TopBar({ onOpenMenu }) {
  const { role, setRole, studentId } = useView();
  const { state } = useHaven();
  const location = useLocation();
  const navigate = useNavigate();

  const student = getStudent(state.students, studentId);

  const switchRole = (next) => {
    if (next === role) return;
    setRole(next);
    if (!getNavItems(next).some((item) => item.to === location.pathname)) navigate("/");
  };

  return (
    <header className="top-bar sticky top-0 z-30 border-b border-[#E8EDF0] bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        {/* Left: Mobile hamburger + logo / Desktop title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            aria-controls="mobile-nav"
            className="rounded-lg p-2 text-[#17191D] transition-colors hover:bg-[#F3FAFC] active:bg-[#EBF4F8] lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="hidden min-w-0 lg:block">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.16em] text-[#696B70] uppercase">
                {role === "admin" ? "Administrative View" : "Student View"}
              </span>
              <span className="size-1 rounded-full bg-[#E8EDF0]" />
              <span className="text-xs font-medium text-[#696B70]">
                {role === "admin"
                  ? "Warden Console · Full Access"
                  : `Block ${student.block} · Room ${student.roomId}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher & User Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="role-switcher inline-flex rounded-xl bg-[#F3FAFC] p-1 border border-[#E8EDF0] shadow-xs"
            role="group"
            aria-label="Switch portal view"
          >
            {VIEWS.map(({ value, label, icon: Icon }) => {
              const active = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchRole(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer sm:px-3.5",
                    active
                      ? "bg-[#087CC9] text-white shadow-xs"
                      : "text-[#696B70] hover:text-[#0866A8] hover:bg-white/60",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* User profile indicator */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#E8EDF0]">
            {role === "admin" ? (
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#E6F3FC] text-[#0866A8] font-bold text-xs">
                  <ShieldCheck className="size-4" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-semibold text-[#17191D]">Chief Warden</p>
                  <p className="truncate text-[10px] text-[#696B70]">Hostel Admin</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Avatar name={student.name} size="sm" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-semibold text-[#17191D]">{student.name}</p>
                  <p className="truncate text-[10px] text-[#696B70]">Room {student.roomId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
