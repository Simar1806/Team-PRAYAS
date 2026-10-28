import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { getStudent } from "../../data/selectors.js";
import { ProfileSetup } from "../../pages/students/ProfileSetup.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { TopBar } from "./TopBar.jsx";
import { MobileDrawer } from "./MobileDrawer.jsx";

const SIDEBAR_KEY = "haven.ui.sidebarCollapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const { role, studentId } = useView();
  const { state } = useHaven();
  const student = role === "student" ? getStudent(state.students, studentId) : null;

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      /* storage unavailable: preference simply isn't remembered */
    }
  }, [collapsed]);

  // A newly issued student ID must complete its profile before the portal opens.
  if (student && !student.profileComplete) {
    return <ProfileSetup student={student} />;
  }

  return (
    <div className="app-shell min-h-dvh bg-[#F7F4EE] text-[#24221F]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:m-4 focus:rounded-xl focus:bg-[#3E5BA9] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white shadow-lg"
      >
        Skip to main content
      </a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <TopBar
          onOpenMenu={() => setDrawerOpen(true)}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main id="main-content" className="min-h-[calc(100dvh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
