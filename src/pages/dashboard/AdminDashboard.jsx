import { BedDouble, Megaphone, Users, UtensilsCrossed, Wrench } from "lucide-react";
import { useHaven } from "../../store/havenStore.jsx";
import {
  getBlockPct,
  getBlockStats,
  getComplaintsByStatus,
  getOpenComplaints,
  getSortedAnnouncements,
  getTotals,
  getUrgentAnnouncements,
  timeAgo,
} from "../../data/selectors.js";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Donut,
  ProgressBar,
  Stat,
} from "../../components/ui/index.js";
import {
  ActivityTimeline,
  CardMoreLink,
  QuickActionTiles,
  STATUS_LABELS,
  STATUS_TONES,
} from "./widgets.jsx";

export function AdminDashboard() {
  const { state } = useHaven();
  const totals = getTotals(state.rooms);
  const blockStats = getBlockStats(state.rooms);
  const open = getOpenComplaints(state.complaints);
  const submitted = getComplaintsByStatus(state.complaints, "submitted").length;
  const inProgress = getComplaintsByStatus(state.complaints, "in_progress").length;
  const resolved = getComplaintsByStatus(state.complaints, "resolved").length;
  const urgentOpen = open.filter((c) => c.priority === "urgent" || c.priority === "high");
  const announcements = getSortedAnnouncements(state.announcements).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
        <Stat
          label="Total Residents"
          value={totals.occupied.toLocaleString("en-IN")}
          icon={Users}
          tone="pine"
          trend={{ direction: "up", text: "+12 residents this term" }}
        />
        <Stat
          label="Overall Occupancy"
          value={`${totals.pct}%`}
          icon={BedDouble}
          tone="mint"
          trend={{ direction: "up", text: "+2% from last month" }}
        />
        <Stat
          label="Open Complaints"
          value={String(open.length)}
          icon={Wrench}
          tone="danger"
          trend={{ direction: "flat", text: `${submitted} new · ${inProgress} active` }}
        />
        <Stat
          label="Available Beds"
          value={String(totals.available)}
          icon={BedDouble}
          tone="brass"
          trend={{ direction: "flat", text: "Across 4 blocks" }}
        />
      </div>

      {/* Row 2: Occupancy + Complaint Triage */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader
            title="Occupancy by Block"
            subtitle={`${totals.occupied.toLocaleString("en-IN")} of ${totals.beds.toLocaleString("en-IN")} total beds occupied`}
          />
          <CardBody className="flex flex-1 items-center">
            <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:gap-10">
              <Donut value={totals.pct} label="Overall occupancy" sublabel="all 4 blocks" />
              <ul className="w-full flex-1 space-y-4">
                {blockStats.map((b) => {
                  const pct = getBlockPct(b);
                  return (
                    <li key={b.id} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-[13px] sm:text-sm">
                        <span className="font-medium text-[#24221F]">{b.name}</span>
                        <span className="text-[#6F6A62] tabular-nums">
                          {b.occupiedBeds.toLocaleString("en-IN")} / {b.totalBeds.toLocaleString("en-IN")} beds ·{" "}
                          <strong className="text-[#24221F]">{pct}%</strong>
                        </span>
                      </div>
                      <ProgressBar value={pct} label={`${b.name} occupancy`} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/rooms">View room inventory</CardMoreLink>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Complaint Triage" subtitle="Operational queue breakdown" />
          <CardBody className="flex-1">
            <ul className="divide-y divide-[#F0ECE4] rounded-xl border border-[#E8E2D7]">
              {[
                ["submitted", submitted],
                ["in_progress", inProgress],
                ["resolved", resolved],
              ].map(([status, count]) => (
                <li
                  key={status}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <Badge tone={STATUS_TONES[status]} dot>
                    {STATUS_LABELS[status]}
                  </Badge>
                  <span className="font-display text-lg font-semibold text-[#24221F] tabular-nums">
                    {count}
                  </span>
                </li>
              ))}
            </ul>

            {urgentOpen.length > 0 && (
              <div className="mt-4 rounded-xl border-l-[3px] border-[#B5483B] bg-[#FEF6F4] p-3.5">
                <div className="flex items-center gap-2">
                  <Badge tone="danger" dot>Action Required</Badge>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#24221F]">
                  <strong className="text-[#B5483B]">{urgentOpen.length} high-priority</strong>{" "}
                  {urgentOpen.length === 1 ? "complaint requires" : "complaints require"} attention
                  {urgentOpen[0] ? ` (${urgentOpen[0].id})` : ""}.
                </p>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/complaints">Review triage queue</CardMoreLink>
          </CardFooter>
        </Card>
      </div>

      {/* Row 3: Activity + Announcements */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Hostel Activity Stream" subtitle="Latest resident and warden updates" />
          <CardBody>
            <ActivityTimeline items={state.activity.slice(0, 6)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Announcements"
            subtitle="Active notices on the board"
            action={
              getUrgentAnnouncements(state.announcements).length > 0 && (
                <Badge tone="danger" dot>
                  Urgent notice
                </Badge>
              )
            }
          />
          <CardBody>
            <ul className="space-y-3.5">
              {announcements.map((a) => (
                <li key={a.id} className="border-b border-[#E8E2D7]/70 pb-3 last:border-0 last:pb-0">
                  <p className="line-clamp-2 text-sm font-semibold text-[#24221F] hover:text-[#3E5BA9] transition-colors">
                    {a.title}
                  </p>
                  <p className="mt-1 text-xs text-[#6F6A62]">
                    {a.category} · {timeAgo(a.publishedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/announcements">Manage notices</CardMoreLink>
          </CardFooter>
        </Card>
      </div>

      {/* Row 4: Quick actions */}
      <QuickActionTiles
        actions={[
          { to: "/students", icon: Users, label: "Student Directory", hint: "Search 314 residents" },
          { to: "/rooms", icon: BedDouble, label: "Room Allocations", hint: "Manage beds & blocks" },
          { to: "/complaints", icon: Wrench, label: "Complaint Queue", hint: "Triage & assign tasks" },
          { to: "/mess", icon: UtensilsCrossed, label: "Mess Schedule", hint: "Review & edit weekly menu" },
          { to: "/announcements", icon: Megaphone, label: "Broadcast Notices", hint: "Publish hostel updates" },
        ]}
      />
    </div>
  );
}
