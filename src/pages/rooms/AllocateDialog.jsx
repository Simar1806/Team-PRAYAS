import { useMemo, useState } from "react";
import { BedDouble, Search } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  EmptyState,
  Field,
  ProgressBar,
  TextInput,
  useToast,
} from "../../components/ui/index.js";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { academicLine, getFreeBeds, getRoomFree, getUnallocatedStudents, searchStudents } from "../../data/selectors.js";

/**
 * Allocate or reassign a bed.
 * Pass `student` to pick a room for them (profile flow), or `room` to pick
 * an unallocated student for it (rooms flow).
 */
export function AllocateDialog({ open, onClose, student, room }) {
  const { state, dispatch } = useHaven();
  const pushToast = useToast();
  const [block, setBlock] = useState("all");
  const [query, setQuery] = useState("");
  const [pickedRoomId, setPickedRoomId] = useState(null);
  const [pickedStudentId, setPickedStudentId] = useState(null);

  const mode = student ? "pick-room" : "pick-student";

  const candidateRooms = useMemo(() => {
    if (mode !== "pick-room") return [];
    return state.rooms
      .filter((r) => getRoomFree(r) > 0)
      .filter((r) => r.id !== student.roomId)
      .filter((r) => block === "all" || r.block === block)
      .filter((r) => r.id.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => a.block.localeCompare(b.block) || a.id.localeCompare(b.id))
      .slice(0, 60);
  }, [state.rooms, mode, student, block, query]);

  const candidateStudents = useMemo(() => {
    if (mode !== "pick-student") return [];
    return searchStudents(getUnallocatedStudents(state.students), query).slice(0, 60);
  }, [state.students, mode, query]);

  const pickedRoom = pickedRoomId ? state.rooms.find((r) => r.id === pickedRoomId) : null;
  const pickedStudent = pickedStudentId ? state.students.find((s) => s.id === pickedStudentId) : null;

  const reset = () => {
    setPickedRoomId(null);
    setPickedStudentId(null);
    setQuery("");
    setBlock("all");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    if (mode === "pick-room" && pickedRoom && student) {
      const free = getFreeBeds(pickedRoom, state.students)[0];
      if (student.roomId) {
        dispatch(actions.reassignBed(student.id, pickedRoom.id));
        pushToast("success", "Bed reassigned", `${student.name} → Room ${pickedRoom.id}, Bed ${free}.`);
      } else {
        dispatch(actions.allocateBed(student.id, pickedRoom.id));
        pushToast("success", "Bed allocated", `${student.name} → Room ${pickedRoom.id}, Bed ${free}.`);
      }
    } else if (mode === "pick-student" && pickedStudent && room) {
      const free = getFreeBeds(room, state.students)[0];
      dispatch(actions.allocateBed(pickedStudent.id, room.id));
      pushToast("success", "Bed allocated", `${pickedStudent.name} → Room ${room.id}, Bed ${free}.`);
    }
    handleClose();
  };

  const canConfirm = mode === "pick-room" ? !!pickedRoom : !!pickedStudent;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={student?.roomId ? "Reassign Room & Bed" : "Allocate Bed"}
      description={
        mode === "pick-room"
          ? `Select an available room for ${student?.name ?? ""}. The lowest vacant bed is assigned automatically.`
          : `Choose an unallocated resident to place in Room ${room?.id ?? ""}.`
      }
      wide
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {mode === "pick-room" && (
            <div>
              <p className="text-[13px] font-medium text-[#24221F] mb-1.5">Block</p>
              <div className="inline-flex rounded-xl border border-[#E8E2D7] bg-[#F7F4EE] p-1" role="group" aria-label="Block filter">
                {["all", "A", "B", "C", "D"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBlock(b)}
                    aria-pressed={block === b}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      block === b ? "bg-[#3E5BA9] text-white shadow-xs" : "text-[#6F6A62] hover:text-[#2F4785]"
                    }`}
                  >
                    {b === "all" ? "All" : b}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field label={mode === "pick-room" ? "Search Available Rooms" : "Search Unallocated Students"} className="min-w-48 flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6F6A62]" aria-hidden="true" />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={mode === "pick-room" ? "Filter by room ID..." : "Filter by student name..."}
                className="pl-10"
                aria-label={mode === "pick-room" ? "Search rooms" : "Search students"}
              />
            </div>
          </Field>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1" role="listbox" aria-label="Candidates">
          {mode === "pick-room" &&
            candidateRooms.map((r) => {
              const free = getFreeBeds(r, state.students);
              const selected = pickedRoomId === r.id;
              const occupied = r.capacity - free.length;
              const pct = Math.round((occupied / r.capacity) * 100);
              return (
                <button
                  key={r.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setPickedRoomId(selected ? null : r.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                    selected
                      ? "border-[#3E5BA9] bg-[#ECEFF8] ring-2 ring-[#3E5BA9]/20"
                      : "border-[#E8E2D7] bg-white hover:border-[#3E5BA9]/40 hover:bg-[#F7F4EE]"
                  }`}
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E8E2D7] text-[#3E5BA9]" aria-hidden="true">
                    <BedDouble className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-sm text-[#24221F]">{r.id}</span>
                    <span className="block text-xs text-[#6F6A62]">
                      Block {r.block} · Floor {r.floor} · <strong>{free.length} of {r.capacity}</strong> beds free
                    </span>
                    <ProgressBar value={pct} className="mt-1.5 max-w-44" />
                  </span>
                  {selected && <Badge tone="pine">Bed {free[0]} Assigned</Badge>}
                </button>
              );
            })}
          {mode === "pick-student" &&
            candidateStudents.map((s) => {
              const selected = pickedStudentId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setPickedStudentId(selected ? null : s.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                    selected
                      ? "border-[#3E5BA9] bg-[#ECEFF8] ring-2 ring-[#3E5BA9]/20"
                      : "border-[#E8E2D7] bg-white hover:border-[#3E5BA9]/40 hover:bg-[#F7F4EE]"
                  }`}
                >
                  <Avatar name={s.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-sm text-[#24221F]">{s.name}</span>
                    <span className="block text-xs text-[#6F6A62]">{academicLine(s)}</span>
                  </span>
                  {selected && <Badge tone="pine">Selected</Badge>}
                </button>
              );
            })}
          {((mode === "pick-room" && candidateRooms.length === 0) ||
            (mode === "pick-student" && candidateStudents.length === 0)) && (
            <EmptyState
              title={mode === "pick-room" ? "No Vacant Rooms Found" : "No Unallocated Residents"}
              description={
                mode === "pick-room"
                  ? "Try switching blocks or clearing the search query."
                  : "All registered students currently have bed allotments."
              }
            />
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[#E8E2D7] pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {student?.roomId ? "Confirm Reassignment" : "Confirm Allocation"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
