import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Check,
  Copy,
  Crown,
  GraduationCap,
  Lock,
  Unlock,
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
import { actions, nextStudentCode } from "../../store/reducer.js";
import { DEFAULT_STUDENT_PASSWORD } from "../../data/seed.js";

const PAGE_SIZE = 25;

function generateRandomPassword(prefix = "Haven") {
  const digits = Math.floor(100 + Math.random() * 900);
  const chars = ["!", "@", "#", "$", "*"];
  const symbol = chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${symbol}${digits}`;
}

export function Accounts() {
  const { user: currentUser, isChief } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
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
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState(DEFAULT_STUDENT_PASSWORD);
  const [newCanManage, setNewCanManage] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states for Reset Password
  const [resetPassword, setResetPassword] = useState("");
  const [copied, setCopied] = useState(false);

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

    if (roleFilter === "chief") return list.filter((a) => a.isChief);

    if (roleFilter !== "all" && roleFilter !== "chief") {
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
  const pendingProfiles = state.students.filter((st) => !st.profileComplete).length;
  const studentById = useMemo(() => new Map(state.students.map((st) => [st.id, st])), [state.students]);

  // Reset the visible window whenever the filters change.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, roleFilter, statusFilter]);

  const openCreateModal = (role = "student") => {
    const asRole = isChief ? role : "student";
    setNewRole(asRole);
    setNewName("");
    setNewUsername(asRole === "student" ? nextStudentCode(state) : "");
    setNewPassword(asRole === "student" ? DEFAULT_STUDENT_PASSWORD : "Admin@123");
    setNewCanManage(false);
    setFormError("");
    setModal({ type: "create" });
  };

  // Deep link from the Students page: /accounts?issue=student
  useEffect(() => {
    if (searchParams.get("issue") === "student") {
      openCreateModal("student");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const switchRole = (role) => {
    setNewRole(role);
    setFormError("");
    if (role === "student") {
      setNewUsername(nextStudentCode(state));
      setNewPassword(DEFAULT_STUDENT_PASSWORD);
    } else {
      setNewUsername("");
      setNewPassword("Admin@123");
    }
  };

  const handleCreateSubmit = (e) => {
    e?.preventDefault();
    setFormError("");

    const trimmedUser = newUsername.trim();
    const trimmedName = newName.trim();

    if (!trimmedUser) {
      setFormError(newRole === "student" ? "Student ID is required." : "Username is required.");
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
        canManageAccounts: newRole === "admin" && newCanManage,
        status: "active",
      }),
    );

    setModal(null);
    pushToast(
      "success",
      newRole === "student" ? "Student ID issued" : "Administrator added",
      newRole === "student"
        ? `${trimmedName} (${trimmedUser}) is now in the Student Directory and will complete their profile at first sign-in.`
        : `${trimmedName} (@${trimmedUser}) can now sign in${newCanManage ? " with Accounts access" : ""}.`,
    );
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
    const { name: targetName, role } = modal.account;
    setModal(null);
    pushToast(
      "success",
      role === "student" ? "Student deleted" : "Account deleted",
      role === "student"
        ? `${targetName}'s student ID and directory record were removed.`
        : `${targetName}'s login account was removed.`,
    );
  };

  const handlePermissionToggle = (account) => {
    const next = !account.canManageAccounts;
    dispatch(actions.setAccountPermission(account.id, next));
    pushToast(
      "success",
      next ? "Access granted" : "Access removed",
      `${account.name} ${next ? "can now" : "can no longer"} manage accounts and student IDs.`,
    );
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Access Control"
        title="Account Management"
        description="Every student joins Haven through an ID issued here. Issue student IDs, add staff administrators, reset passwords, and control who can manage accounts."
        actions={
          <div className="flex flex-wrap gap-2">
            {isChief && (
              <Button variant="secondary" onClick={() => openCreateModal("admin")}>
                <ShieldCheck className="size-4" />
                Add Administrator
              </Button>
            )}
            <Button variant="primary" onClick={() => openCreateModal("student")}>
              <Plus className="size-4" />
              Issue Student ID
            </Button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
        <Stat label="Total Accounts" value={String(totalCount)} icon={Users} tone="pine" />
        <Stat label="Student IDs" value={String(studentCount)} icon={GraduationCap} tone="lavender" />
        <Stat label="Administrators" value={String(adminCount)} icon={ShieldCheck} tone="brass" />
        <Stat
          label="Profiles Pending"
          value={String(pendingProfiles)}
          tone={pendingProfiles > 0 ? "clay" : "mint"}
          trend={{ direction: "flat", text: `${activeCount} accounts active` }}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardBody className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-12">
            {/* Search Input */}
            <div className="sm:col-span-3 lg:col-span-6 relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6F6A62]">
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
                <option value="chief">Chief Administrator</option>
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
                <tr className="border-b border-[#E8E2D7] bg-[#F7F4EE]/75 text-[13px] font-medium text-[#6F6A62]">
                  <th className="py-3.5 pl-6 pr-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Created</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D7]">
                {filteredAccounts.slice(0, visible).map((account) => {
                  const isActive = (account.status || "active") === "active";
                  const isMasterAdmin = Boolean(account.isChief);
                  const linkedStudent = account.studentId ? studentById.get(account.studentId) : null;
                  // Delegated admins manage student IDs; only the chief manages other administrators.
                  const lockedForMe = isMasterAdmin || (account.role === "admin" && !isChief);
                  const isCurrent = currentUser?.id === account.id || currentUser?.username === account.username;

                  return (
                    <tr
                      key={account.id}
                      className="group transition-colors hover:bg-[#F7F4EE]/60"
                    >
                      {/* User Info */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={account.name} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#24221F]">
                                {account.name}
                              </span>
                              {isCurrent && (
                                <span className="rounded-full bg-[#ECEFF8] px-2 py-0.5 text-[10px] font-bold text-[#3E5BA9]">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-[#2F4785] font-medium">
                                @{account.username}
                              </span>
                              {linkedStudent && (
                                <Link
                                  to={`/students/${linkedStudent.id}`}
                                  className="text-[11px] text-[#6F6A62] hover:text-[#3E5BA9] hover:underline"
                                >
                                  {linkedStudent.profileComplete ? "View profile" : "Profile pending"}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {account.isChief ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2A93B]/30 bg-[#FDF6E6] px-2.5 py-1 text-xs font-semibold text-[#87600F]">
                            <Crown className="size-3.5" />
                            Chief Administrator
                          </span>
                        ) : account.role === "admin" ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#3E5BA9]/20 bg-[#ECEFF8] px-2.5 py-1 text-xs font-semibold text-[#2F4785]">
                              <ShieldCheck className="size-3.5" />
                              Administrator
                            </span>
                            {isChief ? (
                              <button
                                type="button"
                                onClick={() => handlePermissionToggle(account)}
                                aria-pressed={Boolean(account.canManageAccounts)}
                                title={account.canManageAccounts ? "Remove Accounts access" : "Grant Accounts access"}
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                                  account.canManageAccounts
                                    ? "text-[#2F855A] hover:bg-[#E5F2E9]"
                                    : "text-[#6F6A62] hover:bg-[#F0ECE4]"
                                }`}
                              >
                                {account.canManageAccounts ? <Unlock className="size-3" /> : <Lock className="size-3" />}
                                {account.canManageAccounts ? "Accounts access on" : "No Accounts access"}
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#6F6A62]">
                                {account.canManageAccounts ? "Accounts access on" : "No Accounts access"}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#EEE9F6] bg-[#FAF8FD] px-2.5 py-1 text-xs font-semibold text-[#5B4590]">
                            <GraduationCap className="size-3.5" />
                            Resident Student
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2E9] px-2.5 py-1 text-xs font-semibold text-[#2F855A]">
                            <span className="size-1.5 rounded-full bg-[#2F855A]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF3F0] px-2.5 py-1 text-xs font-semibold text-[#B5483B]">
                            <span className="size-1.5 rounded-full bg-[#B5483B]" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 hidden md:table-cell text-xs text-[#6F6A62]">
                        {account.createdAt ? account.createdAt.slice(0, 10) : "2026-10-01"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => openResetModal(account)}
                            disabled={lockedForMe && !isCurrent}
                            title={lockedForMe && !isCurrent ? "Only the chief administrator can reset this password" : "Reset Password"}
                            aria-label={`Reset password for ${account.name}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E8E2D7] bg-white px-2.5 py-1.5 text-xs font-medium text-[#24221F] hover:bg-[#F7F4EE] hover:text-[#3E5BA9] hover:border-[#3E5BA9]/30 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <KeyRound className="size-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                          </button>

                          {/* Toggle Status (Active / Deactivated) */}
                          <button
                            type="button"
                            onClick={() => openStatusModal(account)}
                            disabled={lockedForMe || isCurrent}
                            title={
                              isMasterAdmin
                                ? "The chief administrator cannot be deactivated"
                                : lockedForMe
                                  ? "Only the chief administrator can change administrator accounts"
                                : isCurrent
                                  ? "Cannot deactivate your own current session"
                                  : isActive
                                    ? "Deactivate account"
                                    : "Reactivate account"
                            }
                            aria-label={`${isActive ? "Deactivate" : "Activate"} account for ${account.name}`}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors shadow-2xs ${
                              lockedForMe || isCurrent
                                ? "cursor-not-allowed border-[#E8E2D7] bg-[#F7F4EE] text-[#6F6A62]/40"
                                : isActive
                                  ? "cursor-pointer border-[#E8E2D7] bg-white text-[#B5483B] hover:bg-[#FDF3F0] hover:border-[#B5483B]/30"
                                  : "cursor-pointer border-[#E8E2D7] bg-white text-[#2F855A] hover:bg-[#E5F2E9] hover:border-[#2F855A]/30"
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
                            disabled={lockedForMe || isCurrent}
                            title={
                              isMasterAdmin
                                ? "The chief administrator cannot be deleted"
                                : lockedForMe
                                  ? "Only the chief administrator can delete administrator accounts"
                                : isCurrent
                                  ? "Cannot delete current session"
                                  : "Delete account"
                            }
                            aria-label={`Delete account for ${account.name}`}
                            className={`p-1.5 rounded-lg border border-[#E8E2D7] text-[#6F6A62] transition-colors shadow-2xs ${
                              lockedForMe || isCurrent
                                ? "cursor-not-allowed opacity-30 bg-[#F7F4EE]"
                                : "cursor-pointer hover:bg-[#FDF3F0] hover:text-[#B5483B] hover:border-[#B5483B]/30"
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
            {filteredAccounts.length > visible && (
              <div className="flex items-center justify-between gap-3 border-t border-[#E8E2D7] px-6 py-3.5 text-[13px] text-[#6F6A62]">
                <span>
                  Showing {visible} of {filteredAccounts.length} accounts
                </span>
                <Button variant="secondary" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE * 2)}>
                  Show more
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* DIALOG 1: CREATE ACCOUNT */}
      <Dialog
        open={modal?.type === "create"}
        onClose={() => setModal(null)}
        title={newRole === "student" ? "Issue a Student ID" : "Add an Administrator"}
        description={
          newRole === "student"
            ? "Create the student's login. This is the only way a student is added to Haven."
            : "Create a staff login for the warden console."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              {newRole === "student" ? "Issue ID and Add Student" : "Create Administrator"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-[#B5483B]/20 bg-[#FDF3F0] p-3 text-xs text-[#B5483B] font-medium leading-relaxed">
              {formError}
            </div>
          )}

          {/* Role selector (only the chief administrator can add administrators) */}
          {isChief && (
            <Field label="Account type" required>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["student", GraduationCap, "Student ID"],
                  ["admin", ShieldCheck, "Administrator"],
                ].map(([role, Icon, label]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => switchRole(role)}
                    aria-pressed={newRole === role}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-[13px] font-medium transition-colors cursor-pointer ${
                      newRole === role
                        ? "border-[#3E5BA9] bg-[#ECEFF8] text-[#2F4785]"
                        : "border-[#E8E2D7] bg-white text-[#6F6A62] hover:bg-[#F7F4EE]"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {newRole === "student" && (
            <div className="rounded-xl border border-[#E8E2D7] bg-[#FAF8F3] p-3.5 text-[13px] leading-relaxed text-[#58534B]">
              Issuing an ID adds this student to the Student Directory straight away. They'll add their course,
              contact, personal and guardian details the first time they sign in.
            </div>
          )}

          {/* Full Name */}
          <Field label={newRole === "student" ? "Student's full name" : "Full name"} required>
            <TextInput
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={newRole === "student" ? "e.g. Aarav Sharma" : "e.g. Harjit Kaur"}
            />
          </Field>

          {/* Username / Student ID */}
          <Field
            label={newRole === "student" ? "Student ID" : "Username"}
            required
            hint={
              newRole === "student"
                ? "Next free ID is filled in for you. The student signs in with it."
                : "Used to sign in to the warden console."
            }
          >
            <TextInput
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={newRole === "student" ? "e.g. STU2026315" : "e.g. warden.harjit"}
              className={newRole === "student" ? "font-mono" : undefined}
            />
          </Field>

          {/* Initial Password */}
          <Field label="Initial password" required>
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

          {newRole === "admin" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E8E2D7] p-3.5">
              <input
                type="checkbox"
                checked={newCanManage}
                onChange={(e) => setNewCanManage(e.target.checked)}
                className="mt-0.5 size-4 cursor-pointer rounded accent-[#3E5BA9]"
              />
              <span>
                <span className="block text-sm font-medium text-[#24221F]">Allow access to Accounts</span>
                <span className="block text-[13px] text-[#6F6A62]">
                  They can issue and delete student IDs and reset student passwords. Leave off for a standard
                  administrator. You can change this later.
                </span>
              </span>
            </label>
          )}
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
          <div className="rounded-xl border border-[#E8E2D7] bg-[#F7F4EE] p-3 text-xs text-[#6F6A62]">
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
                {copied ? <Check className="size-3.5 text-[#2F855A]" /> : <Copy className="size-3.5" />}
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
        <p className="text-xs text-[#6F6A62] leading-relaxed">
          {modal?.account?.status === "deactivated"
            ? "The user will retain all existing hostel data, room assignments, and history upon reactivation."
            : "The account credentials will be kept on file, but login attempts will be rejected with an administrative deactivation notice."}
        </p>
      </Dialog>

      {/* DIALOG 4: DELETE ACCOUNT */}
      <Dialog
        open={modal?.type === "delete"}
        onClose={() => setModal(null)}
        title={
          modal?.account?.role === "student"
            ? `Delete student ${modal?.account?.username}?`
            : `Delete account @${modal?.account?.username}?`
        }
        description={
          modal?.account?.role === "student"
            ? `${modal?.account?.name}'s student ID and their record in the Student Directory will both be deleted.`
            : `Are you sure you want to permanently delete the login for ${modal?.account?.name}?`
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteSubmit}>
              {modal?.account?.role === "student" ? "Delete Student" : "Delete Account"}
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#6F6A62] leading-relaxed">
          {modal?.account?.role === "student"
            ? "Their bed is freed and their profile details are removed. Complaints they filed stay archived for hostel audits."
            : "This removes the administrator's login. Hostel records they created are not affected."}
        </p>
      </Dialog>
    </Page>
  );
}
