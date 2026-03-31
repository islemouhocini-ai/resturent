import { NextResponse } from "next/server";
import {
  authenticateStaff,
  clearStaffAuthCookie,
  requireStaffRole,
  setStaffAuthCookie
} from "../../../../lib/staff-auth";
import { getStorageMode } from "../../../../lib/supabase-rest";

export const runtime = "nodejs";

function normalizeScope(scope) {
  if (scope === "admin") {
    return "admin";
  }

  if (scope === "support") {
    return "support";
  }

  return "staff";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scope = normalizeScope(searchParams.get("scope"));
  const user = await requireStaffRole(scope);

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
    storageMode: getStorageMode()
  });
}

export async function POST(request) {
  const body = await request.json();
  const scope = normalizeScope(body?.scope);
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { authenticated: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await authenticateStaff(email, password, scope);

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
        error: "Email, password, or role access is not correct."
      },
      { status: 401 }
    );
  }

  await setStaffAuthCookie(user);

  return NextResponse.json({
    authenticated: true,
    user,
    storageMode: getStorageMode()
  });
}

export async function DELETE() {
  await clearStaffAuthCookie();

  return NextResponse.json({
    authenticated: false,
    user: null,
    storageMode: getStorageMode()
  });
}
