import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(
  password,
  salt = randomBytes(16).toString("hex")
) {
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `s2:${salt}:${digest}`;
}

export function verifyPassword(password, storedHash) {
  const [version, salt, digest] = String(storedHash || "").split(":");

  if (version !== "s2" || !salt || !digest) {
    return false;
  }

  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(
    scryptSync(password, salt, expected.length).toString("hex"),
    "hex"
  );

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
