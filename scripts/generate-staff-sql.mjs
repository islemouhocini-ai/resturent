import { randomBytes, scryptSync } from "node:crypto";

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `s2:${salt}:${digest}`;
}

const [adminEmail, adminPassword, supportEmail, supportPassword] =
  process.argv.slice(2);

if (!adminEmail || !adminPassword || !supportEmail || !supportPassword) {
  console.error(
    "Usage: npm run make-staff-sql -- <admin-email> <admin-password> <support-email> <support-password>"
  );
  process.exit(1);
}

const adminHash = hashPassword(adminPassword);
const supportHash = hashPassword(supportPassword);

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

const sql = `insert into public.staff_users (email, display_name, role, password_hash)
values
  ('${escapeSql(supportEmail)}', 'Support Desk', 'support', '${escapeSql(supportHash)}'),
  ('${escapeSql(adminEmail)}', 'Admin Desk', 'admin', '${escapeSql(adminHash)}')
on conflict (email) do update
set
  display_name = excluded.display_name,
  role = excluded.role,
  password_hash = excluded.password_hash;`;

console.log(sql);
