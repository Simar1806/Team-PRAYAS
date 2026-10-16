import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/index.js";
import { ViewProvider } from "./state/demo.jsx";
import { HavenProvider } from "./store/havenStore.jsx";
import { ToastProvider } from "./components/ui/index.js";
import { Announcements } from "./pages/announcements/Announcements.jsx";
import { Complaints } from "./pages/complaints/Complaints.jsx";
import { Mess } from "./pages/mess/Mess.jsx";
import { Rooms } from "./pages/rooms/Rooms.jsx";
import { StudentProfile } from "./pages/students/StudentProfile.jsx";
import { Students } from "./pages/students/Students.jsx";
import { Dashboard } from "./pages/dashboard/Dashboard.jsx";
import { NotFound } from "./pages/NotFound.jsx";
const MODULE_COMPONENTS = {
  "/students": <Students />,
  "/rooms": <Rooms />,
  "/complaints": <Complaints />,
  "/mess": <Mess />,
  "/announcements": <Announcements />,
};
export default function App() {
  return (
    <ViewProvider>
      <HavenProvider>
        <ToastProvider>
          <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="students" element={MODULE_COMPONENTS["/students"]} />
              <Route path="rooms" element={MODULE_COMPONENTS["/rooms"]} />
              <Route path="complaints" element={MODULE_COMPONENTS["/complaints"]} />
              <Route path="mess" element={MODULE_COMPONENTS["/mess"]} />
              <Route path="announcements" element={MODULE_COMPONENTS["/announcements"]} />
              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </HashRouter>
        </ToastProvider>
      </HavenProvider>
    </ViewProvider>
  );
}
