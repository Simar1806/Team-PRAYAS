/**
 * Haven demo data.
 *
 * The 12 named students/6 named rooms are hand-written (they anchor the demo
 * personas, complaints and dashboards). Everything else is generated
 * deterministically (mulberry32) so the directory and room inventory feel
 * real: ~300 students across ~120 rooms, with block occupancy derived from
 * the rooms themselves — a single source of truth.
 *
 * buildSeedState() returns a FRESH state object; the store uses it for the
 * initial load and for demo resets. Module-level constants are a snapshot
 * for components/tests that need static access.
 */

const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000);
const daysAgo = (d) => new Date(now.getTime() - d * 86400 * 1000);

export const DEMO_STUDENT_ID = "aarav";

/** Deterministic PRNG so generated data is stable across reloads. */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMED_STUDENTS = [
  { id: "aarav", name: "Aarav Sharma", course: "B.Tech CSE", year: 2, block: "B", roomId: "B-214", bed: 3, phone: "+91 98110 22334", roomHistory: [{ roomId: "B-208", bed: 2, movedIn: "2024-08-01", movedOut: "2025-06-30" }] },
  { id: "rohan", name: "Rohan Mehta", course: "B.Tech EE", year: 2, block: "B", roomId: "B-214", bed: 1, phone: "+91 98200 44556", roomHistory: [] },
  { id: "kabir", name: "Kabir Singh", course: "B.Tech ME", year: 3, block: "B", roomId: "B-214", bed: 2, phone: "+91 98300 66778", roomHistory: [] },
  { id: "arjun", name: "Arjun Patel", course: "B.Sc Physics", year: 1, block: "B", roomId: "B-214", bed: 4, phone: "+91 98400 88990", roomHistory: [] },
  { id: "priya", name: "Priya Nair", course: "B.Tech CSE", year: 2, block: "C", roomId: "C-102", bed: 1, phone: "+91 98500 11223", roomHistory: [{ roomId: "C-105", bed: 1, movedIn: "2024-08-01", movedOut: "2025-06-30" }] },
  { id: "simran", name: "Simran Kaur", course: "BBA", year: 1, block: "C", roomId: "C-102", bed: 2, phone: "+91 98600 33445", roomHistory: [] },
  { id: "vikram", name: "Vikram Rao", course: "B.Tech CE", year: 3, block: "B", roomId: "B-216", bed: 1, phone: "+91 98700 55667", roomHistory: [] },
  { id: "aditya", name: "Aditya Verma", course: "BCA", year: 2, block: "B", roomId: "B-216", bed: 2, phone: "+91 98800 77889", roomHistory: [] },
  { id: "neha", name: "Neha Gupta", course: "B.Tech CSE", year: 1, block: "A", roomId: "A-101", bed: 1, phone: "+91 98900 99001", roomHistory: [] },
  { id: "ishaan", name: "Ishaan Khan", course: "B.Tech EE", year: 1, block: "A", roomId: "A-101", bed: 2, phone: "+91 99000 11223", roomHistory: [] },
  { id: "divya", name: "Divya Reddy", course: "M.Sc Chemistry", year: 1, block: "D", roomId: "D-301", bed: 1, phone: "+91 99100 33445", roomHistory: [] },
  { id: "karan", name: "Karan Malhotra", course: "B.Tech ME", year: 4, block: "D", roomId: "D-302", bed: 1, phone: "+91 99200 55667", roomHistory: [] },
];

const NAMED_ROOMS = [
  { id: "B-214", block: "B", floor: 2, capacity: 4, occupantIds: ["rohan", "kabir", "aarav", "arjun"] },
  { id: "B-216", block: "B", floor: 2, capacity: 4, occupantIds: ["vikram", "aditya"] },
  { id: "C-102", block: "C", floor: 1, capacity: 3, occupantIds: ["priya", "simran"] },
  { id: "A-101", block: "A", floor: 1, capacity: 3, occupantIds: ["neha", "ishaan"] },
  { id: "D-301", block: "D", floor: 3, capacity: 2, occupantIds: ["divya"] },
  { id: "D-302", block: "D", floor: 3, capacity: 2, occupantIds: ["karan"] },
];

