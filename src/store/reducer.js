/**
 * Haven store reducer — pure JavaScript, no React, no JSX.
 * Kept dependency-free so it can be unit-tested directly in Node.
 *
 * Every mutating action also prepends an activity entry, so the
 * dashboard timelines stay truthful without extra dispatches.
 */
import { buildSeedState } from "../data/seed.js";
import { getFreeBeds, getRoom, getStudent } from "../data/selectors.js";

export const STORE_KEY = "haven.hms.v1";
export const STORE_VERSION = 1;

export function createInitialState() {
  return { version: STORE_VERSION, ...buildSeedState() };
}

/* ---------- id helpers ---------- */

function nextNumericId(items, prefix, key = "id") {
  const max = items.reduce((m, item) => {
    const n = parseInt(String(item[key]).replace(prefix, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return { next: `${prefix}${max + 1}`, max };
}

const nextComplaintId = (complaints) => nextNumericId(complaints, "CMP-").next;
const nextAnnouncementId = (announcements) => nextNumericId(announcements, "ann-").next;
const nextStudentId = (students) => {
  const { max } = nextNumericId(
    students.map((s) => ({ id: s.id.replace("st-", "") })),
    "",
  );
  return `st-${String(max + 1).padStart(3, "0")}`;
};

/* ---------- activity ---------- */

function withActivity(state, actor, text, kind) {
  const entry = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    at: new Date(),
    actor,
    text,
    kind,
  };
  return { ...state, activity: [entry, ...state.activity].slice(0, 120) };
}

/* ---------- room helpers ---------- */

function closeOpenHistory(student, at) {
  const history = student.roomHistory.map((h) => ({ ...h }));
  const open = history.find((h) => !h.movedOut);
  if (open) open.movedOut = at;
  return history;
}

/* ---------- reducer ---------- */

export function havenReducer(state, action) {
  switch (action.type) {
    case "ADD_STUDENT": {
      const d = action.student || {};
      if (!d.name?.trim() || !d.course?.trim()) return state;
      const student = {
        id: nextStudentId(state.students),
        name: d.name.trim(),
        course: d.course.trim(),
        year: Math.min(5, Math.max(1, Number(d.year) || 1)),
        phone: (d.phone || "").trim(),
        block: null,
        roomId: null,
        bed: null,
        roomHistory: [],
      };
      const next = { ...state, students: [...state.students, student] };
      return withActivity(next, "Admin", `Added student ${student.name} (${student.id}).`, "room");
    }

    case "UPDATE_STUDENT": {
      const { id, patch = {} } = action;
      if (!getStudent(state.students, id)) return state;
      const students = state.students.map((s) =>
        s.id === id
          ? {
              ...s,
              name: (patch.name ?? s.name).trim() || s.name,
              course: (patch.course ?? s.course).trim() || s.course,
              year: Math.min(5, Math.max(1, Number(patch.year ?? s.year) || s.year)),
              phone: (patch.phone ?? s.phone ?? "").trim(),
            }
          : s,
      );
      return { ...state, students };
    }

    case "REMOVE_STUDENT": {
      const student = getStudent(state.students, action.id);
      if (!student) return state;
      let rooms = state.rooms;
      if (student.roomId) {
        rooms = rooms.map((r) =>
          r.id === student.roomId ? { ...r, occupantIds: r.occupantIds.filter((oid) => oid !== student.id) } : r,
        );
      }
      const next = {
        ...state,
        rooms,
        students: state.students.filter((s) => s.id !== student.id),
      };
      return withActivity(next, "Admin", `Removed student ${student.name} (${student.id}).`, "room");
    }

    case "ALLOCATE_BED": {
      const { studentId, roomId } = action;
      const student = getStudent(state.students, studentId);
      const room = getRoom(state.rooms, roomId);
      if (!student || !room || student.roomId) return state;
      const free = getFreeBeds(room, state.students);
      if (free.length === 0) return state;
      const bed = free[0];
      const at = new Date();
      const students = state.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              roomId: room.id,
              block: room.block,
              bed,
              roomHistory: [...s.roomHistory, { roomId: room.id, bed, movedIn: at, movedOut: null }],
            }
          : s,
      );
      const rooms = state.rooms.map((r) =>
        r.id === room.id ? { ...r, occupantIds: [...r.occupantIds, studentId] } : r,
      );
      const next = { ...state, students, rooms };
      return withActivity(next, "Admin", `Allocated ${room.id} bed ${bed} to ${student.name}.`, "room");
    }

    case "REASSIGN_BED": {
      const { studentId, roomId } = action;
      const student = getStudent(state.students, studentId);
      const room = getRoom(state.rooms, roomId);
      if (!student || !room || !student.roomId || student.roomId === room.id) return state;
      const free = getFreeBeds(room, state.students);
      if (free.length === 0) return state;
      const bed = free[0];
      const at = new Date();
      const oldRoomId = student.roomId;
      const students = state.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              roomId: room.id,
              block: room.block,
              bed,
              roomHistory: [
                ...closeOpenHistory(s, at),
                { roomId: room.id, bed, movedIn: at, movedOut: null },
              ],
            }
          : s,
      );
      const rooms = state.rooms.map((r) => {
        if (r.id === oldRoomId) return { ...r, occupantIds: r.occupantIds.filter((oid) => oid !== studentId) };
        if (r.id === room.id) return { ...r, occupantIds: [...r.occupantIds, studentId] };
        return r;
      });
      const next = { ...state, students, rooms };
      return withActivity(next, "Admin", `Moved ${student.name} from ${oldRoomId} to ${room.id} bed ${bed}.`, "room");
    }

    case "VACATE_BED": {
      const student = getStudent(state.students, action.studentId);
      if (!student || !student.roomId) return state;
      const at = new Date();
      const oldRoomId = student.roomId;
      const students = state.students.map((s) =>
        s.id === student.id
          ? { ...s, roomId: null, block: null, bed: null, roomHistory: closeOpenHistory(s, at) }
          : s,
      );
      const rooms = state.rooms.map((r) =>
        r.id === oldRoomId ? { ...r, occupantIds: r.occupantIds.filter((oid) => oid !== student.id) } : r,
      );
      const next = { ...state, students, rooms };
      return withActivity(next, "Admin", `Vacated ${oldRoomId} bed for ${student.name}.`, "room");
    }

    case "ADD_COMPLAINT": {
      const d = action.complaint || {};
      if (!d.title?.trim() || !d.description?.trim() || !d.studentId) return state;
      const student = getStudent(state.students, d.studentId);
      const at = new Date();
      const complaint = {
        id: nextComplaintId(state.complaints),
        title: d.title.trim(),
        category: d.category || "Other",
        priority: d.priority || "medium",
        status: "submitted",
        description: d.description.trim(),
        studentId: d.studentId,
        createdAt: at,
        timeline: [{ at, by: student?.name ?? "Student", note: "Complaint submitted.", status: "submitted" }],
      };
      const next = { ...state, complaints: [complaint, ...state.complaints] };
      return withActivity(next, student?.name ?? "Student", `Reported ${complaint.title} (${complaint.id}).`, "complaint");
    }

    case "UPDATE_COMPLAINT_STATUS": {
      const { id, status, note, by } = action;
      if (!["submitted", "in_progress", "resolved"].includes(status)) return state;
      const complaint = state.complaints.find((c) => c.id === id);
      if (!complaint || complaint.status === status) return state;
      const at = new Date();
      const complaints = state.complaints.map((c) =>
        c.id === id
          ? { ...c, status, timeline: [...c.timeline, { at, by: by || "Warden", note: note?.trim() || "", status }] }
          : c,
      );
      const next = { ...state, complaints };
      return withActivity(next, by || "Warden", `Marked ${id} as ${status.replace("_", " ")}.`, "complaint");
    }

    case "UPDATE_MEAL": {
      const { day, mealKey, text } = action;
      if (!state.messMenu[day] || !(mealKey in state.messMenu[day]) || !text?.trim()) return state;
      const next = {
        ...state,
        messMenu: { ...state.messMenu, [day]: { ...state.messMenu[day], [mealKey]: text.trim() } },
      };
      return withActivity(next, "Mess Committee", `Updated ${day} ${mealKey} menu.`, "mess");
    }

    case "ADD_ANNOUNCEMENT": {
      const d = action.announcement || {};
      if (!d.title?.trim() || !d.body?.trim()) return state;
      const announcement = {
        id: nextAnnouncementId(state.announcements),
        title: d.title.trim(),
        body: d.body.trim(),
        category: d.category || "General",
        priority: d.priority || "normal",
        publishedAt: new Date(),
      };
      const next = { ...state, announcements: [announcement, ...state.announcements] };
      return withActivity(next, "Warden", `Published announcement: ${announcement.title}.`, "announcement");
    }

    case "DELETE_ANNOUNCEMENT": {
      if (!state.announcements.some((a) => a.id === action.id)) return state;
      const next = { ...state, announcements: state.announcements.filter((a) => a.id !== action.id) };
      return withActivity(next, "Warden", `Deleted an announcement (${action.id}).`, "announcement");
    }

    case "RESET_DEMO":
      return createInitialState();

    default:
      return state;
  }
}

/* ---------- action creators ---------- */

export const actions = {
  addStudent: (student) => ({ type: "ADD_STUDENT", student }),
  updateStudent: (id, patch) => ({ type: "UPDATE_STUDENT", id, patch }),
  removeStudent: (id) => ({ type: "REMOVE_STUDENT", id }),
  allocateBed: (studentId, roomId) => ({ type: "ALLOCATE_BED", studentId, roomId }),
  reassignBed: (studentId, roomId) => ({ type: "REASSIGN_BED", studentId, roomId }),
  vacateBed: (studentId) => ({ type: "VACATE_BED", studentId }),
  addComplaint: (complaint) => ({ type: "ADD_COMPLAINT", complaint }),
  updateComplaintStatus: (id, status, note, by) => ({ type: "UPDATE_COMPLAINT_STATUS", id, status, note, by }),
  updateMeal: (day, mealKey, text) => ({ type: "UPDATE_MEAL", day, mealKey, text }),
  addAnnouncement: (announcement) => ({ type: "ADD_ANNOUNCEMENT", announcement }),
  deleteAnnouncement: (id) => ({ type: "DELETE_ANNOUNCEMENT", id }),
  resetDemo: () => ({ type: "RESET_DEMO" }),
};
