import { hashPassword } from "./password-utils";
import { hasSupabaseConfig, supabaseRequest } from "./supabase-rest";

function createLocalUser({
  id,
  email,
  password,
  role,
  displayName,
  salt
}) {
  return {
    id,
    email: email.toLowerCase(),
    role,
    displayName,
    passwordHash: hashPassword(password, salt)
  };
}

function getLocalUsers() {
  return [
    createLocalUser({
      id: "local-support",
      email: process.env.LOCAL_SUPPORT_EMAIL || "support@rivolta.local",
      password: process.env.LOCAL_SUPPORT_PASSWORD || "Support123!",
      role: "support",
      displayName: "Support Desk",
      salt: "rivolta-support-local-salt"
    }),
    createLocalUser({
      id: "local-admin",
      email: process.env.LOCAL_ADMIN_EMAIL || "admin@rivolta.local",
      password: process.env.LOCAL_ADMIN_PASSWORD || "Admin123!",
      role: "admin",
      displayName: "Admin Desk",
      salt: "rivolta-admin-local-salt"
    })
  ];
}

function normalizeSupabaseUser(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    email: record.email,
    role: record.role,
    displayName: record.display_name || record.displayName || "Staff user",
    passwordHash: record.password_hash || record.passwordHash
  };
}

export async function findStaffUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  if (!hasSupabaseConfig()) {
    return (
      getLocalUsers().find((user) => user.email === normalizedEmail) || null
    );
  }

  const rows = await supabaseRequest(
    `staff_users?select=id,email,display_name,role,password_hash&email=eq.${encodeURIComponent(
      normalizedEmail
    )}&limit=1`
  );

  return normalizeSupabaseUser(rows?.[0] || null);
}
