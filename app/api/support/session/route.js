import { NextResponse } from "next/server";
import {
  closeConversationBySession,
  createOrUpdateConversation,
  deleteConversationBySession,
  getConversationBySession
} from "../../../../lib/support-store";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required." },
      { status: 400 }
    );
  }

  const conversation = await getConversationBySession(sessionId);
  return NextResponse.json({ conversation });
}

export async function POST(request) {
  const body = await request.json();

  if (!body?.sessionId) {
    return NextResponse.json(
      { error: "sessionId is required." },
      { status: 400 }
    );
  }

  if (body.deleteTicket) {
    const deleted = await deleteConversationBySession(body.sessionId);
    return NextResponse.json({ success: deleted });
  }

  if (body.closeTicket) {
    const conversation = await closeConversationBySession(body.sessionId, "user");
    return NextResponse.json({ conversation });
  }

  const conversation = await createOrUpdateConversation({
    sessionId: body.sessionId,
    requestHuman: Boolean(body.requestHuman),
    transcript: Array.isArray(body.transcript) ? body.transcript : [],
    userMessage: body.userMessage
  });

  return NextResponse.json({ conversation });
}
