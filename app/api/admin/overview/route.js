import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../../lib/staff-auth";
import { listReservationRequests } from "../../../../lib/reservation-store";
import { listConversations } from "../../../../lib/support-store";
import { getStorageMode } from "../../../../lib/supabase-rest";

export const runtime = "nodejs";

function isToday(value) {
  const now = new Date();
  const date = new Date(value);

  return (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  );
}

export async function GET() {
  const user = await requireStaffRole("admin");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await listConversations();
  const reservations = await listReservationRequests();
  const openTickets = conversations.filter(
    (conversation) => conversation.status === "open"
  );
  const waitingOnTeam = conversations.filter((conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return (
      conversation.handoffRequested &&
      lastMessage &&
      lastMessage.role !== "support"
    );
  });
  const activeToday = conversations.filter((conversation) =>
    isToday(conversation.updatedAt)
  );
  const supportRepliesToday = conversations.reduce((count, conversation) => {
    return (
      count +
      conversation.messages.filter(
        (message) => message.role === "support" && isToday(message.createdAt)
      ).length
    );
  }, 0);
  const reservationsToday = reservations.filter((reservation) =>
    isToday(reservation.createdAt)
  );

  return NextResponse.json({
    user,
    storageMode: getStorageMode(),
    stats: {
      totalTickets: conversations.length,
      openTickets: openTickets.length,
      waitingOnTeam: waitingOnTeam.length,
      activeToday: activeToday.length,
      supportRepliesToday,
      totalReservations: reservations.length,
      reservationsToday: reservationsToday.length
    },
    recentConversations: conversations.slice(0, 6),
    recentReservations: reservations.slice(0, 6)
  });
}
