import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { TopBar } from "./TopBar.jsx";
import { MobileDrawer } from "./MobileDrawer.jsx";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-shell min-h-dvh bg-[#F3FAFC] text-[#17191D]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:m-4 focus:rounded-xl focus:bg-[#087CC9] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white shadow-lg"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="lg:pl-72">
        <TopBar onOpenMenu={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main id="main-content" className="min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-4.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
