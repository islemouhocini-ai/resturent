import { redirect } from "next/navigation";
import AdminDashboard from "../components/AdminDashboard";
import { requireStaffRole } from "../../lib/staff-auth";

export const metadata = {
  title: "Admin Console",
  description: "Internal admin dashboard for Rivolta operations and support activity."
};

export default async function AdminPage({ searchParams }) {
  const user = await requireStaffRole("admin");

  if (!user) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const initialView = resolvedSearchParams?.view || "dashboard";

  return <AdminDashboard user={user} initialView={initialView} />;
}
