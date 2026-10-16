/**
 * localStorage persistence for the Haven store.
 *
 * Storage access is wrapped defensively: some contexts (notably file://
 * pages in hardened browsers) deny it entirely. The app then runs
 * in-memory for the session — nothing crashes, data just doesn't survive
 * a reload. Serve over http(s) for full persistence.
 *
 * `globalThis.localStorage` is read lazily so Node tests can inject a mock.
 */
import { STORE_KEY, STORE_VERSION, createInitialState } from "./reducer.js";

const toDate = (v) => (v instanceof Date ? v : new Date(v));

/** Revive ISO date strings back into Dates after a JSON round-trip. */
export function reviveDates(state) {
  return {
    ...state,
    complaints: state.complaints.map((c) => ({
      ...c,
      createdAt: toDate(c.createdAt),
      timeline: (c.timeline || []).map((t) => ({ ...t, at: toDate(t.at) })),
    })),
    announcements: state.announcements.map((a) => ({ ...a, publishedAt: toDate(a.publishedAt) })),
    activity: state.activity.map((a) => ({ ...a, at: toDate(a.at) })),
    students: state.students.map((s) => ({
      ...s,
      roomHistory: (s.roomHistory || []).map((h) => ({
        ...h,
        movedIn: h.movedIn ? toDate(h.movedIn) : h.movedIn,
        movedOut: h.movedOut ? toDate(h.movedOut) : h.movedOut,
      })),
    })),
  };
}

function isValidState(parsed) {
  return (
    parsed &&
    parsed.version === STORE_VERSION &&
    Array.isArray(parsed.students) &&
    Array.isArray(parsed.rooms) &&
    Array.isArray(parsed.complaints) &&
    Array.isArray(parsed.announcements) &&
    typeof parsed.messMenu === "object"
  );
}

/** Returns the storage object, or null when access is denied/unavailable. */
export function readStorage() {
  try {
    const storage = globalThis.localStorage;
    storage.getItem(STORE_KEY); // probe — throws where access is denied
    return storage;
  } catch {
    return null;
  }
}

/**
 * @returns {{ state: object, persisted: boolean }}
 */
export function loadPersistedState() {
  const storage = readStorage();
  if (!storage) return { state: createInitialState(), persisted: false };
  try {
    const raw = storage.getItem(STORE_KEY);
    if (!raw) return { state: createInitialState(), persisted: false };
    const parsed = JSON.parse(raw);
    if (!isValidState(parsed)) return { state: createInitialState(), persisted: false };
    return { state: reviveDates(parsed), persisted: true };
  } catch {
    return { state: createInitialState(), persisted: false };
  }
}

/** @returns {boolean} true when the write succeeded */
export function persistState(state) {
  const storage = readStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
