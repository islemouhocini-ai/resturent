import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../../lib/staff-auth";
import {
  hasSupabaseConfig,
  uploadSupabaseStorageObject
} from "../../../../lib/supabase-rest";

export const runtime = "nodejs";

const allowedCollections = new Set(["menu", "chefs", "gallery"]);
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const maxFileSize = 8 * 1024 * 1024;

function getUploadCollection(value) {
  if (allowedCollections.has(value)) {
    return value;
  }

  return "gallery";
}

function getSafeExtension(file) {
  const fileName = typeof file?.name === "string" ? file.name : "";
  const extension = path.extname(fileName).toLowerCase();

  if (allowedExtensions.has(extension)) {
    return extension;
  }

  if (file?.type === "image/png") {
    return ".png";
  }

  if (file?.type === "image/webp") {
    return ".webp";
  }

  if (file?.type === "image/gif") {
    return ".gif";
  }

  if (file?.type === "image/svg+xml") {
    return ".svg";
  }

  return ".jpg";
}

export async function POST(request) {
  const user = await requireStaffRole("admin");

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const collection = getUploadCollection(formData.get("collection"));

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Please choose an image to upload." }, { status: 400 });
  }

  const extension = getSafeExtension(file);
  const hasAllowedType = !file.type || allowedMimeTypes.has(file.type);

  if (!hasAllowedType || !allowedExtensions.has(extension)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, GIF, and SVG images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "Image is too large. Please keep it under 8 MB." },
      { status: 400 }
    );
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", collection);
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (hasSupabaseConfig()) {
    try {
      const objectPath = `${collection}/${fileName}`;
      const uploaded = await uploadSupabaseStorageObject({
        objectPath,
        body: bytes,
        contentType: file.type || "application/octet-stream"
      });

      return NextResponse.json({
        uploaded: true,
        url: uploaded.publicUrl,
        storage: "supabase"
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not upload the image to Supabase Storage."
        },
        { status: 500 }
      );
    }
  }

  const outputPath = path.join(uploadDirectory, fileName);
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(outputPath, bytes);

  return NextResponse.json({
    uploaded: true,
    url: `/uploads/${collection}/${fileName}`,
    storage: "local"
  });
}
