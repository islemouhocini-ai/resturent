import { redirect } from "next/navigation";
import SupportInbox from "../components/SupportInbox";
import { requireStaffRole } from "../../lib/staff-auth";

export const metadata = {
  title: "Support Inbox",
  description: "Internal support inbox for Rivolta human handoffs."
};

export default async function SupportPage() {
  const user = await requireStaffRole("support");

  if (!user) {
    redirect("/");
  }

  return <SupportInbox user={user} />;
}
