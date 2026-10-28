/**
 * Pure selectors — every dashboard statistic is derived from state here,
 * never hardcoded. They take plain arrays/objects, so the Phase 8-style
 * store can feed them its state without changes.
 */
import { MEAL_ORDER } from "./seed.js";

/* ---------- dates ---------- */

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatFullDate(date = new Date()) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* ---------- occupancy (derived from rooms — single source of truth) ---------- */

export function getRoomOccupied(room) {
  return room.occupantIds.length;
}

export function getRoomFree(room) {
  return room.capacity - room.occupantIds.length;
}

/** Lowest free bed numbers in a room, e.g. [2, 4]. */
export function getFreeBeds(room, students) {
  const used = new Set(
    room.occupantIds
      .map((id) => students.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => s.bed),
  );
  const free = [];
  for (let bed = 1; bed <= room.capacity; bed++) {
    if (!used.has(bed)) free.push(bed);
  }
  return free;
}

export function getTotals(rooms) {
  const beds = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = rooms.reduce((s, r) => s + getRoomOccupied(r), 0);
  return { beds, occupied, available: beds - occupied, pct: beds ? Math.round((occupied / beds) * 100) : 0 };
}

export function getBlockStats(rooms) {
  const map = new Map();
  for (const room of rooms) {
    if (!map.has(room.block)) {
      map.set(room.block, { id: room.block, name: `Block ${room.block}`, totalBeds: 0, occupiedBeds: 0, roomCount: 0 });
    }
    const b = map.get(room.block);
    b.totalBeds += room.capacity;
    b.occupiedBeds += getRoomOccupied(room);
    b.roomCount += 1;
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function getBlockPct(block) {
  return block.totalBeds ? Math.round((block.occupiedBeds / block.totalBeds) * 100) : 0;
}

/* ---------- students & rooms ---------- */

export function getStudent(students, id) {
  return students.find((s) => s.id === id);
}

export function getRoom(rooms, id) {
  return rooms.find((r) => r.id === id);
}

export function getRoommates(room, students, excludeId) {
  if (!room) return [];
  return room.occupantIds
    .filter((id) => id !== excludeId)
    .map((id) => getStudent(students, id))
    .filter(Boolean);
}

export function getUnallocatedStudents(students) {
  return students.filter((s) => !s.roomId);
}

export function searchStudents(students, query) {
  const q = query.trim().toLowerCase();
  if (!q) return students;
  return students.filter((s) =>
    [s.name, s.course, s.id, s.studentCode, s.roomId, s.phone].some((v) => (v ?? "").toLowerCase().includes(q)),
  );
}

/** "B.Tech CSE · Year 2", or a pending note for a freshly issued ID. */
export function academicLine(student) {
  if (!student?.course) return "Profile pending";
  return `${student.course}${student.year ? ` · Year ${student.year}` : ""}`;
}

/* ---------- complaints ---------- */

export function getOpenComplaints(complaints) {
  return complaints.filter((c) => c.status !== "resolved");
}

export function getComplaintsByStatus(complaints, status) {
  return complaints.filter((c) => c.status === status);
}

export function getStudentComplaints(complaints, studentId) {
  return complaints
    .filter((c) => c.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getComplaint(complaints, id) {
  return complaints.find((c) => c.id === id);
}

/* ---------- mess ---------- */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getTodayName(date = new Date()) {
  return DAY_NAMES[new Date(date).getDay()];
}

export function getTodaysMenu(menu, date = new Date()) {
  return menu[getTodayName(date)];
}

/** Which meal window is currently being served, if any. */
export function getCurrentMealKey(date = new Date()) {
  const d = new Date(date);
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 7.5 && h < 9.5) return "breakfast";
  if (h >= 12.5 && h < 14.5) return "lunch";
  if (h >= 17 && h < 18.5) return "snacks";
  if (h >= 19.5 && h < 21.5) return "dinner";
  return null;
}

export function getMealOrder() {
  return MEAL_ORDER;
}

/* ---------- announcements ---------- */

export function getUrgentAnnouncements(announcements) {
  return announcements.filter((a) => a.priority === "urgent");
}

export function getSortedAnnouncements(announcements) {
  const rank = { urgent: 0, high: 1, normal: 2 };
  return [...announcements].sort(
    (a, b) => rank[a.priority] - rank[b.priority] || new Date(b.publishedAt) - new Date(a.publishedAt),
  );
}
