import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../../../lib/staff-auth";
import {
  closeConversationById,
  deleteConversation,
  setConversationStaffTyping
} from "../../../../../lib/support-store";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const user = await requireStaffRole("support");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const resolvedParams = await params;
  const conversationId = resolvedParams.conversationId;

  if (body?.action === "typing") {
    const conversation = await setConversationStaffTyping(
      conversationId,
      Boolean(body.value)
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  }

  if (body?.action === "close") {
    const conversation = await closeConversationById(conversationId, user.role);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  }

  return NextResponse.json(
    { error: "Unsupported action." },
    { status: 400 }
  );
}

export async function DELETE(_request, { params }) {
  const user = await requireStaffRole("support");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const deleted = await deleteConversation(resolvedParams.conversationId);

  if (!deleted) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
