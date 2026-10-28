import {
  BedDouble,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Users,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

/**
 * @typedef {object} NavItem
 * @property {string} to route path
 * @property {string} label
 * @property {React.ComponentType} icon Lucide icon component
 * @property {string} blurb
 * @property {("student"|"admin")[]} roles which audiences see this item
 * @property {string} [studentLabel] label override for the student role
 * @property {string} [studentBlurb] blurb override for the student role
 */

/**
 * Every route in the app. All routes resolve for both roles (deep links keep
 * working); navigation display is filtered per role via getNavItems().
 * @type {NavItem[]}
 */
export const ALL_NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    blurb: "Personalised student and administrator dashboards with live stats.",
    roles: ["student", "admin"],
  },
  {
    to: "/students",
    label: "Students",
    icon: Users,
    blurb: "Searchable student directory with profiles and room assignments.",
    roles: ["admin"],
  },
  {
    to: "/rooms",
    label: "Rooms",
    studentLabel: "My Room",
    icon: BedDouble,
    blurb: "Room inventory, live occupancy and the allocation workspace.",
    studentBlurb: "Your room, bed and roommates at a glance.",
    roles: ["student", "admin"],
  },
  {
    to: "/complaints",
    label: "Complaints",
    studentLabel: "My Complaints",
    icon: Wrench,
    blurb: "Submit, track and resolve hostel complaints with status timelines.",
    studentBlurb: "Your complaints and where each one stands.",
    roles: ["student", "admin"],
  },
  {
    to: "/mess",
    label: "Mess Menu",
    icon: UtensilsCrossed,
    blurb: "The weekly mess schedule with today's meals highlighted.",
    roles: ["student", "admin"],
  },
  {
    to: "/announcements",
    label: "Announcements",
    icon: Megaphone,
    blurb: "Hostel notices and priority announcements.",
    roles: ["student", "admin"],
  },
  {
    to: "/accounts",
    label: "Accounts",
    icon: KeyRound,
    blurb: "Manage hostel logins, credentials, and access permissions.",
    roles: ["admin"],
    requires: "accounts",
  },
];

/**
 * Navigation items for the selected audience, with student-facing labels applied.
 * @param {"student"|"admin"} role
 * @param {{canManageAccounts?: boolean}} [perms] items flagged `requires: "accounts"`
 *   are shown only to the chief administrator and admins granted that access
 * @returns {NavItem[]}
 */
export function getNavItems(role, perms = {}) {
  return ALL_NAV_ITEMS.filter(
    (item) => item.roles.includes(role) && (item.requires !== "accounts" || perms.canManageAccounts),
  ).map((item) => ({
    ...item,
    label: role === "student" && item.studentLabel ? item.studentLabel : item.label,
    blurb: role === "student" && item.studentBlurb ? item.studentBlurb : item.blurb,
  }));
}

