import { BedDouble, Megaphone, UtensilsCrossed, Wrench } from "lucide-react";
import { useView } from "../../state/demo.jsx";
import { MEAL_LABELS, MEAL_ORDER, MEAL_TIMES } from "../../data/seed.js";
import { useHaven } from "../../store/havenStore.jsx";
import {
  formatFullDate,
  getCurrentMealKey,
  getRoom,
  getRoommates,
  getSortedAnnouncements,
  getStudent,
  getStudentComplaints,
  getTodaysMenu,
  getUrgentAnnouncements,
  timeAgo,
} from "../../data/selectors.js";
import {
  Avatar,
  Badge,
  EmptyState,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ProgressBar,
  Stat,
} from "../../components/ui/index.js";
import {
  ActivityTimeline,
  CardMoreLink,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  QuickActionTiles,
  STATUS_LABELS,
  STATUS_TONES,
} from "./widgets.jsx";

export function StudentDashboard() {
  const { studentId } = useView();
  const { state } = useHaven();
  const student = getStudent(state.students, studentId);
  const room = student?.roomId ? getRoom(state.rooms, student.roomId) : null;
  const roommates = room ? getRoommates(room, state.students, studentId) : [];
  const myComplaints = getStudentComplaints(state.complaints, studentId).slice(0, 3);
  const openCount = myComplaints.filter((c) => c.status !== "resolved").length;
  const inProgress = myComplaints.filter((c) => c.status === "in_progress").length;
  const menu = getTodaysMenu(state.messMenu);
  const mealKey = getCurrentMealKey();
  const announcements = getSortedAnnouncements(state.announcements).slice(0, 4);
  const urgentCount = getUrgentAnnouncements(state.announcements).length;
  const occupancyPct = room ? Math.round((room.occupantIds.length / room.capacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-4">
        <Stat
          label="My Room"
          value={room ? room.id : "Pending"}
          icon={BedDouble}
          tone="pine"
          trend={{ direction: "flat", text: room ? `Bed ${student.bed} · Block ${student.block}` : "Awaiting allotment" }}
        />
        <Stat
          label="My Complaints"
          value={String(openCount)}
          icon={Wrench}
          tone={openCount > 0 ? "clay" : "mint"}
          trend={{ direction: "flat", text: `${inProgress} currently in progress` }}
        />
        <Stat
          label={mealKey ? "Now Serving" : "Mess Schedule"}
          value={mealKey ? MEAL_LABELS[mealKey] : `${MEAL_ORDER.length} meals today`}
          icon={UtensilsCrossed}
          tone="mint"
          trend={{ direction: "flat", text: mealKey ? MEAL_TIMES[mealKey] : "Next meal scheduled" }}
        />
        <Stat
          label="Announcements"
          value={String(state.announcements.length)}
          icon={Megaphone}
          tone="brass"
          trend={{ direction: "flat", text: `${urgentCount} urgent on board` }}
        />
      </div>

      {/* Row 2: Room Details + Mess Today */}
      <div className="grid gap-5 lg:grid-cols-3">
        {!room ? (
          <Card className="lg:col-span-2">
            <CardHeader title="My Room Assignment" subtitle="Your bed will appear here once allotted" />
            <CardBody>
              <EmptyState
                icon={BedDouble}
                title="No room allotted yet"
                description="The warden's office will assign your room and bed shortly. You can still use the mess menu, notices and complaints."
              />
            </CardBody>
          </Card>
        ) : (
        <Card className="lg:col-span-2">
          <CardHeader
            title="My Room Assignment"
            subtitle={`Block ${room.block} · Floor ${room.floor} · ${room.occupantIds.length} of ${room.capacity} beds occupied`}
            action={<Badge tone="mint" dot>Active Allotment</Badge>}
          />
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 pb-4 border-b border-[#E8E2D7]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-[#ECEFF8] text-[#3E5BA9]">
                  <BedDouble className="size-6" />
                </span>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#2F4785]">
                    {room.id}
                  </span>
                  <p className="text-xs text-[#6F6A62]">Assigned Bed: <strong>Bed {student.bed}</strong></p>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#6F6A62] mb-1.5 font-medium">
                  <span>Room Capacity</span>
                  <span>{occupancyPct}% full</span>
                </div>
                <ProgressBar value={occupancyPct} label={`Room ${room.id} occupancy`} />
              </div>
            </div>

            <p className="mt-4 mb-2.5 text-[13px] font-medium text-[#6F6A62]">
              Current Roommates
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {roommates.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-[#E8E2D7] bg-white p-3 transition-colors hover:bg-[#FAF8F3]"
                >
                  <Avatar name={m.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#24221F]">{m.name}</p>
                    <p className="text-xs text-[#6F6A62]">Bed {m.bed} · {m.course}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/rooms">View room details</CardMoreLink>
          </CardFooter>
        </Card>
        )}

        <Card>
          <CardHeader title="Today's Mess Menu" subtitle={formatFullDate().split(",").slice(0, 2).join(",")} />
          <CardBody>
            <ul className="divide-y divide-[#F0ECE4]">
              {MEAL_ORDER.map((key) => {
                const isNow = mealKey === key;
                return (
                  <li
                    key={key}
                    className={`py-3 first:pt-0 last:pb-0 ${
                      isNow ? "-mx-3 rounded-lg border-transparent bg-[#E5F2E9]/60 px-3 first:pt-3 last:pb-3" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-medium text-[#9A7B4F] flex items-center gap-1.5">
                        {MEAL_LABELS[key]}
                        {isNow && <Badge tone="ok" dot size="sm">Now</Badge>}
                      </p>
                      <span className="text-[12px] text-[#A39D92]">{MEAL_TIMES[key]}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-[#24221F] line-clamp-2 leading-relaxed">
                      {menu[key]}
                    </p>
                  </li>
                );
              })}
            </ul>
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/mess">View full week menu</CardMoreLink>
          </CardFooter>
        </Card>
      </div>

      {/* Row 3: Complaints + Announcements */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="My Filed Complaints"
            subtitle={`${openCount} active issues · status updates reflect in real-time`}
          />
          <CardBody>
            {myComplaints.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#6F6A62]">
                No complaints filed. Everything is running smoothly!
              </p>
            ) : (
              <ul className="divide-y divide-[#E8E2D7]">
                {myComplaints.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate text-sm font-semibold text-[#24221F]">{c.title}</p>
                      <p className="mt-0.5 text-xs text-[#6F6A62]">
                        {c.id} · {c.category} · {timeAgo(c.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={PRIORITY_TONES[c.priority]}>
                        {PRIORITY_LABELS[c.priority]}
                      </Badge>
                      <Badge tone={STATUS_TONES[c.status]} dot>
                        {STATUS_LABELS[c.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/complaints">Track all complaints</CardMoreLink>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Hostel Notices" subtitle="Important announcements from warden" />
          <CardBody>
            <ul className="space-y-3.5">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className={`border-b border-[#E8E2D7]/70 pb-3 last:border-0 last:pb-0 ${
                    a.priority === "urgent" ? "rounded-lg bg-[#FEF6F4] p-2 border-[#B5483B]/20" : ""
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#24221F]">
                    {a.priority === "urgent" && <Badge tone="danger" dot>Urgent</Badge>}
                    <span className="line-clamp-1">{a.title}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#6F6A62]">
                    {a.category} · {timeAgo(a.publishedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
          <CardFooter>
            <CardMoreLink to="/announcements">All announcements</CardMoreLink>
          </CardFooter>
        </Card>
      </div>

      {/* Row 4: Activity + Quick Actions */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Hostel Updates" subtitle="Recent activity in your residence" />
          <CardBody>
            <ActivityTimeline items={state.activity.slice(0, 6)} />
          </CardBody>
        </Card>
        <QuickActionTiles
          actions={[
            { to: "/complaints", icon: Wrench, label: "Report Issue", hint: "File a room complaint" },
            { to: "/mess", icon: UtensilsCrossed, label: "Weekly Menu", hint: "See meal schedule" },
            { to: "/rooms", icon: BedDouble, label: "Room & Bed", hint: "View roommate info" },
            { to: "/announcements", icon: Megaphone, label: "Notice Board", hint: "Read hostel news" },
          ]}
        />
      </div>
    </div>
  );
}
