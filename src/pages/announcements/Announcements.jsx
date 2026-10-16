import { useState } from "react";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { Page, PageHeader } from "../../components/layout/index.js";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Dialog,
  EmptyState,
  Field,
  Select,
  Textarea,
  TextInput,
  useToast,
} from "../../components/ui/index.js";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { validateAnnouncement } from "../../lib/validate.js";
import { getSortedAnnouncements, timeAgo } from "../../data/selectors.js";

const CATEGORIES = ["General", "Maintenance", "Admin", "Events", "Mess"];
const PRIORITY_TONE = { urgent: "danger", high: "clay", normal: "sand" };

function AnnouncementForm({ onDone }) {
  const { dispatch } = useHaven();
  const pushToast = useToast();
  const [form, setForm] = useState({ title: "", body: "", category: "General", priority: "normal" });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateAnnouncement(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    dispatch(actions.addAnnouncement(form));
    pushToast("success", "Notice broadcasted", "All residents can now view this announcement.");
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Announcement Title" required error={errors.title} hint="Clear, concise headline.">
        <TextInput
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Scheduled power maintenance on Saturday"
          aria-invalid={!!errors.title}
        />
      </Field>
      <Field label="Notice Details" required error={errors.body} hint="What residents need to know or action required.">
        <Textarea
          value={form.body}
          onChange={set("body")}
          rows={4}
          placeholder="Provide complete details, dates, and instructions..."
          aria-invalid={!!errors.body}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <Select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority Level" hint="Urgent pins this notice at the top of all feeds.">
          <Select value={form.priority} onChange={set("priority")}>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent (Pinned Top)</option>
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E8EDF0]">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit">Publish Notice</Button>
      </div>
    </form>
  );
}

export function Announcements() {
  const { role } = useView();
  const { state, dispatch } = useHaven();
  const pushToast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const isAdmin = role === "admin";
  const list = getSortedAnnouncements(state.announcements);

  const handleDelete = () => {
    dispatch(actions.deleteAnnouncement(deleting.id));
    pushToast("success", "Notice removed", deleting.title);
    setDeleting(null);
  };

  return (
    <Page>
      <PageHeader
        eyebrow={isAdmin ? "Administration" : "Resident Portal"}
        title="Hostel Announcements"
        description="Official notices and circulars from the chief warden's office. Urgent notices remain pinned to the top."
        actions={
          isAdmin ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="size-4" aria-hidden="true" /> Post Announcement
            </Button>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <Card>
          <EmptyState title="No active notices" description="The official residence notice board is currently clear." />
        </Card>
      ) : (
        <div className="grid gap-4">
          {list.map((a) => {
            const isUrgent = a.priority === "urgent";
            return (
              <Card
                key={a.id}
                hoverable
                className={
                  isUrgent
                    ? "border-[#B43B3B]/40 bg-[#FEF4F4]/50 ring-1 ring-[#B43B3B]/20"
                    : undefined
                }
              >
                <CardBody className="p-5">
                  <div className="flex items-start gap-4">
                    <span
                      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        isUrgent
                          ? "bg-[#FDE8E8] text-[#B43B3B] ring-1 ring-[#B43B3B]/25"
                          : "bg-[#E6F3FC] text-[#087CC9] ring-1 ring-[#087CC9]/20"
                      }`}
                      aria-hidden="true"
                    >
                      {isUrgent ? <Pin className="size-5" /> : <Megaphone className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#17191D]">
                          {a.title}
                        </h3>
                        {isUrgent && <Badge tone="danger" dot>Urgent Notice</Badge>}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#383B40]">
                        {a.body}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#696B70]">
                        <Badge tone="sand">{a.category}</Badge>
                        {a.priority !== "urgent" && a.priority !== "normal" && (
                          <Badge tone={PRIORITY_TONE[a.priority] ?? "sand"}>{a.priority}</Badge>
                        )}
                        <span>·</span>
                        <span>Published {timeAgo(a.publishedAt)}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setDeleting(a)}
                        aria-label={`Delete announcement: ${a.title}`}
                        className="shrink-0 rounded-lg p-2 text-[#696B70] transition-colors hover:bg-[#FDE8E8] hover:text-[#B43B3B] cursor-pointer"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Notice Dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Post New Announcement"
        description="Broadcast an official notice to all student and staff dashboards."
      >
        <AnnouncementForm onDone={() => setShowForm(false)} />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Remove Announcement?"
        description={`'${deleting?.title ?? ""}' will be removed from all resident boards.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Confirm Delete</Button>
          </>
        }
      >
        <p className="text-sm text-[#696B70]">This notice will no longer be visible to residents or staff.</p>
      </Dialog>
    </Page>
  );
}
