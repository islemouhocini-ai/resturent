import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../../lib/staff-auth";
import { getSiteContent, saveSiteContent } from "../../../../lib/site-content";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireStaffRole("admin");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json({ user, content });
}

export async function PUT(request) {
  const user = await requireStaffRole("admin");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const content = await saveSiteContent({
    menuItems: Array.isArray(body?.menuItems) ? body.menuItems : [],
    chefs: Array.isArray(body?.chefs) ? body.chefs : [],
    galleryItems: Array.isArray(body?.galleryItems) ? body.galleryItems : []
  });

  return NextResponse.json({ user, content, saved: true });
}
