import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { verifyPassword } from "./password-utils";
import { findStaffUserByEmail } from "./staff-store";

export const STAFF_COOKIE_NAME = "rivolta_staff_session";

const sessionMaxAgeSeconds = 60 * 60 * 12;

function getSessionSecret() {
  return (
    process.env.STAFF_SESSION_SECRET ||
    "rivolta-local-session-secret-change-me"
  );
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function safeEqualString(left, right) {
  const leftBuffer = Buffer.from(left || "", "utf8");
  const rightBuffer = Buffer.from(right || "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeStaffUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName || user.email.split("@")[0]
  };
}

function createSessionToken(user) {
  const payload = base64UrlEncode(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      exp: Date.now() + sessionMaxAgeSeconds * 1000
    })
  );

  return `${payload}.${signPayload(payload)}`;
}

function parseSessionToken(token) {
  const [payload, signature] = String(token || "").split(".");

  if (!payload || !signature || !safeEqualString(signature, signPayload(payload))) {
    return null;
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload));

    if (!data?.exp || Date.now() > data.exp) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      displayName: data.displayName
    };
  } catch {
    return null;
  }
}

export function roleHasAccess(userRole, requiredRole = "staff") {
  if (requiredRole === "staff") {
    return userRole === "support" || userRole === "admin";
  }

  if (requiredRole === "support") {
    return userRole === "support" || userRole === "admin";
  }

  return userRole === "admin";
}

export async function authenticateStaff(email, password, requiredRole = "staff") {
  const user = await findStaffUserByEmail(email);

  if (!user || !roleHasAccess(user.role, requiredRole)) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return normalizeStaffUser(user);
}

export async function getAuthenticatedStaff() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  return parseSessionToken(token);
}

export async function requireStaffRole(requiredRole = "staff") {
  const user = await getAuthenticatedStaff();

  if (!user || !roleHasAccess(user.role, requiredRole)) {
    return null;
  }

  return user;
}

export async function setStaffAuthCookie(user) {
  const cookieStore = await cookies();

  cookieStore.set(STAFF_COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  });
}

export async function clearStaffAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
}
