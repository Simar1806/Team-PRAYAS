import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { getStudent } from "../../data/selectors.js";
import { Avatar } from "../ui/Avatar.jsx";
import { Logo } from "./Logo.jsx";

export function TopBar({ onOpenMenu }) {
  const { role, user, logout, studentId } = useView();
  const { state } = useHaven();
  const navigate = useNavigate();

  const student = getStudent(state.students, studentId);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || (role === "admin" ? "Chief Warden" : student?.name || "Resident");

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
                {role === "admin" ? "Administrative View" : "Resident Portal"}
              </span>
              <span className="size-1 rounded-full bg-[#E8EDF0]" />
              <span className="text-xs font-medium text-[#696B70]">
                {role === "admin"
                  ? "Warden Console · Full Access"
                  : `Block ${student?.block || "A"} · Room ${student?.roomId || "101"}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Authenticated User Profile & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User profile indicator */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E8EDF0] bg-[#F3FAFC]">
            {role === "admin" ? (
              <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-lg bg-[#E6F3FC] text-[#0866A8] font-bold text-xs shrink-0">
                <ShieldCheck className="size-4" />
              </span>
            ) : (
              <Avatar name={displayName} size="sm" />
            )}
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-semibold text-[#17191D] max-w-[120px] sm:max-w-[160px]">
                {displayName}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block text-[10px] font-semibold text-[#087CC9] uppercase tracking-wide">
                  {role === "admin" ? "Administrator" : "Resident"}
                </span>
                {user?.username && (
                  <span className="hidden sm:inline text-[10px] text-[#696B70] font-mono">
                    (@{user.username})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of account"
            aria-label="Sign out"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8EDF0] bg-white px-3 py-2 text-xs font-semibold text-[#696B70] hover:text-[#B43B3B] hover:border-[#B43B3B]/30 hover:bg-[#FDF2F2] transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
