import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/index.js";
import { ViewProvider, useView } from "./state/demo.jsx";
import { HavenProvider } from "./store/havenStore.jsx";
import { ToastProvider } from "./components/ui/index.js";
import { Announcements } from "./pages/announcements/Announcements.jsx";
import { Complaints } from "./pages/complaints/Complaints.jsx";
import { Mess } from "./pages/mess/Mess.jsx";
import { Rooms } from "./pages/rooms/Rooms.jsx";
import { StudentProfile } from "./pages/students/StudentProfile.jsx";
import { Students } from "./pages/students/Students.jsx";
import { Accounts } from "./pages/accounts/Accounts.jsx";
import { Dashboard } from "./pages/dashboard/Dashboard.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { NotFound } from "./pages/NotFound.jsx";

/** Protects all routes that require an authenticated resident or staff account */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useView();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/** Restricts administrative features to accounts with the 'admin' role */
function AdminRoute({ children }) {
  const { isAuthenticated, role } = useView();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

/** Accounts are limited to the chief administrator and admins granted access */
function AccountsRoute({ children }) {
  const { isAuthenticated, canManageAccounts } = useView();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canManageAccounts) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <HavenProvider>
      <ViewProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              {/* Public authentication route */}
              <Route path="/login" element={<Login />} />

              {/* Protected residence portal routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route
                  path="students"
                  element={
                    <AdminRoute>
                      <Students />
                    </AdminRoute>
                  }
                />
                <Route path="rooms" element={<Rooms />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="mess" element={<Mess />} />
                <Route path="announcements" element={<Announcements />} />
                <Route
                  path="students/:id"
                  element={
                    <AdminRoute>
                      <StudentProfile />
                    </AdminRoute>
                  }
                />
                <Route
                  path="accounts"
                  element={
                    <AccountsRoute>
                      <Accounts />
                    </AccountsRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </HashRouter>
        </ToastProvider>
      </ViewProvider>
    </HavenProvider>
  );
}
