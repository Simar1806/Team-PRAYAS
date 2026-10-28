import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../../components/layout/Logo.jsx";
import { Card, CardBody, useToast } from "../../components/ui/index.js";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { StudentForm } from "./StudentForm.jsx";

/**
 * First sign-in for a newly issued student ID: the administrator created the
 * login (name + ID), and the resident completes the remaining sections here
 * before the portal opens.
 */
export function ProfileSetup({ student }) {
  const { logout } = useView();
  const { dispatch } = useHaven();
  const pushToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    // The name is issued by the hostel office, so it is not taken from the form.
    const { name: _name, ...profile } = data;
    dispatch(actions.updateStudent(student.id, profile, true));
    pushToast("success", "Profile complete", "Welcome to Haven. Your resident portal is ready.");
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-[#F7F4EE]">
      <header className="top-bar">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo compact />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#6F6A62] transition-colors hover:bg-[#FDF3F0] hover:text-[#B5483B]"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-[13px] font-medium text-[#9A7B4F]">Step 2 of 2 · Resident profile</p>
        <h1 className="mt-2 font-display text-[1.75rem] leading-tight font-semibold text-[#24221F] sm:text-[2rem]">
          Welcome, {student.name.split(" ")[0]}. Let's finish your profile.
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#6F6A62]">
          The hostel office has issued your student ID. Add a few details below so the warden can reach you and
          your family, then your portal opens.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5 text-[13px]">
          <span className="rounded-lg border border-[#E8E2D7] bg-white px-3 py-1.5 text-[#6F6A62]">
            Student ID <span className="ml-1 font-mono font-medium text-[#2F4785]">{student.studentCode}</span>
          </span>
          <span className="rounded-lg border border-[#E8E2D7] bg-white px-3 py-1.5 text-[#6F6A62]">
            Room <span className="ml-1 font-medium text-[#24221F]">{student.roomId || "To be allotted"}</span>
          </span>
        </div>

        <Card className="mt-6">
          <CardBody className="p-5 sm:p-7">
            <StudentForm initial={student} lockName submitLabel="Save and open my portal" onSubmit={handleSubmit} />
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
