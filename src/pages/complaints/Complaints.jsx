import { useMemo, useState } from "react";
import { Clock, Plus, Search, Wrench } from "lucide-react";
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
  Textarea,
  TextInput,
  useToast,
} from "../../components/ui/index.js";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { COMPLAINT_CATEGORIES, PRIORITIES } from "../../data/seed.js";
import { validateComplaint } from "../../lib/validate.js";
import {
  formatDateTime,
  getComplaint,
  getComplaintsByStatus,
  getOpenComplaints,
  getStudent,
  getStudentComplaints,
  timeAgo,
} from "../../data/selectors.js";

const STATUS_TONE = { submitted: "warn", in_progress: "info", resolved: "ok" };
const STATUS_LABEL = { submitted: "Submitted", in_progress: "In Progress", resolved: "Resolved" };
const PRIORITY_TONE = { low: "neutral", medium: "info", high: "clay", urgent: "danger" };

function ComplaintForm({ studentId, onDone }) {
  const { dispatch } = useHaven();
  const pushToast = useToast();
  const [form, setForm] = useState({
    title: "",
    category: COMPLAINT_CATEGORIES[0],
    priority: "medium",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateComplaint(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    dispatch(actions.addComplaint({ ...form, studentId }));
    pushToast("success", "Complaint registered", "The warden's office has been notified and assigned a ticket.");
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Issue Summary" required error={errors.title} hint="A concise title, e.g. 'Leaking sink in bathroom 2B'.">
        <TextInput value={form.title} onChange={set("title")} placeholder="What needs attention?" aria-invalid={!!errors.title} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required error={errors.category}>
          <Select value={form.category} onChange={set("category")}>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority Level" required error={errors.priority}>
          <Select value={form.priority} onChange={set("priority")}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Detailed Description" required error={errors.description} hint="Location details, time observed, and severity.">
        <Textarea
          value={form.description}
          onChange={set("description")}
          rows={4}
          placeholder="Describe the issue with specific context..."
          aria-invalid={!!errors.description}
        />
      </Field>
      <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E8EDF0]">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit">Submit Complaint</Button>
      </div>
    </form>
  );
}

function ComplaintDetail({ complaintId, onClose, allowTriage }) {
  const { state, dispatch } = useHaven();
  const pushToast = useToast();
  const [note, setNote] = useState("");
  const complaint = getComplaint(state.complaints, complaintId);
  if (!complaint) return null;
  const reporter = getStudent(state.students, complaint.studentId);

  const setStatus = (status) => {
    dispatch(actions.updateComplaintStatus(complaint.id, status, note, "Warden"));
    pushToast("success", `Marked as ${STATUS_LABEL[status].toLowerCase()}`, complaint.id);
    setNote("");
  };

  const nextStatuses = {
    submitted: ["in_progress", "resolved"],
    in_progress: ["resolved", "submitted"],
    resolved: ["in_progress"],
  }[complaint.status];

  return (
    <Dialog
      open={!!complaintId}
      onClose={onClose}
      title={complaint.title}
      description={`Ticket ${complaint.id} · Reported ${timeAgo(complaint.createdAt)}`}
      wide
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[complaint.status]} dot>{STATUS_LABEL[complaint.status]}</Badge>
          <Badge tone={PRIORITY_TONE[complaint.priority]}>{complaint.priority.toUpperCase()}</Badge>
          <Badge tone="sand">{complaint.category}</Badge>
        </div>

        <div className="rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#696B70] mb-1">Issue Description</p>
          <p className="text-sm leading-relaxed text-[#17191D]">{complaint.description}</p>
        </div>

        {reporter && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E8EDF0] bg-white">
            <Avatar name={reporter.name} size="sm" />
            <div className="min-w-0 text-xs">
              <span className="font-semibold text-[#17191D]">{reporter.name}</span>
              <span className="text-[#696B70]"> · Room {reporter.roomId || "Unallocated"} · {reporter.course}</span>
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#696B70]">
            <Clock className="size-3.5" aria-hidden="true" /> Ticket Audit Timeline
          </h4>
          <ol className="relative space-y-3.5 pl-1">
            {[...complaint.timeline].reverse().map((t, i) => (
              <li key={i} className="flex gap-3 text-xs items-start">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-[#087CC9]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#17191D] font-medium">
                    <span className="font-bold">{t.by}</span>
                    {t.note && t.note !== "Complaint submitted." && <span> — {t.note}</span>}
                    {t.note === "Complaint submitted." && <span> filed the complaint ticket.</span>}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#696B70]">
                    {formatDateTime(t.at)} · Status: <strong>{STATUS_LABEL[t.status]}</strong>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {allowTriage && (
          <div className="rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] p-4">
            <Field label="Warden Action Note" hint="Optional status note visible to resident.">
              <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Electrician scheduled for inspection at 3:00 PM" />
            </Field>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <Button
                  key={s}
                  variant={s === "resolved" ? "mint" : "primary"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  Mark as {STATUS_LABEL[s]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function ComplaintRow({ complaint, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(complaint.id)}
      className="flex w-full min-w-0 items-center gap-4 rounded-xl border border-[#E8EDF0] bg-white px-4 py-3.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#087CC9]/40 hover:shadow-card cursor-pointer"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F3FC] text-[#087CC9]" aria-hidden="true">
        <Wrench className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-sm text-[#17191D]">{complaint.title}</span>
        <span className="mt-0.5 block text-xs text-[#696B70]">
          {complaint.id} · {complaint.category} · {timeAgo(complaint.createdAt)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2">
        <Badge tone={PRIORITY_TONE[complaint.priority]}>{complaint.priority}</Badge>
        <Badge tone={STATUS_TONE[complaint.status]} dot>{STATUS_LABEL[complaint.status]}</Badge>
      </span>
    </button>
  );
}

function StudentComplaints() {
  const { studentId } = useView();
  const { state } = useHaven();
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const mine = getStudentComplaints(state.complaints, studentId);

  return (
    <>
      <PageHeader
        eyebrow="Resident Portal"
        title="My Maintenance Complaints"
        description="Report issues in your room, common areas, or the mess facility — and track live progress to resolution."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4" aria-hidden="true" /> File New Complaint
          </Button>
        }
      />
      {mine.length === 0 ? (
        <Card>
          <EmptyState
            title="No Active Complaints"
            description="Have a maintenance issue or plumbing problem? File a complaint and the warden team will address it."
            action={<Button onClick={() => setShowForm(true)}>File a Complaint</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {mine.map((c) => (
            <ComplaintRow key={c.id} complaint={c} onOpen={setDetailId} />
          ))}
        </div>
      )}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="File Maintenance Complaint"
        description="Provide details about the issue so the residence maintenance team can respond promptly."
      >
        <ComplaintForm studentId={studentId} onDone={() => setShowForm(false)} />
      </Dialog>
      {detailId && <ComplaintDetail complaintId={detailId} onClose={() => setDetailId(null)} allowTriage={false} />}
    </>
  );
}

function AdminComplaints() {
  const { state } = useHaven();
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState(null);

  const open = getOpenComplaints(state.complaints);
  const counts = {
    submitted: getComplaintsByStatus(state.complaints, "submitted").length,
    in_progress: getComplaintsByStatus(state.complaints, "in_progress").length,
    resolved: getComplaintsByStatus(state.complaints, "resolved").length,
  };

  const list = useMemo(() => {
    let out = [...state.complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (status !== "all") out = out.filter((c) => c.status === status);
    if (priority !== "all") out = out.filter((c) => c.priority === priority);
    if (category !== "all") out = out.filter((c) => c.category === category);
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((c) => [c.title, c.id, c.description].some((v) => v.toLowerCase().includes(q)));
    return out;
  }, [state.complaints, status, priority, category, query]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Complaint Triage"
        description="Comprehensive maintenance and facility issue tracker. Click any ticket to inspect or update status."
      />

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 mb-6">
        <Stat label="Total Open" value={String(open.length)} tone="danger" icon={Wrench} />
        <Stat label="Submitted (New)" value={String(counts.submitted)} tone="brass" />
        <Stat label="In Progress" value={String(counts.in_progress)} tone="pine" />
        <Stat label="Resolved" value={String(counts.resolved)} tone="mint" />
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
            <Field label="Search Complaints">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#696B70]" aria-hidden="true" />
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ticket ID, keyword, description..."
                  className="pl-10"
                  aria-label="Search complaints"
                />
              </div>
            </Field>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted Only</option>
                <option value="in_progress">In Progress Only</option>
                <option value="resolved">Resolved Only</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
                <option value="all">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
                <option value="all">All Categories</option>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <p className="text-xs text-[#696B70] mb-3 px-1" role="status">
        Showing <strong>{list.length}</strong> complaints matching filters
      </p>

      {list.length === 0 ? (
        <Card>
          <EmptyState title="No complaints match filters" description="Try clearing filters or search terms." />
        </Card>
      ) : (
        <div className="grid gap-3">
          {list.map((c) => (
            <ComplaintRow key={c.id} complaint={c} onOpen={setDetailId} />
          ))}
        </div>
      )}

      {detailId && <ComplaintDetail complaintId={detailId} onClose={() => setDetailId(null)} allowTriage />}
    </>
  );
}

export function Complaints() {
  const { role } = useView();
  return <Page>{role === "admin" ? <AdminComplaints /> : <StudentComplaints />}</Page>;
}
