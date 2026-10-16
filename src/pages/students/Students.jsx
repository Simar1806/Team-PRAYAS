import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { Page, PageHeader } from "../../components/layout/index.js";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Dialog,
  EmptyState,
  Field,
  Select,
  Stat,
  TextInput,
  useToast,
} from "../../components/ui/index.js";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { getUnallocatedStudents, searchStudents } from "../../data/selectors.js";
import { StudentForm } from "./StudentForm.jsx";

const SORTS = {
  name: { label: "Name A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
  year: { label: "Year, then name", fn: (a, b) => a.year - b.year || a.name.localeCompare(b.name) },
  room: {
    label: "Room & Bed",
    fn: (a, b) =>
      (a.block ?? "Z").localeCompare(b.block ?? "Z") ||
      (a.roomId ?? "Z").localeCompare(b.roomId ?? "Z") ||
      (a.bed ?? 99) - (b.bed ?? 99),
  },
};

function RoomCell({ student }) {
  if (!student.roomId) return <Badge tone="warn">Unallocated</Badge>;
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-[#17191D]">
      <span className="text-[#0866A8]">{student.roomId}</span>
      <span className="text-xs font-normal text-[#696B70]">· Bed {student.bed}</span>
    </span>
  );
}

export function Students() {
  const { state, dispatch } = useHaven();
  const pushToast = useToast();
  const [query, setQuery] = useState("");
  const [block, setBlock] = useState("all");
  const [year, setYear] = useState("all");
  const [alloc, setAlloc] = useState("all");
  const [sort, setSort] = useState("name");
  const [dialog, setDialog] = useState(null); // {mode:'add'} | {mode:'edit',student} | {mode:'delete',student}

  const list = useMemo(() => {
    let out = searchStudents(state.students, query);
    if (block !== "all") out = out.filter((s) => s.block === block);
    if (year !== "all") out = out.filter((s) => String(s.year) === year);
    if (alloc === "allocated") out = out.filter((s) => s.roomId);
    if (alloc === "unallocated") out = out.filter((s) => !s.roomId);
    return [...out].sort(SORTS[sort].fn);
  }, [state.students, query, block, year, alloc, sort]);

  const unallocatedCount = getUnallocatedStudents(state.students).length;
  const allocatedCount = state.students.length - unallocatedCount;

  const closeDialog = () => setDialog(null);

  const handleAdd = (data) => {
    dispatch(actions.addStudent(data));
    closeDialog();
    pushToast("success", "Student registered", `${data.name} was added to the directory. Assign a bed under Rooms.`);
  };

  const handleEdit = (data) => {
    dispatch(actions.updateStudent(dialog.student.id, data));
    closeDialog();
    pushToast("success", "Student record updated", data.name);
  };

  const handleDelete = () => {
    dispatch(actions.removeStudent(dialog.student.id));
    closeDialog();
    pushToast("success", "Student removed", `${dialog.student.name} is no longer in the directory.`);
  };

  const clearFilters = () => {
    setQuery("");
    setBlock("all");
    setYear("all");
    setAlloc("all");
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Administration"
        title="Student Directory"
        description={`${state.students.length} residents on record. Search, filter by block/year, and manage profiles.`}
        actions={
          <Button onClick={() => setDialog({ mode: "add" })}>
            <Plus className="size-4" aria-hidden="true" /> Add Student
          </Button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3.5 sm:gap-4 mb-6">
        <Stat
          label="Total Residents"
          value={String(state.students.length)}
          icon={Users}
          tone="pine"
        />
        <Stat
          label="Allocated Beds"
          value={String(allocatedCount)}
          tone="mint"
        />
        <Stat
          label="Awaiting Bed"
          value={String(unallocatedCount)}
          tone={unallocatedCount > 0 ? "brass" : "mint"}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
            <Field label="Search Directory">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#696B70]" aria-hidden="true" />
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, ID, course, room..."
                  className="pl-10"
                  aria-label="Search students"
                />
              </div>
            </Field>
            <Field label="Residence Block">
              <Select value={block} onChange={(e) => setBlock(e.target.value)} aria-label="Filter by block">
                <option value="all">All Blocks</option>
                {["A", "B", "C", "D"].map((b) => (
                  <option key={b} value={b}>Block {b}</option>
                ))}
              </Select>
            </Field>
            <Field label="Academic Year">
              <Select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year">
                <option value="all">All Years</option>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </Select>
            </Field>
            <Field label="Bed Status">
              <Select value={alloc} onChange={(e) => setAlloc(e.target.value)} aria-label="Filter by allocation">
                <option value="all">All Statuses</option>
                <option value="allocated">Allocated Only</option>
                <option value="unallocated">Unallocated Only</option>
              </Select>
            </Field>
            <Field label="Sort Order">
              <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort students">
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between mb-3 text-xs text-[#696B70] px-1">
        <span>Showing <strong>{list.length}</strong> of {state.students.length} students</span>
        {(query || block !== "all" || year !== "all" || alloc !== "all") && (
          <button
            onClick={clearFilters}
            className="font-semibold text-[#087CC9] hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            title="No matching student records"
            description="Try modifying your search term or adjusting filter options."
            action={<Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>}
          />
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="data-surface hidden overflow-hidden md:block shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8EDF0] bg-[#F3FAFC] text-[11px] font-bold uppercase tracking-[0.14em] text-[#696B70]">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Course</th>
                    <th className="px-5 py-3.5">Year</th>
                    <th className="px-5 py-3.5">Room & Bed</th>
                    <th className="px-5 py-3.5">Contact Phone</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF0]/70">
                  {list.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-[#F8FCFE]">
                      <td className="px-5 py-3.5">
                        <Link to={`/students/${s.id}`} className="flex items-center gap-3 group">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <span className="block font-semibold text-[#17191D] group-hover:text-[#087CC9] transition-colors">
                              {s.name}
                            </span>
                            <span className="block text-xs text-[#696B70]">{s.id}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[#52555B]">{s.course}</td>
                      <td className="px-5 py-3.5 text-[#52555B]">Year {s.year}</td>
                      <td className="px-5 py-3.5"><RoomCell student={s} /></td>
                      <td className="px-5 py-3.5 text-[#696B70]">{s.phone || "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/students/${s.id}`}
                            aria-label={`View ${s.name}`}
                            className="rounded-lg p-2 text-[#696B70] transition-colors hover:bg-[#E6F3FC] hover:text-[#087CC9]"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => setDialog({ mode: "edit", student: s })}
                            aria-label={`Edit ${s.name}`}
                            className="rounded-lg p-2 text-[#696B70] transition-colors hover:bg-[#E6F3FC] hover:text-[#087CC9]"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setDialog({ mode: "delete", student: s })}
                            aria-label={`Remove ${s.name}`}
                            className="rounded-lg p-2 text-[#696B70] transition-colors hover:bg-[#FDE8E8] hover:text-[#B43B3B]"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="grid gap-3 md:hidden">
            {list.map((s) => (
              <Card key={s.id} hoverable>
                <CardBody className="flex items-center gap-3.5 p-4">
                  <Avatar name={s.name} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/students/${s.id}`} className="block truncate font-semibold text-[#17191D] hover:underline">
                      {s.name}
                    </Link>
                    <p className="truncate text-xs text-[#696B70]">
                      {s.course} · Year {s.year}
                    </p>
                    <p className="mt-1 text-xs">
                      <RoomCell student={s} />
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Link
                      to={`/students/${s.id}`}
                      aria-label={`View ${s.name}`}
                      className="rounded-lg p-2 text-[#696B70] hover:bg-[#E6F3FC] hover:text-[#087CC9]"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => setDialog({ mode: "edit", student: s })}
                      aria-label={`Edit ${s.name}`}
                      className="rounded-lg p-2 text-[#696B70] hover:bg-[#E6F3FC] hover:text-[#087CC9]"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setDialog({ mode: "delete", student: s })}
                      aria-label={`Remove ${s.name}`}
                      className="rounded-lg p-2 text-[#696B70] hover:bg-[#FDE8E8] hover:text-[#B43B3B]"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialog?.mode === "add" || dialog?.mode === "edit"}
        onClose={closeDialog}
        title={dialog?.mode === "add" ? "Register New Student" : "Edit Student Information"}
        description={
          dialog?.mode === "add"
            ? "New residents register in the unallocated pool. You can allocate a bed immediately under Rooms."
            : undefined
        }
      >
        {dialog && (
          <StudentForm
            key={dialog.mode + (dialog.student?.id ?? "new")}
            initial={dialog.mode === "edit" ? dialog.student : undefined}
            submitLabel={dialog.mode === "add" ? "Register Student" : "Save Changes"}
            onSubmit={dialog.mode === "add" ? handleAdd : handleEdit}
            onCancel={closeDialog}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialog?.mode === "delete"}
        onClose={closeDialog}
        title="Remove Student Record?"
        description={`${dialog?.student?.name ?? ""} will be removed from the hostel directory${
          dialog?.student?.roomId ? ` and vacated from ${dialog.student.roomId}` : ""
        }.`}
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Confirm Removal</Button>
          </>
        }
      >
        <p className="text-sm text-[#696B70]">
          Their complaint timeline remains archived for hostel audits; only the active student directory profile is deleted.
        </p>
      </Dialog>
    </Page>
  );
}