const FIRST_NAMES = ["Vihaan","Arjun","Sai","Reyansh","Krishna","Rohan","Kabir","Aditya","Vikram","Karan","Aryan","Dev","Yash","Om","Harsh","Nikhil","Sahil","Manav","Dhruv","Kunal","Rahul","Amit","Sumit","Deepak","Sanjay","Manoj","Ankit","Vikas","Ashish","Gaurav","Nitin","Pankaj","Sachin","Varun","Tarun","Arun","Kiran","Ravi","Mohan","Rohit","Mohit","Lalit","Tanmay","Farhan","Imran","Zaid","Arman","Rehan"];
const LAST_NAMES = ["Sharma","Verma","Singh","Patel","Mehta","Nair","Kaur","Gupta","Reddy","Rao","Khan","Malhotra","Joshi","Chauhan","Yadav","Mishra","Tiwari","Agarwal","Bansal","Chopra","Khanna","Bhatia","Arora","Kapoor","Saxena","Pandey","Dubey","Chawla","Gill","Sidhu","Brar","Iyer","Menon","Pillai","Das","Sen"];
const COURSES = ["B.Tech CSE","B.Tech EE","B.Tech ME","B.Tech CE","BCA","BBA","B.Sc Physics","M.Sc Chemistry"];

function buildRooms() {
  const rand = mulberry32(20261016);
  const namedIds = new Set(NAMED_ROOMS.map((r) => r.id));
  const rooms = NAMED_ROOMS.map((r) => ({ ...r, occupantIds: [...r.occupantIds] }));
  for (const block of ["A", "B", "C", "D"]) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let n = 1; n <= 10; n++) {
        const id = `${block}-${floor}${String(n).padStart(2, "0")}`;
        if (namedIds.has(id)) continue;
        rooms.push({
          id,
          block,
          floor,
          capacity: [2, 3, 3, 4][Math.floor(rand() * 4)],
          occupantIds: [],
        });
      }
    }
  }
  return rooms;
}

