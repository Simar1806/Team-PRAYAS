import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { getStudent } from "../../data/selectors.js";
import { Avatar } from "../ui/Avatar.jsx";
import { Logo } from "./Logo.jsx";
import { getNavItems } from "./nav.js";

export function TopBar({ onOpenMenu, collapsed = false, onToggleSidebar }) {
  const { role, user, logout, studentId, canManageAccounts, isChief } = useView();
  const { state } = useHaven();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const student = getStudent(state.students, studentId);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || (role === "admin" ? "Chief Warden" : student?.name || "Resident");

  const section = "/" + (pathname.split("/")[1] || "");
  const current = getNavItems(role, { canManageAccounts }).find((item) => item.to === section);

  return (
    <header className="top-bar sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            aria-controls="mobile-nav"
            className="rounded-lg p-2 text-[#24221F] transition-colors hover:bg-[#F0ECE4] lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div className="lg:hidden">
            <Logo compact />
          </div>

          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="hidden rounded-lg p-2 text-[#6F6A62] transition-colors hover:bg-[#F0ECE4] hover:text-[#24221F] lg:inline-flex"
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
          </button>

          <div className="hidden h-5 w-px bg-[#E8E2D7] lg:block" aria-hidden="true" />

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-[13px] lg:flex">
            <span className="text-[#A39D92]">{role === "admin" ? "Warden Console" : "Resident Portal"}</span>
            <span className="text-[#DCD4C6]">/</span>
            <span className="truncate font-medium text-[#24221F]">{current?.label || "Overview"}</span>
            {role !== "admin" && student && (
              <span className="ml-2 rounded-md bg-[#F0ECE4] px-2 py-0.5 text-[12px] text-[#6F6A62]">
                {student.roomId ? `Block ${student.block} · Room ${student.roomId}` : "Room not yet allotted"}
              </span>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5">
            {role === "admin" ? (
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ECEFF8] text-[#2F4785]">
                <ShieldCheck className="size-4" />
              </span>
            ) : (
              <Avatar name={displayName} size="sm" />
            )}
            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[160px] truncate text-[13px] font-semibold leading-tight text-[#24221F]">
                {displayName}
              </p>
              <p className="text-[11px] leading-tight text-[#6F6A62]">
                {role === "admin" ? (isChief ? "Chief Administrator" : "Administrator") : "Resident"}
                {user?.username && <span className="text-[#A39D92]"> · @{user.username}</span>}
              </p>
            </div>
          </div>

          <div className="mx-1 hidden h-6 w-px bg-[#E8E2D7] sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of account"
            aria-label="Sign out"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#6F6A62] transition-colors hover:bg-[#FDF3F0] hover:text-[#B5483B]"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
