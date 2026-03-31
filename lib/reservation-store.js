import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "reservation-requests.json");

function nowIso() {
  return new Date().toISOString();
}

function normalizeReservation(reservation) {
  return {
    id: reservation.id,
    name: reservation.name || "",
    email: reservation.email || "",
    reservationDate:
      reservation.reservationDate || reservation.reservation_date || "",
    guests: reservation.guests || "",
    notes: reservation.notes || "",
    status: reservation.status || "new",
    createdAt: reservation.createdAt || reservation.created_at || nowIso(),
    updatedAt: reservation.updatedAt || reservation.updated_at || nowIso()
  };
}

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, "[]", "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");

  try {
    return JSON.parse(raw).map(normalizeReservation);
  } catch {
    return [];
  }
}

async function writeStore(reservations) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(reservations, null, 2), "utf8");
}

function sortByCreated(reservations) {
  return [...reservations].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function listReservationRequests() {
  if (!hasSupabaseConfig()) {
    return sortByCreated(await readStore());
  }

  const rows =
    (await supabaseRequest(
      "reservation_requests?select=id,name,email,reservation_date,guests,notes,status,created_at,updated_at&order=created_at.desc"
    )) || [];

  return rows.map(normalizeReservation);
}

export async function createReservationRequest({
  name,
  email,
  reservationDate,
  guests,
  notes
}) {
  const payload = normalizeReservation({
    id: randomUUID(),
    name: String(name || "").trim(),
    email: String(email || "").trim().toLowerCase(),
    reservationDate: String(reservationDate || "").trim(),
    guests: String(guests || "").trim(),
    notes: String(notes || "").trim(),
    status: "new",
    createdAt: nowIso(),
    updatedAt: nowIso()
  });

  if (!hasSupabaseConfig()) {
    const reservations = await readStore();
    reservations.unshift(payload);
    await writeStore(reservations);
    return payload;
  }

  const rows = await supabaseRequest("reservation_requests", {
    method: "POST",
    body: [
      {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        reservation_date: payload.reservationDate,
        guests: payload.guests,
        notes: payload.notes,
        status: payload.status,
        created_at: payload.createdAt,
        updated_at: payload.updatedAt
      }
    ],
    headers: { Prefer: "return=representation" }
  });

  return normalizeReservation(rows?.[0] || payload);
}
