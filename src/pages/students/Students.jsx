import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, IdCard, Pencil, Search, Trash2, Users } from "lucide-react";
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
import { academicLine, getUnallocatedStudents, searchStudents } from "../../data/selectors.js";
import { useView } from "../../state/demo.jsx";
import { StudentForm } from "./StudentForm.jsx";

const SORTS = {
  name: { label: "Name A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
  year: { label: "Year, then name", fn: (a, b) => (a.year ?? 9) - (b.year ?? 9) || a.name.localeCompare(b.name) },
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
    <span className="inline-flex items-center gap-1.5 font-semibold text-[#24221F]">
      <span className="text-[#2F4785]">{student.roomId}</span>
      <span className="text-xs font-normal text-[#6F6A62]">· Bed {student.bed}</span>
    </span>
  );
}

export function Students() {
  const { state, dispatch } = useHaven();
  const { canManageAccounts } = useView();
  const pushToast = useToast();
  const [query, setQuery] = useState("");
  const [block, setBlock] = useState("all");
  const [year, setYear] = useState("all");
  const [alloc, setAlloc] = useState("all");
  const [sort, setSort] = useState("name");
  const [dialog, setDialog] = useState(null); // {mode:'edit',student} | {mode:'delete',student}

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

  const handleEdit = (data) => {
    dispatch(actions.updateStudent(dialog.student.id, data));
    closeDialog();
    pushToast("success", "Student record updated", data.name);
  };

  const handleDelete = () => {
    dispatch(actions.removeStudent(dialog.student.id));
    closeDialog();
    pushToast("success", "Student removed", `${dialog.student.name} and login ID ${dialog.student.studentCode} were deleted.`);
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
        description={`${state.students.length} residents on record. Students join the directory only when the hostel office issues their student ID.`}
        actions={
          canManageAccounts && (
            <Link
              to="/accounts?issue=student"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#3E5BA9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2F4785]"
            >
              <IdCard className="size-4" aria-hidden="true" /> Issue Student ID
            </Link>
          )
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
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6F6A62]" aria-hidden="true" />
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

      <div className="flex items-center justify-between mb-3 text-xs text-[#6F6A62] px-1">
        <span>Showing <strong>{list.length}</strong> of {state.students.length} students</span>
        {(query || block !== "all" || year !== "all" || alloc !== "all") && (
          <button
            onClick={clearFilters}
            className="font-semibold text-[#3E5BA9] hover:underline cursor-pointer"
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
                  <tr className="border-b border-[#E8E2D7] bg-[#F7F4EE] text-[13px] font-medium text-[#6F6A62]">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Student ID</th>
                    <th className="px-5 py-3.5">Course & Year</th>
                    <th className="px-5 py-3.5">Room & Bed</th>
                    <th className="px-5 py-3.5">Contact Phone</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D7]/70">
                  {list.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-[#FAF8F3]">
                      <td className="px-5 py-3.5">
                        <Link to={`/students/${s.id}`} className="flex items-center gap-3 group">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <span className="block font-semibold text-[#24221F] group-hover:text-[#3E5BA9] transition-colors">
                              {s.name}
                            </span>
                            {!s.profileComplete && (
                              <span className="mt-0.5 block text-xs font-medium text-[#87600F]">Awaiting first sign-in</span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[13px] text-[#2F4785]">{s.studentCode}</td>
                      <td className="px-5 py-3.5 text-[#58534B]">{academicLine(s)}</td>
                      <td className="px-5 py-3.5"><RoomCell student={s} /></td>
                      <td className="px-5 py-3.5 text-[#6F6A62]">{s.phone || "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/students/${s.id}`}
                            aria-label={`View ${s.name}`}
                            className="rounded-lg p-2 text-[#6F6A62] transition-colors hover:bg-[#ECEFF8] hover:text-[#3E5BA9]"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => setDialog({ mode: "edit", student: s })}
                            aria-label={`Edit ${s.name}`}
                            className="rounded-lg p-2 text-[#6F6A62] transition-colors hover:bg-[#ECEFF8] hover:text-[#3E5BA9]"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </button>
                          {canManageAccounts && (
                            <button
                              onClick={() => setDialog({ mode: "delete", student: s })}
                              aria-label={`Remove ${s.name}`}
                              className="rounded-lg p-2 text-[#6F6A62] transition-colors hover:bg-[#FBEAE6] hover:text-[#B5483B]"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          )}
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
                    <Link to={`/students/${s.id}`} className="block truncate font-semibold text-[#24221F] hover:underline">
                      {s.name}
                    </Link>
                    <p className="truncate text-xs text-[#6F6A62]">
                      <span className="font-mono text-[#2F4785]">{s.studentCode}</span> · {academicLine(s)}
                    </p>
                    <p className="mt-1 text-xs">
                      <RoomCell student={s} />
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Link
                      to={`/students/${s.id}`}
                      aria-label={`View ${s.name}`}
                      className="rounded-lg p-2 text-[#6F6A62] hover:bg-[#ECEFF8] hover:text-[#3E5BA9]"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => setDialog({ mode: "edit", student: s })}
                      aria-label={`Edit ${s.name}`}
                      className="rounded-lg p-2 text-[#6F6A62] hover:bg-[#ECEFF8] hover:text-[#3E5BA9]"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    {canManageAccounts && (
                      <button
                        onClick={() => setDialog({ mode: "delete", student: s })}
                        aria-label={`Remove ${s.name}`}
                        className="rounded-lg p-2 text-[#6F6A62] hover:bg-[#FBEAE6] hover:text-[#B5483B]"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={dialog?.mode === "edit"}
        onClose={closeDialog}
        title="Edit Student Information"
        description={dialog?.student ? `Student ID ${dialog.student.studentCode}` : undefined}
      >
        {dialog?.mode === "edit" && (
          <StudentForm
            key={dialog.student.id}
            initial={dialog.student}
            submitLabel="Save Changes"
            onSubmit={handleEdit}
            onCancel={closeDialog}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialog?.mode === "delete"}
        onClose={closeDialog}
        title="Delete student and login ID?"
        description={`${dialog?.student?.name ?? ""} will be removed from the directory${
          dialog?.student?.roomId ? `, vacated from ${dialog.student.roomId},` : ""
        } and student ID ${dialog?.student?.studentCode ?? ""} will stop working.`}
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Confirm Removal</Button>
          </>
        }
      >
        <p className="text-sm text-[#6F6A62]">
          This deletes their profile details and their login. Complaints they filed stay archived for hostel audits.
        </p>
      </Dialog>
    </Page>
  );
}