function buildStudents(rooms) {
  const rand = mulberry32(987654);
  const students = NAMED_STUDENTS.map((s) => ({ ...s, roomHistory: [...s.roomHistory] }));
  const usedNames = new Set(students.map((s) => s.name));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  let counter = 1;

  const uniqueName = () => {
    for (let tries = 0; tries < 50; tries++) {
      const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
    const name = `Student ${counter}`;
    usedNames.add(name);
    return name;
  };

  for (const room of rooms) {
    if (room.occupantIds.length > 0) continue; // named room — already filled
    const target = Math.min(room.capacity, Math.max(1, Math.round(room.capacity * (0.72 + rand() * 0.28))));
    for (let i = 0; i < target; i++) {
      const id = `st-${String(counter++).padStart(3, "0")}`;
      const bed = room.occupantIds.length + 1;
      students.push({
        id,
        name: uniqueName(),
        course: pick(COURSES),
        year: 1 + Math.floor(rand() * 4),
        block: room.block,
        roomId: room.id,
        bed,
        phone: `+91 9${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${Math.floor(rand() * 10)} ${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}${Math.floor(rand() * 10)}`,
        roomHistory: [],
      });
      room.occupantIds.push(id);
    }
  }
  return withLoginIds(students);
}

export const STUDENT_ID_PREFIX = "STU2026";
export const DEFAULT_STUDENT_PASSWORD = "Student@123";
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const CITIES = ["Ludhiana, Punjab", "Chandigarh", "Jaipur, Rajasthan", "Lucknow, Uttar Pradesh", "Pune, Maharashtra", "Kochi, Kerala", "Bhopal, Madhya Pradesh", "Dehradun, Uttarakhand", "Amritsar, Punjab", "Hyderabad, Telangana"];

/** Formats the n-th issued student login ID, e.g. 7 -> STU2026007. */
export function formatStudentCode(n) {
  return `${STUDENT_ID_PREFIX}${String(n).padStart(3, "0")}`;
}

/**
 * Every demo student gets an administrator-issued login ID (STU2026001...)
 * plus a completed profile. Aarav and Priya keep 001/002 so the demo
 * credentials stay stable.
 */
function withLoginIds(students) {
  const rand = mulberry32(424242);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const digits = (n) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join("");
  const ordered = [
    ...students.filter((s) => s.id === "aarav"),
    ...students.filter((s) => s.id === "priya"),
    ...students.filter((s) => s.id !== "aarav" && s.id !== "priya"),
  ];
  const codes = new Map(ordered.map((s, i) => [s.id, formatStudentCode(i + 1)]));
  return students.map((s) => {
    const [first, ...rest] = s.name.toLowerCase().split(" ");
    const last = rest.join("") || "student";
    const birthYear = 2008 - s.year - Math.floor(rand() * 2);
    return {
      ...s,
      studentCode: codes.get(s.id),
      profileComplete: true,
      email: `${first}.${last}@haven.edu.in`,
      dob: `${birthYear}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rand() * 28)).padStart(2, "0")}`,
      bloodGroup: pick(BLOOD_GROUPS),
      address: pick(CITIES),
      guardianName: `${pick(["Rajesh", "Sunil", "Anita", "Meena", "Harpreet", "Vijay", "Kavita", "Sanjay"])} ${s.name.split(" ").slice(-1)[0]}`,
      guardianPhone: `+91 9${digits(4)} ${digits(5)}`,
    };
  });
}

function buildComplaints() {
  return [
    {
      id: "CMP-1042",
      title: "Corridor lights flickering on 2nd floor",
      category: "Electrical",
      priority: "high",
      status: "in_progress",
      description: "Two tube lights near the staircase on the second floor of Block B keep flickering since yesterday evening.",
      studentId: "aarav",
      createdAt: hoursAgo(5),
      timeline: [
        { at: hoursAgo(5), by: "Aarav Sharma", note: "Complaint submitted.", status: "submitted" },
        { at: hoursAgo(2), by: "Warden", note: "Electrician assigned — visit scheduled today.", status: "in_progress" },
      ],
    },
    {
      id: "CMP-1041",
      title: "No hot water in the morning",
      category: "Plumbing",
      priority: "high",
      status: "submitted",
      description: "Geysers on the first floor of Block A are not heating. Reported by multiple residents.",
      studentId: "neha",
      createdAt: hoursAgo(3),
      timeline: [{ at: hoursAgo(3), by: "Neha Gupta", note: "Complaint submitted.", status: "submitted" }],
    },
    {
      id: "CMP-1039",
      title: "WiFi down across Block C",
      category: "WiFi",
      priority: "urgent",
      status: "in_progress",
      description: "No connectivity on any floor of Block C since morning. Router lights are red.",
      studentId: "priya",
      createdAt: hoursAgo(8),
      timeline: [
        { at: hoursAgo(8), by: "Priya Nair", note: "Complaint submitted.", status: "submitted" },
        { at: hoursAgo(6), by: "Warden", note: "ISP ticket raised. Temporary hotspot in the common room.", status: "in_progress" },
      ],
    },
    {
      id: "CMP-1038",
      title: "Leaking tap in the washroom",
      category: "Plumbing",
      priority: "medium",
      status: "submitted",
      description: "The tap near the entrance of the second-floor washroom drips continuously.",
      studentId: "rohan",
      createdAt: daysAgo(1),
      timeline: [{ at: daysAgo(1), by: "Rohan Mehta", note: "Complaint submitted.", status: "submitted" }],
    },
    {
      id: "CMP-1036",
      title: "Washing machine not spinning",
      category: "Laundry",
      priority: "medium",
      status: "in_progress",
      description: "Machine 2 in the laundry room fills water but the drum does not spin.",
      studentId: "simran",
      createdAt: daysAgo(1.2),
      timeline: [
        { at: daysAgo(1.2), by: "Simran Kaur", note: "Complaint submitted.", status: "submitted" },
        { at: hoursAgo(20), by: "Warden", note: "Technician visit booked for tomorrow.", status: "in_progress" },
      ],
    },
    {
      id: "CMP-1034",
      title: "Mess food quality has declined",
      category: "Mess",
      priority: "medium",
      status: "submitted",
      description: "Dinner portions have been small all week and the dal was undercooked twice.",
      studentId: "kabir",
      createdAt: daysAgo(2),
      timeline: [{ at: daysAgo(2), by: "Kabir Singh", note: "Complaint submitted.", status: "submitted" }],
    },
    {
      id: "CMP-1031",
      title: "Broken chair in my room",
      category: "Furniture",
      priority: "low",
      status: "resolved",
      description: "One leg of the study chair is cracked and wobbles.",
      studentId: "aarav",
      createdAt: daysAgo(4),
      timeline: [
        { at: daysAgo(4), by: "Aarav Sharma", note: "Complaint submitted.", status: "submitted" },
        { at: daysAgo(3), by: "Warden", note: "Carpenter assigned.", status: "in_progress" },
        { at: daysAgo(2), by: "Warden", note: "Chair replaced with a new one.", status: "resolved" },
      ],
    },
    {
      id: "CMP-1028",
      title: "Common room not cleaned regularly",
      category: "Cleanliness",
      priority: "low",
      status: "resolved",
      description: "Dustbins overflow by evening; the room smells by night.",
      studentId: "vikram",
      createdAt: daysAgo(6),
      timeline: [
        { at: daysAgo(6), by: "Vikram Rao", note: "Complaint submitted.", status: "submitted" },
        { at: daysAgo(5), by: "Warden", note: "Extra evening cleaning round added.", status: "resolved" },
      ],
    },
  ];
}

export const MEAL_TIMES = {
  breakfast: "7:30 – 9:30 AM",
  lunch: "12:30 – 2:30 PM",
  snacks: "5:00 – 6:30 PM",
  dinner: "7:30 – 9:30 PM",
};

export const MEAL_ORDER = ["breakfast", "lunch", "snacks", "dinner"];
export const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", snacks: "Evening Snacks", dinner: "Dinner" };
export { COURSES };

export const COMPLAINT_CATEGORIES = ["Electrical", "Plumbing", "WiFi", "Mess", "Furniture", "Laundry", "Cleanliness", "Other"];
export const PRIORITIES = ["low", "medium", "high", "urgent"];
export const STATUSES = ["submitted", "in_progress", "resolved"];

function buildMessMenu() {
  return {
    Monday: {
      breakfast: "Poha, Jalebi & Chai",
      lunch: "Dal Tadka, Jeera Rice, Tandoori Roti",
      snacks: "Samosa & Chai",
      dinner: "Rajma Chawal, Salad & Papad",
    },
    Tuesday: {
      breakfast: "Aloo Paratha, Curd & Pickle",
      lunch: "Chole, Steamed Rice, Roti",
      snacks: "Bread Pakora & Chai",
      dinner: "Veg Biryani, Raita",
    },
    Wednesday: {
      breakfast: "Idli Sambar, Coconut Chutney",
      lunch: "Dal Makhani, Rice, Roti",
      snacks: "Aloo Tikki & Chai",
      dinner: "Paneer Butter Masala, Naan",
    },
    Thursday: {
      breakfast: "Poori Sabzi & Suji Halwa",
      lunch: "Kadhi, Rice, Roti",
      snacks: "Veg Sandwich & Chai",
      dinner: "Chicken Curry / Veg Kolhapuri, Rice",
    },
    Friday: {
      breakfast: "Upma, Banana & Chai",
      lunch: "Rajma, Rice, Roti",
      snacks: "Veg Cutlet & Chai",
      dinner: "Dal Fry, Mix Veg, Roti",
    },
    Saturday: {
      breakfast: "Chole Bhature & Lassi",
      lunch: "Sambar Rice, Papad & Curd",
      snacks: "Masala Maggi & Chai",
      dinner: "Special Thali Night",
    },
    Sunday: {
      breakfast: "Aloo Puri & Suji Halwa",
      lunch: "Special Sunday Lunch",
      snacks: "Cake & Chai",
      dinner: "Paneer Special, Fried Rice",
    },
  };
}

function buildAnnouncements() {
  return [
    {
      id: "ann-6",
      title: "Water supply maintenance this Sunday, 6 AM – 10 AM",
      body: "The overhead tanks will be cleaned on Sunday morning. Please store drinking water the night before. Tankers will be stationed near Block B.",
      category: "Maintenance",
      priority: "urgent",
      publishedAt: hoursAgo(2),
    },
    {
      id: "ann-5",
      title: "Hostel fee deadline: 30th of this month",
      body: "A late fee of ₹200 per week applies after the deadline. Pay through the accounts office or the online portal.",
      category: "Admin",
      priority: "high",
      publishedAt: daysAgo(1),
    },
    {
      id: "ann-4",
      title: "Inter-hostel cricket tournament — registrations open",
      body: "Form your block team of 11 + 2 substitutes. Register with the sports secretary by Friday. Matches start next weekend.",
      category: "Events",
      priority: "normal",
      publishedAt: daysAgo(1.5),
    },
    {
      id: "ann-3",
      title: "Mess menu feedback form for next month",
      body: "Tell the mess committee what you loved and what needs fixing. The form closes on the 25th.",
      category: "Mess",
      priority: "normal",
      publishedAt: daysAgo(2),
    },
    {
      id: "ann-2",
      title: "New WiFi routers installed in Block C",
      body: "All floors of Block C now have upgraded routers. Reconnect once to the 'Haven-5G' network to pick up the new access points.",
      category: "General",
      priority: "normal",
      publishedAt: daysAgo(3),
    },
    {
      id: "ann-1",
      title: "Diwali celebration planning meeting",
      body: "The cultural committee meets in the common room on Saturday at 6 PM to plan decorations, sweets and the bonfire night.",
      category: "Events",
      priority: "normal",
      publishedAt: daysAgo(5),
    },
  ];
}

function buildActivity() {
  return [
    { id: "act-8", at: hoursAgo(2), actor: "Warden", text: "Marked WiFi complaint CMP-1039 as in progress.", kind: "complaint" },
    { id: "act-7", at: hoursAgo(3), actor: "Neha Gupta", text: "Reported no hot water in Block A (CMP-1041).", kind: "complaint" },
    { id: "act-6", at: hoursAgo(5), actor: "Aarav Sharma", text: "Reported flickering corridor lights (CMP-1042).", kind: "complaint" },
    { id: "act-5", at: hoursAgo(9), actor: "Mess Committee", text: "Published next week's mess menu.", kind: "mess" },
    { id: "act-4", at: daysAgo(1), actor: "Warden", text: "Published urgent notice: Sunday water maintenance.", kind: "announcement" },
    { id: "act-3", at: daysAgo(2), actor: "Warden", text: "Resolved CMP-1031 — chair replaced in B-214.", kind: "complaint" },
    { id: "act-2", at: daysAgo(3), actor: "Admin", text: "Allocated D-302 to Karan Malhotra.", kind: "room" },
    { id: "act-1", at: daysAgo(4), actor: "Maintenance", text: "Completed quarterly fire-extinguisher check.", kind: "maintenance" },
  ];
}

export function buildAccounts(students = []) {
  const staff = [
    {
      id: "acc-1",
      username: "admin",
      password: "Admin@123",
      name: "Chief Warden",
      role: "admin",
      isChief: true,
      canManageAccounts: true,
      studentId: null,
      status: "active",
      createdAt: daysAgo(30).toISOString(),
      lastLogin: hoursAgo(2).toISOString(),
    },
    {
      id: "acc-2",
      username: "warden2",
      password: "Warden@123",
      name: "Assistant Warden",
      role: "admin",
      isChief: false,
      canManageAccounts: false,
      studentId: null,
      status: "active",
      createdAt: daysAgo(15).toISOString(),
      lastLogin: daysAgo(2).toISOString(),
    },
  ];
  const studentAccounts = [...students]
    .sort((a, b) => a.studentCode.localeCompare(b.studentCode))
    .map((s, i) => ({
      id: `acc-${i + 3}`,
      username: s.studentCode,
      password: DEFAULT_STUDENT_PASSWORD,
      name: s.name,
      role: "student",
      isChief: false,
      canManageAccounts: false,
      studentId: s.id,
      status: "active",
      createdAt: daysAgo(30 - Math.min(25, Math.floor(i / 15))).toISOString(),
      lastLogin: null,
    }));
  return [...staff, ...studentAccounts];
}

/**
 * Fresh demo state. Called once per page load for the initial store state
 * and again on demo reset.
 */
export function buildSeedState() {
  const rooms = buildRooms();
  const students = buildStudents(rooms);
  return {
    students,
    rooms,
    complaints: buildComplaints(),
    messMenu: buildMessMenu(),
    announcements: buildAnnouncements(),
    activity: buildActivity(),
    accounts: buildAccounts(students),
  };
}

// Static snapshot for components/tests that don't need the store.
const _seed = buildSeedState();
export const STUDENTS = _seed.students;
export const ROOMS = _seed.rooms;
export const COMPLAINTS = _seed.complaints;
export const MESS_MENU = _seed.messMenu;
export const ANNOUNCEMENTS = _seed.announcements;
export const ACTIVITY = _seed.activity;
export const ACCOUNTS = _seed.accounts;
export const DEMO_ACCOUNTS = {
  student: {
    username: "STU2026001",
    password: "Student@123",
    name: "Aarav Sharma",
    role: "student",
  },
  admin: {
    username: "admin",
    password: "Admin@123",
    name: "Chief Warden",
    role: "admin",
  },
  subAdmin: {
    username: "warden2",
    password: "Warden@123",
    name: "Assistant Warden",
    role: "admin",
  },
};

