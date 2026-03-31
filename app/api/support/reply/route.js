import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../../lib/staff-auth";
import { addSupportReply } from "../../../../lib/support-store";

export const runtime = "nodejs";

export async function POST(request) {
  const user = await requireStaffRole("support");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body?.conversationId || !body?.text?.trim()) {
    return NextResponse.json(
      { error: "conversationId and text are required." },
      { status: 400 }
    );
  }

  const conversation = await addSupportReply(body.conversationId, body.text.trim());

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ conversation });
}
