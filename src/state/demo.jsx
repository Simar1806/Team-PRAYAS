import { createContext, useContext, useMemo, useState } from "react";
import { DEMO_STUDENT_ID } from "../data/seed.js";

/** Current audience and student identity used to tailor the shared portal. */
const ViewContext = createContext(null);

export function ViewProvider({ children }) {
  const [role, setRole] = useState("student");
  const value = useMemo(
    () => ({ role, setRole, studentId: DEMO_STUDENT_ID, isAdmin: role === "admin" }),
    [role],
  );
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used inside a ViewProvider");
  return ctx;
}
