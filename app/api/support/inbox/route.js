import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../../lib/staff-auth";
import { listConversations } from "../../../../lib/support-store";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireStaffRole("support");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = (await listConversations()).filter(
    (conversation) => conversation.status !== "closed"
  );

  return NextResponse.json({ conversations, user });
}
