import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, History, Pencil, Phone, Trash2, Wrench } from "lucide-react";
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
  ProgressBar,
  useToast,
} from "../../components/ui/index.js";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import {
  formatDateTime,
  getRoom,
  getRoommates,
  getRoomOccupied,
  getStudent,
  getStudentComplaints,
} from "../../data/selectors.js";
import { StudentForm } from "./StudentForm.jsx";
import { AllocateDialog } from "../rooms/AllocateDialog.jsx";

const STATUS_TONE = { submitted: "warn", in_progress: "info", resolved: "ok" };
const STATUS_LABEL = { submitted: "Submitted", in_progress: "In Progress", resolved: "Resolved" };

export function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useHaven();
  const pushToast = useToast();
  const [dialog, setDialog] = useState(null); // 'edit' | 'delete' | 'allocate' | null

  const student = getStudent(state.students, id);

  if (!student) {
    return (
      <Page>
        <EmptyState
          title="Student Record Not Found"
          description="This student record may have been removed or the ID is incorrect."
          action={
            <Link to="/students">
              <Button variant="secondary">Back to Directory</Button>
            </Link>
          }
        />
      </Page>
    );
  }

  const room = student.roomId ? getRoom(state.rooms, student.roomId) : null;
  const roommates = room ? getRoommates(room, state.students, student.id) : [];
  const complaints = getStudentComplaints(state.complaints, student.id);

  const handleEdit = (data) => {
    dispatch(actions.updateStudent(student.id, data));
    setDialog(null);
    pushToast("success", "Student record updated", data.name);
  };

  const handleDelete = () => {
    dispatch(actions.removeStudent(student.id));
    pushToast("success", "Student removed", student.name);
    navigate("/students");
  };

  const handleVacate = () => {
    dispatch(actions.vacateBed(student.id));
    pushToast("success", "Bed vacated", `${student.name} is now unallocated.`);
  };

  return (
    <Page>
      <div className="mb-4">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087CC9] hover:text-[#0866A8] hover:underline transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to Student Directory
        </Link>
      </div>

      <PageHeader
        eyebrow={`Resident ID: ${student.id}`}
        title={student.name}
        description={`${student.course} · Academic Year ${student.year}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDialog("edit")}>
              <Pencil className="size-4" aria-hidden="true" /> Edit Details
            </Button>
            <Button variant="danger" onClick={() => setDialog("delete")}>
              <Trash2 className="size-4" aria-hidden="true" /> Remove
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        {/* Personal & Contact Profile */}
        <Card>
          <CardHeader title="Student Details" />
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={student.name} size="lg" />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-[#17191D]">{student.name}</p>
                <p className="text-xs text-[#696B70]">{student.id}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="pine">Year {student.year}</Badge>
                  <Badge tone={student.roomId ? "ok" : "warn"}>
                    {student.roomId ? "Allocated" : "Unallocated"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 pt-4 border-t border-[#E8EDF0] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#696B70]">Course / Branch</span>
                <span className="font-semibold text-[#17191D]">{student.course}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#696B70]">Phone Contact</span>
                <span className="font-semibold text-[#17191D] flex items-center gap-1">
                  <Phone className="size-3 text-[#696B70]" />
                  {student.phone || "None on record"}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Current Room Assignment */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Room Assignment"
            icon={<BedDouble className="size-4" aria-hidden="true" />}
            action={
              room ? (
                <Badge tone="ok" dot>Bed {student.bed} Active</Badge>
              ) : (
                <Badge tone="warn">Unallocated</Badge>
              )
            }
          />
          <CardBody>
            {room ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl font-bold tracking-tight text-[#0866A8]">{room.id}</p>
                    <p className="mt-0.5 text-xs text-[#696B70]">
                      Block {room.block} · Floor {room.floor} · Bed {student.bed} is assigned to {student.name.split(" ")[0]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setDialog("allocate")}>
                      Reassign Room
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleVacate}>
                      Vacate Bed
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#696B70]">
                    <span>Occupancy</span>
                    <span>{getRoomOccupied(room)} of {room.capacity} beds filled</span>
                  </div>
                  <ProgressBar
                    value={Math.round((getRoomOccupied(room) / room.capacity) * 100)}
                    label={`${getRoomOccupied(room)} of ${room.capacity} beds filled`}
                  />
                </div>

                {roommates.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#696B70]">Roommates</p>
                    <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {roommates.map((m) => (
                        <li key={m.id}>
                          <Link
                            to={`/students/${m.id}`}
                            className="flex items-center gap-2.5 rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] p-2.5 transition-colors hover:border-[#087CC9]/40 hover:bg-white"
                          >
                            <Avatar name={m.name} size="sm" />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-[#17191D]">{m.name}</span>
                              <span className="block text-[11px] text-[#696B70]">Bed {m.bed} · {m.course}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No Bed Assigned"
                description="This student is not currently allocated to any room in Haven Residence."
                action={<Button onClick={() => setDialog("allocate")}>Allocate Bed Now</Button>}
              />
            )}
          </CardBody>
        </Card>

        {/* Room Assignment History */}
        <Card>
          <CardHeader title="Room History" icon={<History className="size-4" aria-hidden="true" />} />
          <CardBody>
            {student.roomHistory.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#696B70]">No previous assignment records.</p>
            ) : (
              <ol className="relative space-y-3.5">
                {[...student.roomHistory].reverse().map((h, i) => (
                  <li key={i} className="flex gap-3 text-xs items-start">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-[#087CC9]" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-[#17191D]">
                        {h.roomId} <span className="font-normal text-[#696B70]">· Bed {h.bed}</span>
                      </p>
                      <p className="text-[11px] text-[#696B70]">
                        {h.movedIn ? formatDateTime(h.movedIn) : "?"} → {h.movedOut ? formatDateTime(h.movedOut) : "Present"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>

        {/* Resident Complaints History */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Complaint History"
            icon={<Wrench className="size-4" aria-hidden="true" />}
            action={<Badge tone="sand">{complaints.length} Filed</Badge>}
          />
          <CardBody>
            {complaints.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#696B70]">No complaints filed by this student.</p>
            ) : (
              <ul className="space-y-2">
                {complaints.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] px-3.5 py-2.5 transition-colors hover:border-[#087CC9]/30 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17191D]">{c.title}</p>
                      <p className="text-xs text-[#696B70]">{c.id} · {formatDateTime(c.createdAt)}</p>
                    </div>
                    <Badge tone={STATUS_TONE[c.status]} dot>{STATUS_LABEL[c.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={dialog === "edit"} onClose={() => setDialog(null)} title="Edit Student Record">
        <StudentForm
          initial={student}
          submitLabel="Save Changes"
          onSubmit={handleEdit}
          onCancel={() => setDialog(null)}
        />
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title="Remove Student?"
        description={`${student.name} will be removed from the directory${student.roomId ? ` and vacated from ${student.roomId}` : ""}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove Student</Button>
          </>
        }
      >
        <p className="text-sm text-[#696B70]">Their complaint timeline remains archived for audits.</p>
      </Dialog>

      {/* Allocate Bed Dialog */}
      <AllocateDialog
        open={dialog === "allocate"}
        onClose={() => setDialog(null)}
        student={student}
      />
    </Page>
  );
}
