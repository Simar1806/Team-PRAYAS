import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { formatFullDate, getStudent, greeting } from "../../data/selectors.js";
import { Page, PageHeader } from "../../components/layout/index.js";
import { Badge } from "../../components/ui/index.js";
import { StudentDashboard } from "./StudentDashboard.jsx";
import { AdminDashboard } from "./AdminDashboard.jsx";

export function Dashboard() {
  const { role, studentId } = useView();
  const { state } = useHaven();
  const student = getStudent(state.students, studentId);
  const firstName = student ? student.name.split(" ")[0] : "Resident";
  const isAdmin = role === "admin";

  return (
    <Page>
      <PageHeader
        eyebrow={isAdmin ? "Administration Console" : "Resident Portal"}
        title={`${greeting()}, ${isAdmin ? "Warden" : firstName}`}
        description={`${formatFullDate()} · ${
          isAdmin
            ? "Live operational overview across all residence blocks"
            : student?.roomId
              ? `${student.studentCode} · Block ${student.block} · Room ${student.roomId} · Bed ${student.bed}`
              : `${student?.studentCode || ""} · Room not yet allotted`
        }`}
        actions={
          <Badge tone={isAdmin ? "pine" : "mint"} dot size="md">
            {isAdmin ? "Admin Online" : "Resident Active"}
          </Badge>
        }
      />
      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </Page>
  );
}
