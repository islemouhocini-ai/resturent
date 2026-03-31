import { NextResponse } from "next/server";
import { createReservationRequest, listReservationRequests } from "../../../lib/reservation-store";
import { requireStaffRole } from "../../../lib/staff-auth";

export const runtime = "nodejs";

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export async function GET() {
  const user = await requireStaffRole("staff");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reservations = await listReservationRequests();
  return NextResponse.json({ reservations, user });
}

export async function POST(request) {
  const body = await request.json();

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!isEmailValid(body?.email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  if (!body?.reservationDate?.trim()) {
    return NextResponse.json(
      { error: "Reservation date is required." },
      { status: 400 }
    );
  }

  if (!body?.guests?.trim()) {
    return NextResponse.json(
      { error: "Guest count is required." },
      { status: 400 }
    );
  }

  const reservation = await createReservationRequest({
    name: body.name,
    email: body.email,
    reservationDate: body.reservationDate,
    guests: body.guests,
    notes: body.notes
  });

  return NextResponse.json({ success: true, reservation });
}
