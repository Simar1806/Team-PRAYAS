import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, BedDouble, LogOut, Plus, Search, Users } from "lucide-react";
import { Page, PageHeader } from "../../components/layout/index.js";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  EmptyState,
  Field,
  ProgressBar,
  Stat,
  TextInput,
  useToast,
} from "../../components/ui/index.js";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import {
  formatDateTime,
  getFreeBeds,
  getRoom,
  getRoomFree,
  getRoommates,
  getRoomOccupied,
  getStudent,
  getTotals,
  academicLine,
} from "../../data/selectors.js";
import { AllocateDialog } from "./AllocateDialog.jsx";

function RoomStatusBadge({ room }) {
  const free = getRoomFree(room);
  if (free === 0) return <Badge tone="sand">Full</Badge>;
  if (free === room.capacity) return <Badge tone="info">Empty</Badge>;
  return <Badge tone="ok">{free} {free === 1 ? "bed free" : "beds free"}</Badge>;
}

function RoomDetailDialog({ room, onClose, onAllocate, onMove, onVacate }) {
  const { state } = useHaven();
  if (!room) return null;
  const occupants = room.occupantIds.map((id) => getStudent(state.students, id)).filter(Boolean);
  const free = getFreeBeds(room, state.students);
  const occupied = getRoomOccupied(room);
  const pct = Math.round((occupied / room.capacity) * 100);

  return (
    <Dialog
      open={!!room}
      onClose={onClose}
      title={`Room ${room.id} Allocation`}
      description={`Block ${room.block} · Floor ${room.floor} · Total Capacity: ${room.capacity} beds`}
      wide
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E8E2D7] bg-[#F7F4EE] p-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#24221F] mb-1.5">
            <span>Occupancy Status</span>
            <span>{occupied} of {room.capacity} Beds Filled ({pct}%)</span>
          </div>
          <ProgressBar value={pct} label={`${occupied} of ${room.capacity} beds filled`} />
        </div>

        <p className="text-[13px] font-medium text-[#6F6A62]">
          Current Occupants ({occupants.length})
        </p>

        {occupants.length === 0 ? (
          <EmptyState
            title="Room is Completely Vacant"
            description="No residents are allocated to this room currently."
          />
        ) : (
          <ul className="space-y-2">
            {occupants.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-[#E8E2D7] bg-white p-3 transition-colors hover:border-[#3E5BA9]/40"
              >
                <Avatar name={s.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/students/${s.id}`}
                    className="block truncate text-sm font-semibold text-[#24221F] hover:text-[#3E5BA9] hover:underline"
                  >
                    {s.name}
                  </Link>
                  <p className="text-xs text-[#6F6A62]">Bed {s.bed} · {s.course || "Profile pending"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMove(s)}
                    aria-label={`Reassign ${s.name}`}
                    title="Reassign to another room"
                    className="rounded-lg p-2 text-[#6F6A62] transition-colors hover:bg-[#ECEFF8] hover:text-[#3E5BA9]"
                  >
                    <ArrowRightLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => onVacate(s)}
                    aria-label={`Vacate bed for ${s.name}`}
                    title="Vacate bed"
                    className="rounded-lg p-2 text-[#6F6A62] transition-colors hover:bg-[#FBEAE6] hover:text-[#B5483B]"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {free.length > 0 && (
          <div className="pt-2">
            <Button onClick={onAllocate} fullWidth>
              <Plus className="size-4" aria-hidden="true" /> Allocate Resident (Bed {free[0]} available)
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function AdminRooms() {
  const { state, dispatch } = useHaven();
  const pushToast = useToast();
  const [block, setBlock] = useState("all");
  const [query, setQuery] = useState("");
  const [detailRoomId, setDetailRoomId] = useState(null);
  const [allocateCtx, setAllocateCtx] = useState(null); // {room} | {student} | null
  const [vacateStudent, setVacateStudent] = useState(null);

  const totals = getTotals(state.rooms);
  const fullRooms = state.rooms.filter((r) => getRoomFree(r) === 0).length;

  const rooms = useMemo(() => {
    return state.rooms
      .filter((r) => block === "all" || r.block === block)
      .filter((r) => r.id.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => a.block.localeCompare(b.block) || a.id.localeCompare(b.id));
  }, [state.rooms, block, query]);

  const detailRoom = detailRoomId ? getRoom(state.rooms, detailRoomId) : null;

  const handleVacate = () => {
    dispatch(actions.vacateBed(vacateStudent.id));
    pushToast("success", "Bed vacated", `${vacateStudent.name} is now unallocated.`);
    setVacateStudent(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Room Inventory"
        description="Live bed capacity and occupancy across Blocks A, B, C, and D. Click manage to assign or vacate beds."
      />

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 mb-6">
        <Stat label="Total Rooms" value={String(state.rooms.length)} tone="pine" icon={BedDouble} />
        <Stat label="Available Beds" value={String(totals.available)} tone={totals.available > 0 ? "mint" : "brass"} />
        <Stat label="Full Rooms" value={String(fullRooms)} tone="sand" />
        <Stat label="Total Occupancy" value={`${totals.pct}%`} tone="mint" />
      </div>

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-end gap-3.5">
          <Field label="Search by Room Number" className="min-w-48 flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6F6A62]" aria-hidden="true" />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. B-204, A-101..."
                className="pl-10"
                aria-label="Search rooms"
              />
            </div>
          </Field>
          <div>
            <p className="text-[13px] font-medium text-[#24221F] mb-1.5">
              Filter by Block
            </p>
            <div className="inline-flex rounded-xl border border-[#E8E2D7] bg-[#F7F4EE] p-1" role="group" aria-label="Block filter">
              {["all", "A", "B", "C", "D"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBlock(b)}
                  aria-pressed={block === b}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    block === b
                      ? "bg-[#3E5BA9] text-white shadow-xs"
                      : "text-[#6F6A62] hover:text-[#2F4785] hover:bg-white/60"
                  }`}
                >
                  {b === "all" ? "All Blocks" : `Block ${b}`}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <p className="text-xs text-[#6F6A62] mb-3 px-1" role="status">
        Showing <strong>{rooms.length}</strong> rooms{block !== "all" ? ` in Block ${block}` : " across all blocks"}
      </p>

      {rooms.length === 0 ? (
        <Card>
          <EmptyState title="No rooms match your search" description="Try a different room number or select a different block." />
        </Card>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {rooms.map((r) => {
            const occupied = getRoomOccupied(r);
            const pct = Math.round((occupied / r.capacity) * 100);
            return (
              <Card key={r.id} hoverable className="group">
                <CardBody className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#ECEFF8] text-[#3E5BA9] transition-transform duration-200" aria-hidden="true">
                        <BedDouble className="size-5" />
                      </span>
                      <div>
                        <p className="font-display text-lg font-semibold text-[#24221F] group-hover:text-[#3E5BA9] transition-colors">{r.id}</p>
                        <p className="text-xs text-[#6F6A62]">Block {r.block} · Floor {r.floor}</p>
                      </div>
                    </div>
                    <RoomStatusBadge room={r} />
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-[#6F6A62]">
                      <span>{occupied} of {r.capacity} beds filled</span>
                      <span>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} label={`${occupied} of ${r.capacity} beds`} />
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E8E2D7]">
                    <span className="flex items-center gap-1.5 text-xs text-[#6F6A62]">
                      <Users className="size-3.5" aria-hidden="true" />
                      {occupied === 0 ? "Vacant" : `${occupied} resident${occupied > 1 ? "s" : ""}`}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => setDetailRoomId(r.id)}>
                      Manage Room
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Room Detail Dialog */}
      <RoomDetailDialog
        room={detailRoom}
        onClose={() => setDetailRoomId(null)}
        onAllocate={() => setAllocateCtx({ room: detailRoom })}
        onMove={(s) => {
          setDetailRoomId(null);
          setAllocateCtx({ student: s });
        }}
        onVacate={(s) => setVacateStudent(s)}
      />

      {/* Allocation Flow Dialog */}
      {allocateCtx && (
        <AllocateDialog
          open={!!allocateCtx}
          onClose={() => setAllocateCtx(null)}
          student={allocateCtx.student}
          room={allocateCtx.room}
        />
      )}

      {/* Vacate Confirmation Dialog */}
      <Dialog
        open={!!vacateStudent}
        onClose={() => setVacateStudent(null)}
        title="Vacate Bed Assignment?"
        description={`${vacateStudent?.name ?? ""} will become unallocated.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setVacateStudent(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleVacate}>Vacate Bed</Button>
          </>
        }
      >
        <p className="text-sm text-[#6F6A62]">The bed will immediately become available in the inventory pool for reassignment.</p>
      </Dialog>
    </>
  );
}

function StudentRooms() {
  const { studentId } = useView();
  const { state } = useHaven();
  const student = getStudent(state.students, studentId);
  const room = student?.roomId ? getRoom(state.rooms, student.roomId) : null;
  const roommates = room ? getRoommates(room, state.students, student.id) : [];

  return (
    <>
      <PageHeader
        eyebrow="Resident Portal"
        title="My Room Allotment"
        description="Your room, assigned bed, and roommates at a glance."
      />
      {!room ? (
        <Card>
          <EmptyState
            title="No Bed Assigned Yet"
            description="The warden's office has not yet assigned you a room for this semester. Please check back shortly."
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Room Details" />
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-4xl font-semibold tracking-tight text-[#2F4785]">{room.id}</p>
                  <p className="mt-1 text-xs sm:text-sm text-[#6F6A62]">
                    Block {room.block} · Floor {room.floor} · <strong>Bed {student.bed}</strong> is yours
                  </p>
                </div>
                <Badge tone="ok" dot>Allotted</Badge>
              </div>
              <div className="mt-5 space-y-1">
                <div className="flex justify-between text-xs text-[#6F6A62]">
                  <span>Capacity</span>
                  <span>{getRoomOccupied(room)} of {room.capacity} beds filled</span>
                </div>
                <ProgressBar
                  value={Math.round((getRoomOccupied(room) / room.capacity) * 100)}
                  label={`${getRoomOccupied(room)} of ${room.capacity} beds filled`}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Roommates"
              icon={<Users className="size-4" aria-hidden="true" />}
              action={<Badge tone="sand">{roommates.length} Roommates</Badge>}
            />
            <CardBody>
              {roommates.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#6F6A62]">You currently have the room to yourself.</p>
              ) : (
                <ul className="space-y-2.5">
                  {roommates.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl border border-[#E8E2D7] bg-[#F7F4EE] p-3 transition-colors hover:border-[#3E5BA9]/30 hover:bg-white">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#24221F]">{m.name}</p>
                        <p className="text-xs text-[#6F6A62]">Bed {m.bed} · {academicLine(m)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {student.roomHistory.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader title="Your Room Assignment History" />
              <CardBody>
                <ol className="relative space-y-3.5">
                  {[...student.roomHistory].reverse().map((h, i) => (
                    <li key={i} className="flex gap-3 text-xs items-start">
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-[#3E5BA9]" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-[#24221F]">
                          {h.roomId} <span className="font-normal text-[#6F6A62]">· Bed {h.bed}</span>
                        </p>
                        <p className="text-[11px] text-[#6F6A62]">
                          {h.movedIn ? formatDateTime(h.movedIn) : "?"} → {h.movedOut ? formatDateTime(h.movedOut) : "Present"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

export function Rooms() {
  const { role } = useView();
  return <Page>{role === "admin" ? <AdminRooms /> : <StudentRooms />}</Page>;
}
