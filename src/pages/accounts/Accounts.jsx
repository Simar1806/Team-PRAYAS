import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  GraduationCap,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Page, PageHeader } from "../../components/layout/index.js";
import {
  Avatar,
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
import { useAuth } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";

function generateRandomPassword(prefix = "Haven") {
  const digits = Math.floor(100 + Math.random() * 900);
  const chars = ["!", "@", "#", "$", "*"];
  const symbol = chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${symbol}${digits}`;
}

export function Accounts() {
  const { user: currentUser } = useAuth();
  const { state, dispatch } = useHaven();
  const pushToast = useToast();

  const accounts = state.accounts;

  // Filter & Search states
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state: null | { type: 'create' } | { type: 'reset', account } | { type: 'status', account } | { type: 'delete', account }
  const [modal, setModal] = useState(null);

  // Form states for Create Account
  const [newRole, setNewRole] = useState("student");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("Student@123");
  const [formError, setFormError] = useState("");

  // Form states for Reset Password
  const [resetPassword, setResetPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Existing students that do not yet have an account
  const unlinkedStudents = useMemo(() => {
    const existingStudentIds = new Set(
      accounts.filter((a) => a.studentId).map((a) => a.studentId),
    );
    return state.students.filter((s) => !existingStudentIds.has(s.id));
  }, [state.students, accounts]);

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    let list = accounts;

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.username.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.studentId && a.studentId.toLowerCase().includes(q)),
      );
    }

    if (roleFilter !== "all") {
      list = list.filter((a) => a.role === roleFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((a) => (a.status || "active") === statusFilter);
    }

    return list;
  }, [accounts, query, roleFilter, statusFilter]);

  // Statistics
  const totalCount = accounts.length;
  const studentCount = accounts.filter((a) => a.role === "student").length;
  const adminCount = accounts.filter((a) => a.role === "admin").length;
  const activeCount = accounts.filter((a) => (a.status || "active") === "active").length;

  const openCreateModal = () => {
    setNewRole("student");
    setSelectedStudentId("");
    setNewName("");
    setNewUsername("");
    setNewPassword("Student@123");
    setFormError("");
    setModal({ type: "create" });
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    if (!studentId) return;
    const student = state.students.find((s) => s.id === studentId);
    if (student) {
      setNewName(student.name);
      setNewUsername(student.id);
    }
  };

  const handleCreateSubmit = (e) => {
    e?.preventDefault();
    setFormError("");

    const trimmedUser = newUsername.trim();
    const trimmedName = newName.trim();

    if (!trimmedUser) {
      setFormError("Username is required.");
      return;
    }
    if (!trimmedName) {
      setFormError("Full Name is required.");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setFormError("Password must be at least 4 characters.");
      return;
    }

    // Check duplicate username
    const exists = accounts.some(
      (a) => a.username.toLowerCase() === trimmedUser.toLowerCase(),
    );
    if (exists) {
      setFormError(`An account with username "${trimmedUser}" already exists.`);
      return;
    }

    dispatch(
      actions.addAccount({
        username: trimmedUser,
        name: trimmedName,
        password: newPassword,
        role: newRole,
        studentId: newRole === "student" ? selectedStudentId || null : null,
        status: "active",
      }),
    );

    setModal(null);
    pushToast("success", "Account provisioned", `Account for ${trimmedName} (${trimmedUser}) is now active.`);
  };

  const openResetModal = (account) => {
    const generated = generateRandomPassword(account.role === "student" ? "Haven" : "Admin");
    setResetPassword(generated);
    setCopied(false);
    setModal({ type: "reset", account });
  };

  const handleResetSubmit = (e) => {
    e?.preventDefault();
    if (!resetPassword) return;

    dispatch(actions.resetAccountPassword(modal.account.id, resetPassword));
    const targetName = modal.account.name;
    const targetUser = modal.account.username;
    setModal(null);
    pushToast("success", "Password updated", `Password for ${targetName} (@${targetUser}) has been reset.`);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(resetPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openStatusModal = (account) => {
    setModal({ type: "status", account });
  };

  const handleStatusToggle = () => {
    const current = modal.account.status || "active";
    const nextStatus = current === "active" ? "deactivated" : "active";
    dispatch(actions.updateAccountStatus(modal.account.id, nextStatus));
    const targetName = modal.account.name;
    setModal(null);
    pushToast(
      "success",
      nextStatus === "active" ? "Account reactivated" : "Account deactivated",
      `${targetName}'s account is now ${nextStatus}.`,
    );
  };

  const openDeleteModal = (account) => {
    setModal({ type: "delete", account });
  };

  const handleDeleteSubmit = () => {
    dispatch(actions.removeAccount(modal.account.id));
    const targetName = modal.account.name;
    setModal(null);
    pushToast("success", "Account deleted", `${targetName}'s login account was removed.`);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Access Control"
        title="Account Management"
        description="Provision resident credentials, manage administrative accounts, reset passwords, and monitor system access."
        actions={
          <Button variant="primary" onClick={openCreateModal} className="shadow-xs">
            <Plus className="size-4" />
            Provision Account
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
        <Stat
          label="Total Accounts"
          value={totalCount}
          helper="Registered in system"
          tone="default"
        />
        <Stat
          label="Student Logins"
          value={studentCount}
          helper="Resident portal access"
          tone="info"
        />
        <Stat
          label="Admin Staff"
          value={adminCount}
          helper="Warden console access"
          tone="warn"
        />
        <Stat
          label="Active Accounts"
          value={activeCount}
          helper="Permitted to sign in"
          tone="success"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardBody className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-12">
            {/* Search Input */}
            <div className="sm:col-span-3 lg:col-span-6 relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#696B70]">
                <Search className="size-4" />
              </span>
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, username, or student ID..."
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <div className="sm:col-span-1 lg:col-span-3">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter by role"
              >
                <option value="all">All Roles</option>
                <option value="student">Resident Students</option>
                <option value="admin">Administrators</option>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-1 lg:col-span-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="deactivated">Deactivated Only</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Accounts Directory Table */}
      <Card>
        {filteredAccounts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No accounts match your criteria"
            description="Try clearing search filters or provision a new user account."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8EDF0] bg-[#F3FAFC]/75 text-[11px] font-bold tracking-[0.08em] text-[#696B70] uppercase">
                  <th className="py-3.5 pl-6 pr-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Created</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF0]">
                {filteredAccounts.map((account) => {
                  const isActive = (account.status || "active") === "active";
                  const isMasterAdmin = account.username === "admin";
                  const isCurrent = currentUser?.id === account.id || currentUser?.username === account.username;

                  return (
                    <tr
                      key={account.id}
                      className="group transition-colors hover:bg-[#F3FAFC]/60"
                    >
                      {/* User Info */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={account.name} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#17191D]">
                                {account.name}
                              </span>
                              {isCurrent && (
                                <span className="rounded-full bg-[#E6F3FC] px-2 py-0.5 text-[10px] font-bold text-[#087CC9]">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-[#0866A8] font-medium">
                                @{account.username}
                              </span>
                              {account.studentId && (
                                <span className="text-[11px] text-[#696B70]">
                                  · ID: {account.studentId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {account.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#087CC9]/20 bg-[#E6F3FC] px-2.5 py-1 text-xs font-semibold text-[#0866A8]">
                            <ShieldCheck className="size-3.5" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#EDE5F7] bg-[#FAF8FE] px-2.5 py-1 text-xs font-semibold text-[#5B3E8C]">
                            <GraduationCap className="size-3.5" />
                            Resident Student
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F6ED] px-2.5 py-1 text-xs font-semibold text-[#16865A]">
                            <span className="size-1.5 rounded-full bg-[#16865A]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F2] px-2.5 py-1 text-xs font-semibold text-[#B43B3B]">
                            <span className="size-1.5 rounded-full bg-[#B43B3B]" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 hidden md:table-cell text-xs text-[#696B70]">
                        {account.createdAt ? account.createdAt.slice(0, 10) : "2026-10-01"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => openResetModal(account)}
                            title="Reset Password"
                            aria-label={`Reset password for ${account.name}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E8EDF0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#17191D] hover:bg-[#F3FAFC] hover:text-[#087CC9] hover:border-[#087CC9]/30 transition-all cursor-pointer shadow-2xs"
                          >
                            <KeyRound className="size-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                          </button>

                          {/* Toggle Status (Active / Deactivated) */}
                          <button
                            type="button"
                            onClick={() => openStatusModal(account)}
                            disabled={isMasterAdmin || isCurrent}
                            title={
                              isMasterAdmin
                                ? "Primary admin account cannot be deactivated"
                                : isCurrent
                                  ? "Cannot deactivate your own current session"
                                  : isActive
                                    ? "Deactivate account"
                                    : "Reactivate account"
                            }
                            aria-label={`${isActive ? "Deactivate" : "Activate"} account for ${account.name}`}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all shadow-2xs ${
                              isMasterAdmin || isCurrent
                                ? "cursor-not-allowed border-[#E8EDF0] bg-[#F3FAFC] text-[#696B70]/40"
                                : isActive
                                  ? "cursor-pointer border-[#E8EDF0] bg-white text-[#B43B3B] hover:bg-[#FDF2F2] hover:border-[#B43B3B]/30"
                                  : "cursor-pointer border-[#E8EDF0] bg-white text-[#16865A] hover:bg-[#E2F6ED] hover:border-[#16865A]/30"
                            }`}
                          >
                            {isActive ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                            <span className="hidden sm:inline">
                              {isActive ? "Deactivate" : "Activate"}
                            </span>
                          </button>

                          {/* Delete Account */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(account)}
                            disabled={isMasterAdmin || isCurrent}
                            title={
                              isMasterAdmin
                                ? "Primary admin cannot be deleted"
                                : isCurrent
                                  ? "Cannot delete current session"
                                  : "Delete account"
                            }
                            aria-label={`Delete account for ${account.name}`}
                            className={`p-1.5 rounded-lg border border-[#E8EDF0] text-[#696B70] transition-colors shadow-2xs ${
                              isMasterAdmin || isCurrent
                                ? "cursor-not-allowed opacity-30 bg-[#F3FAFC]"
                                : "cursor-pointer hover:bg-[#FDF2F2] hover:text-[#B43B3B] hover:border-[#B43B3B]/30"
                            }`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* DIALOG 1: CREATE ACCOUNT */}
      <Dialog
        open={modal?.type === "create"}
        onClose={() => setModal(null)}
        title="Provision User Account"
        description="Create credentials for a student resident or administrative staff member."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-[#B43B3B]/20 bg-[#FDF2F2] p-3 text-xs text-[#B43B3B] font-medium leading-relaxed">
              {formError}
            </div>
          )}

          {/* Role selector */}
          <Field label="Account Role" required>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewRole("student");
                  setNewPassword("Student@123");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                  newRole === "student"
                    ? "border-[#087CC9] bg-[#E6F3FC] text-[#0866A8]"
                    : "border-[#E8EDF0] bg-white text-[#696B70] hover:bg-[#F3FAFC]"
                }`}
              >
                <GraduationCap className="size-4" />
                Resident Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewRole("admin");
                  setSelectedStudentId("");
                  setNewPassword("Admin@123");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                  newRole === "admin"
                    ? "border-[#087CC9] bg-[#E6F3FC] text-[#0866A8]"
                    : "border-[#E8EDF0] bg-white text-[#696B70] hover:bg-[#F3FAFC]"
                }`}
              >
                <ShieldCheck className="size-4" />
                Administrator
              </button>
            </div>
          </Field>

          {/* If Student, optional selector from existing hostel directory */}
          {newRole === "student" && (
            <Field
              label="Select Resident from Hostel Directory"
              hint="Autofills resident name and ID, or enter custom details below."
            >
              <Select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
              >
                <option value="">-- Choose student or type manually --</option>
                {unlinkedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) · Room {s.roomId || "Unassigned"}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {/* Full Name */}
          <Field label="Full Name" required>
            <TextInput
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
            />
          </Field>

          {/* Username */}
          <Field
            label="Username / Student ID"
            required
            hint="Unique identifier used for signing into the portal."
          >
            <TextInput
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. STU2026005 or warden.john"
            />
          </Field>

          {/* Initial Password */}
          <Field label="Initial Password" required>
            <div className="flex gap-2">
              <TextInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set password"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setNewPassword(generateRandomPassword(newRole === "student" ? "Haven" : "Admin"))}
                title="Generate Random Password"
              >
                <RefreshCw className="size-3.5" />
                Generate
              </Button>
            </div>
          </Field>
        </form>
      </Dialog>

      {/* DIALOG 2: RESET PASSWORD */}
      <Dialog
        open={modal?.type === "reset"}
        onClose={() => setModal(null)}
        title="Reset Password"
        description={`Set a new temporary password for ${modal?.account?.name} (@${modal?.account?.username}).`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResetSubmit}>
              Apply New Password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] p-3 text-xs text-[#696B70]">
            The user will be required to sign in using this new password immediately.
          </div>

          <Field label="New Password" required>
            <div className="flex gap-2">
              <TextInput
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setResetPassword(generateRandomPassword(modal?.account?.role === "student" ? "Haven" : "Admin"))}
                title="Generate New Random Password"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyPassword}
                title="Copy Password"
              >
                {copied ? <Check className="size-3.5 text-[#16865A]" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </Field>
        </div>
      </Dialog>

      {/* DIALOG 3: STATUS TOGGLE */}
      <Dialog
        open={modal?.type === "status"}
        onClose={() => setModal(null)}
        title={
          modal?.account?.status === "deactivated"
            ? `Reactivate ${modal?.account?.name}?`
            : `Deactivate ${modal?.account?.name}?`
        }
        description={
          modal?.account?.status === "deactivated"
            ? "Reactivating this account will immediately allow the user to log in."
            : "Deactivating this account will terminate active sessions and block the user from signing in."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              variant={modal?.account?.status === "deactivated" ? "primary" : "danger"}
              onClick={handleStatusToggle}
            >
              {modal?.account?.status === "deactivated" ? "Reactivate Account" : "Deactivate Account"}
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#696B70] leading-relaxed">
          {modal?.account?.status === "deactivated"
            ? "The user will retain all existing hostel data, room assignments, and history upon reactivation."
            : "The account credentials will be kept on file, but login attempts will be rejected with an administrative deactivation notice."}
        </p>
      </Dialog>

      {/* DIALOG 4: DELETE ACCOUNT */}
      <Dialog
        open={modal?.type === "delete"}
        onClose={() => setModal(null)}
        title={`Delete Account (@${modal?.account?.username})?`}
        description={`Are you sure you want to permanently delete the login credentials for ${modal?.account?.name}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteSubmit}>
              Delete Account
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#696B70] leading-relaxed">
          This removes the user authentication profile from the system. If this is a student resident, their student record and room allocation will remain intact in the hostel directory.
        </p>
      </Dialog>
    </Page>
  );
}
