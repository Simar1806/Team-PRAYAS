import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_STUDENT_ID } from "../data/seed.js";
import { useHaven } from "../store/havenStore.jsx";

const SESSION_STORAGE_KEY = "haven.hms.session";

/** Authentication and View Context */
const ViewContext = createContext(null);

export function ViewProvider({ children }) {
  const { state } = useHaven();
  const [user, setUser] = useState(() => {
    try {
      const stored =
        sessionStorage.getItem(SESSION_STORAGE_KEY) ||
        localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Storage unavailable or invalid JSON
    }
    return null;
  });

  // Verify that active session account is still present and active in state.accounts
  useEffect(() => {
    if (!user) return;
    const accounts = state.accounts || [];
    const matched = accounts.find(
      (a) => a.id === user.id || a.username.toLowerCase() === user.username.toLowerCase(),
    );
    if (!matched || matched.status === "deactivated" || matched.status === "inactive") {
      // Deactivated or removed while session was active
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
    } else if (
      matched.name !== user.name ||
      matched.role !== user.role ||
      matched.password !== user.password ||
      matched.studentId !== user.studentId
    ) {
      // Keep session updated with any admin changes to name or role
      const updated = {
        ...user,
        name: matched.name,
        role: matched.role,
        studentId: matched.studentId,
        password: matched.password,
      };
      setUser(updated);
      try {
        if (localStorage.getItem(SESSION_STORAGE_KEY)) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {
        /* ignore */
      }
    }
  }, [state.accounts, user]);

  const login = useCallback(
    (username, password, rememberMe = false) => {
      if (!username?.trim() || !password) {
        return { success: false, error: "Please enter both your Student ID/Username and password." };
      }
      const cleanUser = username.trim().toLowerCase();
      const accounts = state.accounts || [];
      const account = accounts.find((a) => a.username.toLowerCase() === cleanUser);

      if (!account) {
        return { success: false, error: "Invalid username or password. Please check your credentials." };
      }
      if (account.password !== password) {
        return { success: false, error: "Invalid username or password. Please check your credentials." };
      }
      if (account.status === "deactivated" || account.status === "inactive") {
        return {
          success: false,
          error: "This account has been deactivated. Please contact hostel administration for assistance.",
        };
      }

      const sessionData = {
        id: account.id,
        username: account.username,
        name: account.name,
        role: account.role,
        studentId: account.studentId || (account.role === "student" ? DEMO_STUDENT_ID : null),
        rememberMe: Boolean(rememberMe),
        loginAt: new Date().toISOString(),
      };

      try {
        if (rememberMe) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (err) {
        console.warn("Storage access warning:", err);
      }

      setUser(sessionData);
      return { success: true, user: sessionData };
    },
    [state.accounts],
  );

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  // Permissions are always read from the live account record, so a grant or
  // revoke by the chief administrator applies to an open session immediately.
  const liveAccount = useMemo(() => {
    if (!user) return null;
    return (state.accounts || []).find((a) => a.id === user.id) || null;
  }, [state.accounts, user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: user ? user.role : null,
      studentId: user?.studentId || (user?.role === "student" ? DEMO_STUDENT_ID : null),
      isAdmin: user?.role === "admin",
      isChief: Boolean(liveAccount?.isChief),
      canManageAccounts:
        liveAccount?.role === "admin" && Boolean(liveAccount?.isChief || liveAccount?.canManageAccounts),
      login,
      logout,
    }),
    [user, liveAccount, login, logout],
  );

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used inside a ViewProvider");
  return ctx;
}

export const useAuth = useView;
