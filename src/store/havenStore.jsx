import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { havenReducer } from "./reducer.js";
import { loadPersistedState, persistState } from "./persistence.js";

const HavenContext = createContext(null);

export function HavenProvider({ children }) {
  const [state, dispatch] = useReducer(havenReducer, undefined, () => loadPersistedState().state);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <HavenContext.Provider value={value}>{children}</HavenContext.Provider>;
}

export function useHaven() {
  const ctx = useContext(HavenContext);
  if (!ctx) throw new Error("useHaven must be used inside a HavenProvider");
  return ctx;
}
